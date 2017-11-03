var events = require('events');
var util = require('util');
var _ = require('underscore');

var _gcm = require("../init/gcm.js");
const BU = require('base-util-jh').baseUtil;
var BI = require("../db/bi.js")

var ResetSaltpondDeviceID = "DeviceClose";  // 제어 모드가 변경될 경우 장치 상태를 All Off로 변경시키는 예약 명령어
var GoToSea = "GoToSea";  // 우천 대피가 완료됐을 경우 Setting Control에서 가져올 명령어
var EvaporatingPond = "Evaporating Pond";   // 증발지 자동 급수 탐색 값. 맵 생성시 증발지는 반드시 Plate Type에 입력. 변경시 해당 변수 이름 변경



var AlarmError = "1";   // 장치 이상
var AlarmAlarm = "2";   // 최대 수위 도달, 최저 수위 도달, 설정 염도 도달, 우천 감지
var AlarmControl = "3";    // 장치 개폐

var WaterTankFeedDelayHour = 0; // 해주 급수 후 재사용 시간
var WaterTankFeedDelayMin = 3; // 해주 급수 후 재사용 분(3분 후)
//var WaterTankFeedDelaySec = 0; // 해주 급수 후 재사용 초




// 수동 모드
var ManualMode = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    var SaltData = Salt.SaltData;
    //var BI = self.main.BI;
    
    self.StartMode = function (CallBack){
        var SettingControlList = SaltData["SettingControlList"];
        var SettingObj = _.findWhere(SettingControlList, { "ID" : ResetSaltpondDeviceID });
        //self.main.Control.ControlType = "Manual";
        SendPush("Manual");
        self.main.controlSerialData.emit("RunSettingCMD", SettingObj);
        
        CallBack("", "Manual");
    }
    
    // 장치 값에 따른 급수 대상 제거
    self.RemoveFeedWater = function (ChildID){
        //BU.log("self.RemoveFeedWater");
        var ParentsList = Salt.FindParent(ChildID, "WaterLevel");
        var Parents = ParentsList[0];
        var ParentsStatus = Parents.GetStatus();
        
        if (ParentsStatus["WaterLevel"] === "") {
            BU.log("현재 수위를 알수없습니다. 대상 : " + FindObjName(Parents));
            return;
        }
        
        // 한계수위 초과시 급수 제거(수위 초과, 삭제진행명령리스트 존재 X, 장치들중 열려있는게 있을 경우)
        if (ParentsStatus["WaterLevel"] >= ParentsStatus["MaxWaterLevel"]) {
            //BU.log("한계수위 초과")
            
            var OpenedDeviceList = [];

            var OpenedWaterDoorList = _.where(ParentsStatus["InWaterDoorList"], { "Value" : "1" });
            var OpenedValveList = _.where(ParentsStatus["ValveList"], { "Value" : "1" });
            
            _.each(OpenedWaterDoorList, function (WaterDoor) {
                //BU.log("!@#!@#!@       " + WaterDoor["ID"]);
                //BU.log();
                OpenedDeviceList.push(WaterDoor["ID"]);
            });
            
            _.each(OpenedValveList, function (Valve) {
                OpenedDeviceList.push(Valve["ID"]);
            });

            //var OpenedDeviceList = _.union(OpenedWaterDoorList, OpenedValveList);
            
            //OpenedDeviceList = _.uniq(OpenedDeviceList);

            //BU.CLI(OpenedDeviceList);

            if (!BU.isEmpty(OpenedDeviceList)) {
                self.main.controlSerialData.emit("SetDeviceList", OpenedDeviceList, "0", function (err, result) {
                    if (err) {
                        BU.log("UpdateWaterLevel 스탑 에러 : " + err);
                        self.main.controlSerialData.emit("SetDeviceList", OpenedDeviceList, "0", function (err, result) {BU.log("한번더 요청")});
                    }
                });
            }
        }
    }
    
    // 개별 장치 제어
    self.DeviceOrder = function (DeviceID, DeviceValue, DeviceType, CallBack){
        var sendObj = {};
        var FindObj = Salt.FindObj(DeviceID);
        var FindObjStatus = FindObj.GetStatus();
        if (FindObjStatus["IsError"] != "0") {
            sendObj["IsError"] = 1;
            sendObj["Message"] = "장치(" + FindObjName(DeviceID) + ")가 정상적으로 동작하지 않습니다.";
            CallBack(sendObj);
            return;
        }
        if (FindObjStatus["Value"] == DeviceValue) {
            sendObj["IsError"] = 1;
            sendObj["Message"] = "이미 같은 상태입니다.";
            CallBack(sendObj);
            return;
        }
        
        var ParentsList = Salt.FindParent(DeviceID, DeviceType);
        var IsPossible = true;
        var ImpossibleObj;
        
        _.each(ParentsList, function (Parents) {
            var ParentsStatus = Parents.GetStatus();
            var ParentsRelation = Parents.GetRelation();
            if (ParentsStatus["WaterLevel"] >= ParentsStatus["MaxWaterLevel"] || ParentsStatus["WaterLevel"] >= ParentsStatus["SetWaterLevel"]) {
                var IsInWaterDoor = _.contains(ParentsRelation["ListInWaterDoor"], DeviceID);
                var IsValve = _.contains(ParentsRelation["ListValve"], DeviceID);
                
                if (IsInWaterDoor || IsValve) {
                    IsPossible = false;
                    ImpossibleObj = ParentsStatus;
                    return;
                }
            }
        });
        
        if (IsPossible) {
            self.main.controlSerialData.emit("SetDevice", DeviceID, DeviceValue, function (err) {
                if (err) {
                    sendObj["IsError"] = 1;
                    sendObj["Message"] = "DeviceOrder Error : " + DeviceID;
                    
                    BU.log("DeviceOrder Error : " + DeviceID);
                    var FindObj = Salt.FindObj(DeviceID);
                    FindObj.emit("UpdateData", "0", "1");

                    CallBack(sendObj);
                    return;
                }
                BU.log("장치(" + FindObjName(DeviceID) + ")의 상태를 변경합니다.");
                sendObj["IsError"] = 0;
                sendObj["Message"] = "장치(" + FindObjName(DeviceID) + ") 의 상태를 변경합니다.";
                CallBack("", sendObj);
            });
        }
        else {
            //BU.log(FindObjName(ImpossibleObj["ID"]) + "의 수위가 한계수위를 초과하여 장치를 제어할 수 없습니다.");
            sendObj["IsError"] = 1;
            sendObj["Message"] = FindObjName(ImpossibleObj["ID"]) + "의 수위가 한계수위를 초과하여 장치를 제어할 수 없습니다.";
            CallBack(sendObj);
        }
    }
    
    // 펌프 상태 변경시
    self.PumpStatusChange = function (DeviceID, IsPumpOn, CallBack){
        BU.log("PumpStatusChange");
        var Serviceable = [];
        GetPumpServiceable(DeviceID, function (result) { Serviceable.push(result) });
        
        if (_.contains(Serviceable, true))
            CallBack("");
        else {
            var sendObj = {};
            sendObj["IsError"] = 1;
            sendObj["Message"] = "밸브가 열려있지 않아 펌프를 작동할 수 없습니다.";
            CallBack(sendObj);
        }
    }
    
    // 밸브 상태를 변경에 따른 펌프 Off 수행
    self.ValveStatusChange = function (DeviceID, IsValvesOpen) {
        if (IsValvesOpen == "1")
            return;

        BU.log("ValveStatusChange");
        var PumpListValveRank = [];
        var PumpListValveRankServiceable = [];
        GetPumpListValveRank(DeviceID, function (result) {
            PumpListValveRank.push(result);
        });
        
        _.each(PumpListValveRank, function (PumpValveRank) {
            var PumpObj = {};
            PumpObj["ID"] = PumpValveRank;
            PumpObj["Serviceable"] = {};
            var Serviceable = [];
            GetPumpServiceable(PumpValveRank, function (result) {
                Serviceable.push(result);
            });
            
            if (!_.contains(Serviceable, true)) {
                self.main.controlSerialData.emit("SetDevice", PumpValveRank, IsValvesOpen, function (err, result) {
                    if (err) {
                        BU.log("ValveStatusChange DeviceOrder Error : " + PumpValveRank);
                        //var FindObj = Salt.FindObj(PumpValveRank);
                        //FindObj.emit("UpdateData", "0", "1");
                        return;
                    }
                    BU.log("밸브 변경에 따른 장치 제어를 완료하였습니다.");
                });
            }
        });
    }

    self.Reset = function (){
        //BU.log("Reset")
        if (global.fixmeConfig.isUsedSerial == "0" && self.main.controlSerialData.SocketClient == null) {
            setTimeout(function () {
                BU.log("소켓 연결이 순조롭지 않아 다시 실행(시리얼 사용 X)");
                self.Reset();
            }, 1000 * 3);
        }
        else if (global.fixmeConfig.isUsedSerial == "1" && (self.main.controlSerialData.SocketClient == null || self.main.controlSerialData.SerialClient == null)) {
            setTimeout(function () {
                BU.log("소켓 연결이 순조롭지 않아 다시 실행(시리얼 사용 0) : 혼합모드");
                self.Reset();
            }, 1000 * 3);
        }
        else if (global.fixmeConfig.isUsedSerial == "2" && (self.main.controlSerialData.SerialClient == null)) {
            setTimeout(function () {
                BU.log("소켓 연결이 순조롭지 않아 다시 실행(시리얼 사용 0) : 시리얼 독단");
                self.Reset();
            }, 1000 * 3);
        }
        else {
            SendPush("Manual");
            var SettingControlList = SaltData["SettingControlList"];
            var SettingObj = _.findWhere(SettingControlList, { "ID" : ResetSaltpondDeviceID });
            
            //BU.CLI(SettingObj);

            self.main.controlSerialData.emit("RunSettingCMD", SettingObj);
        }
        //BU.log(self.main.controlSerialData.SocketClient);
        //BU.log(self.main.controlSerialData.SerialClient);
    }


    var FindObjName = function (TargetID) {
        return Salt.FindObj(TargetID).Name;
    }

    // 최상위 펌프 리스트를 구하는 재귀 함수
    var GetPumpListValveRank = function (ValveID, CallBack) {
        var ValveRank = _.findWhere(SaltData["ValveRankList"], { "ID" : ValveID });
        var ValveRankHigh = ValveRank["High"];
        _.each(ValveRankHigh, function (High) {
            if (High.indexOf("P") == 0) {
                CallBack(High);
                return;
            }
            else
                GetPumpListValveRank(High, CallBack);
        });
    }
    
    var GetPumpServiceable = function (TargetID, CallBack) {
        var ValveRank = _.findWhere(SaltData["ValveRankList"], { "ID" : TargetID });
        var ValveRankLow = ValveRank["Low"];
        var ValveStatus = [];
        _.each(ValveRankLow, function (Low) {
            var LowStatus = Salt.FindObj(Low).GetStatus();
            if (LowStatus["ID"].indexOf("V") == -1) {
                CallBack(true);
                return true;
            }
            else {
                if (LowStatus["Value"] == "1") {
                    GetPumpServiceable(LowStatus["ID"], CallBack);
                }
                else {
                    CallBack(false);
                    return;
                }
            }
        });
        if (BU.isEmpty(ValveRankLow)) {
            //var LowStatus = Salt.FindParent(ValveRank["ID"]);
            CallBack(true);
            return true;
        }

    }

    var SendPush = function (ControlStatus) {
        self.main.Control.ControlType = ControlStatus;
        var SendObj = {};
        SendObj["CMD"] = "ControlStatus";
        SendObj["ControlStatus"] = ControlStatus;
        var pushServer = global.pushServer;
        pushServer.emit("sendAllClient", SendObj);
    }
}
util.inherits(ManualMode, events.EventEmitter);
exports.ManualMode = ManualMode;


// 자동 모드
var AutomationMode = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    var SaltData = Salt.SaltData;
    //var BI = self.main.BI;
    
    var CheckProgressTime = 20;         // 명령을 내리고 20초가 지나도 상태값이 바뀌지 않는다면 진행중인 명령 취소 후 장치값 복구
    
    self.IsStartAutomation = "0";
    
    self.ControlProgressList = [];          // 진행중인 명령
    self.ControlCompleteList = [];      // 완료된 명령
    self.ControlReferenceKeys = [];      // 제어장치 값
    
    self.DeletingCMD = [];      // 삭제중인 명령
    
    self.AutoStopForAutomation;
    
    self.StartMode = function (CallBack){
        BU.log("AutomationMode StartMode");
        var SettingControlList = SaltData["SettingControlList"];
        var SettingObj = _.findWhere(SettingControlList, { "ID" : ResetSaltpondDeviceID });
        if (CheckDeviceStatus(SettingObj)) {
            var err = {};
            err["IsError"] = "1";
            err["Message"] = "장치에 오류가 발생하여 명령을 수행할 수 없습니다.";
            BU.log("장치에 오류가 발생하여 명령을 수행할 수 없습니다.");
            CallBack(err);
            return;
        }
        SendPush("Auto");
        CallBack("", "Auto");
        MakeControlStatus();
        self.main.controlSerialData.emit("RunSettingCMD", SettingObj);
    }
    
    // 자동 모드 종료
    self.EndMode = function () {
        clearInterval(self.AutoStopForAutomation);
        self.IsStartAutomation = "0";
        self.ControlCompleteList = [];
        self.ControlProgressList = [];
        self.DeletingCMD = [];
        SendPushControlList();
    }
    
    self.OrderControlList = [];
    
    
    var IsOrderControlWork = "0";

    // 명령제어
    self.OrderControl = function (SimpleCMD, CallBack){
        if (IsOrderControlWork !== "0") {
            var OrderObj = {};
            OrderObj["CMD"] = SimpleCMD;
            OrderObj["CallBack"] = CallBack;
            self.OrderControlList.push(OrderObj);
        }
        //BU.log("OrderControl");
        var err = {};
        var ControlID = SimpleCMD["Src"] + "→" + SimpleCMD["Des"];
        //BU.log("명령하달 ControlID : " + ControlID);
        var ControlSetWaterLevel = SimpleCMD["SetWaterLevel"];
        var Src = SimpleCMD["Src"];
        var Des = SimpleCMD["Des"];
        
        var SrcObj = Salt.FindObj(Src);
        var DesObj = Salt.FindObj(Des);
        var SrcObjStatus = SrcObj.GetStatus();
        var DesObjStatus = DesObj.GetStatus();
        
        if (ControlSetWaterLevel == "" && Salt.FindObj(Des)) {
            ControlSetWaterLevel = DesObjStatus["MaxWaterLevel"];
        }
        
        // 제어 상태 충족 판별
        if (self.main.Control.ControlType != "Auto") {
            err["IsError"] = 1;
            err["Message"] = "자동모드에서 수행가능합니다.";
            CallBack(err);
            BU.log("자동모드에서 수행가능합니다.");
            return;
        }
        
        var ResultInterval = CheckWaterTankInterval(Src, Des);
        
        if (!BU.isEmpty(ResultInterval)) {
            CallBack(ResultInterval);
            BU.log(ResultInterval);
            return;
        }

        
        if (SrcObjStatus["WaterLevel"] < SrcObjStatus["MinWaterLevel"]) {
            BU.CLI(SrcObjStatus)

            err["IsError"] = 1;
            err["Message"] = "배수대상(" + SrcObjStatus.Name + ")의 염수가 부족합니다.";
            CallBack(err);
            BU.log("배수대상(" + SrcObjStatus.Name + ")의 염수가 부족합니다.");
            return;
        }
        
        if (DesObjStatus["WaterLevel"] > DesObjStatus["MaxWaterLevel"]) {
            err["IsError"] = 1;
            err["Message"] = "급수대상(" + DesObjStatus.Name + ")의 염수가 한계수위에 도달하였습니다..";
            CallBack(err);
            BU.log("급수대상(" + DesObjStatus.Name + ")의 염수가 한계수위에 도달하였습니다.");
            return;
        }
        
        // 등록된 명령 충돌 판별
        //BU.log("명령 존재 충돌 : " + ControlID);
        var AlreadyComplete = _.findWhere(self.ControlCompleteList, { "ID" : ControlID });
        var AlreadyProgress = _.findWhere(self.ControlProgressList, { "ID" : ControlID });
        
        if (!BU.isEmpty(AlreadyProgress)) {
            err["IsError"] = 1;
            err["Message"] = "이미 요청중인 명령입니다.";
            CallBack(err);
            BU.log("이미 요청중인 명령입니다. : " + ControlID);
            _.each(self.ControlProgressList, function (ControlProgress) {
                BU.log("ControlProgress : " + ControlProgress["ID"] + ControlProgress["Des"]);
            });
            _.each(self.ControlCompleteList, function (ControlComplete) {
                BU.log("ControlComplete : " + ControlComplete["ID"] + ControlComplete["Des"]);
            });
            return;
        }
        else if (!BU.isEmpty(AlreadyComplete)) {
            err["IsError"] = 1;
            err["Message"] = "행중인 명령입니다.";
            CallBack(err);
            BU.log("이미 진이미 진행중인 명령입니다. : " + ControlID);
            return;
        }
        
        // 명령 존재여부 체크
        var SearchResult = _.findWhere(_.findWhere(SaltData["SimpleControlList"], { "Src" : Src })["DesList"], { "Des" : Des });
        if (BU.isEmpty(SearchResult)) {
            err["IsError"] = "1";
            err["Message"] = "급수 명령(" + SrcObjStatus.Name + "→" + DesObjStatus.Name + ")은 존재하지 않습니다.";
            CallBack(err);
            BU.log("급수 명령(" + SrcObjStatus.Name + "→" + DesObjStatus.Name + ")은 존재하지 않습니다.");
            return;
        }
        
        // 장치 에러 판별
        if (CheckDeviceStatus(SearchResult)) {
            err["IsError"] = "1";
            err["Message"] = "오류가 있는 장치가 있어 명령을 수행할 수 없습니다.";
            BU.log("오류가 있는 장치가 있어 명령을 수행할 수 없습니다.");
            CallBack(err);
            return;
        }
        
        if (DesObj["Type"] == "WaterTank") {
            //BU.CLI(self.ControlCompleteList);
            var SrcWaterTankCMD = _.where(self.ControlCompleteList, { "Src" : DesObj["ID"] });
            //BU.CLI(SrcWaterTankCMD);

            var FeedCrystallizingCMD = _.each(SrcWaterTankCMD, function (WaterTankCMD) {
                var FindObj = Salt.FindObj(WaterTankCMD["Des"]);
                if (FindObj["PlateType"] !== undefined && FindObj["PlateType"].indexOf("Crystallizing") != -1) {
                    err["IsError"] = "1";
                    err["Message"] = "해당 해주(" + DesObjStatus.Name + ")는 결정지(" + FindObj.Name + ")로 급수가 진행중입니다.\n급수가 종료된 후 수행가능합니다.";
                    BU.log("해당 해주(" + DesObjStatus.Name + ")는 결정지(" + FindObj.Name + ")로 급수가 진행중입니다.\n급수가 종료된 후 수행가능합니다.");
                }
            });
            if (!BU.isEmpty(err)) {
                CallBack(err);
                return;
            }
        }
        
        // 등록된 레퍼런스키 충돌 판별
        var TrueList = SearchResult["True"];
        var FalseList = SearchResult["False"];
        var RealTrueList = [];
        var RealFalseList = [];
        
        var IsClashTrue = _.filter(TrueList, function (TrueID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "0")
                RealTrueList.push(TrueID);
            return FindObj["Value"] < 0;
        });
        
        var IsClashFalse = _.filter(FalseList, function (FalseID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : FalseID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "1")
                RealFalseList.push(FalseID);
            return FindObj["Value"] > 0;
        });
        if (!BU.isEmpty(IsClashTrue)) {
            var ClashIDList = [];
            _.each(self.ControlCompleteList, function (ControlComplete) {
                var findArray = _.intersection(ControlComplete["FalseList"], IsClashTrue);
                if (findArray.length != 0)
                    ClashIDList.push(ControlComplete["ID"]);
            });
            if (BU.isEmpty(ClashIDList)) {
                _.each(self.ControlProgressList, function (ControlComplete) {
                    var findArray = _.intersection(ControlComplete["FalseList"], IsClashTrue);
                    if (findArray.length != 0)
                        ClashIDList.push(ControlComplete["ID"]);
                });
            }
            
            
            try {
                var CMD = ClashIDList[0].split("→");
                var SrcID = CMD[0];
                var DesID = CMD[1];
                
                err["IsError"] = "1";
                err["Message"] = "진행중인 명령(" + FindObjName(SrcID) + "→" + FindObjName(DesID) + ")과 충돌이 발생했습니다.";
                CallBack(err);
                BU.log("진행중인 명령(" + FindObjName(SrcID) + "→" + FindObjName(DesID) + ")과 충돌이 발생했습니다.");
                return;
            }
            catch (e) {
                err["IsError"] = "1";
                err["Message"] = "유효하지 못한 시스템 오류입니다.";
                CallBack(err);
                BU.log("유효하지 못한 시스템 오류입니다.");
                BU.CLI(IsClashTrue);
                return;
            }
        }
        
        if (!BU.isEmpty(IsClashFalse)) {
            var ClashIDList = [];
            _.each(self.ControlCompleteList, function (ControlComplete) {
                var findArray = _.intersection(ControlComplete["TrueList"], IsClashFalse);
                if (findArray.length != 0)
                    ClashIDList.push(ControlComplete["ID"]);
            });
            if (BU.isEmpty(ClashIDList)) {
                _.each(self.ControlProgressList, function (ControlComplete) {
                    var findArray = _.intersection(ControlComplete["TrueList"], IsClashTrue);
                    if (findArray.length != 0)
                        ClashIDList.push(ControlComplete["ID"]);
                });
            }
            
            try {
                var CMD = ClashIDList[0].split("→");
                var SrcID = CMD[0];
                var DesID = CMD[1];
                
                err["IsError"] = "1";
                err["Message"] = "진행중인 명령(" + FindObjName(SrcID) + "→" + FindObjName(DesID) + ")과 충돌이 발생했습니다.";
                CallBack(err);
                BU.log("진행중인 명령(" + FindObjName(SrcID) + "→" + FindObjName(DesID) + ")과 충돌이 발생했습니다.");
                return;
            }
            catch (e) {
                err["IsError"] = "1";
                err["Message"] = "유효하지 못한 시스템 오류입니다.";
                CallBack(err);
                BU.log("유효하지 못한 시스템 오류입니다.");
                BU.CLI(IsClashTrue);
                return;
            }
        }

        // 진행중 명령 리스트 추가
        var AddControlObjCMD = {};
        AddControlObjCMD["ID"] = ControlID;
        AddControlObjCMD["Src"] = Src;
        AddControlObjCMD["Des"] = Des;
        AddControlObjCMD["SetWaterLevel"] = ControlSetWaterLevel;
        AddControlObjCMD["TrueList"] = TrueList;
        AddControlObjCMD["FalseList"] = FalseList;
        
        // 레퍼런스 키 변경
        EditToReferenceKeys(TrueList, FalseList);
        self.ControlProgressList.push(AddControlObjCMD);
        // 장치 수행기능 호출
        var SendObj = {};
        SendObj["ID"] = ControlID;
        SendObj["Src"] = Src;
        SendObj["Des"] = Des;
        SendObj["SetWaterLevel"] = ControlSetWaterLevel;
        SendObj["RealTrueList"] = RealTrueList;
        SendObj["RealFalseList"] = RealFalseList;
        
        
        self.main.controlSerialData.emit("RunSimpleCMD", "Add", SendObj, AddControlObjCMD);
        CallBack("");
    }
    
    self.DeleteAutomationCommand = function (Src, Des, SetWaterLevel, SendDeletePushCallBack) {
        //BU.log("self.DeleteAutomationCommand : ");
        var err = {};
        // 제어 상태 충족 판별
        if (self.main.Control.ControlType != "Auto") {
            err["IsError"] = 1;
            err["Message"] = "자동모드에서 수행가능합니다.";
            SendDeletePushCallBack(err);
            BU.log("자동모드에서 수행가능합니다.");
            return;
        }
        
        
        
        var SearchCompleteResult = _.filter(self.ControlCompleteList, function (Complete) {
            return Complete["Src"] == Src && Complete["Des"] == Des;
        });
        
        if (BU.isEmpty(SearchCompleteResult)) {
            err["IsError"] = 1;
            err["Message"] = "[삭제] 해당 명령(" + FindObjName(Src) + " → " + FindObjName(Des) + ")은 존재하지 않습니다.";
            SendDeletePushCallBack(err);
            BU.log("[삭제] 해당 명령(" + FindObjName(Src) + " → " + FindObjName(Des) + ")은 존재하지 않습니다.");
            return;
        }
 
        var SearchDeleteResult = _.filter(self.DeletingCMD, function (Delete) {
            return Delete["Src"] == Src && Delete["Des"] == Des;
        });
        
        if (!BU.isEmpty(SearchDeleteResult)) {
            err["IsError"] = 1;
            err["Message"] = "[삭제] 해당 명령(" + FindObjName(Src) + " → " + FindObjName(Des) + ")은 이미 진행중입니다.";
            SendDeletePushCallBack(err);
            BU.log("[삭제] 해당 명령(" + FindObjName(Src) + " → " + FindObjName(Des) + ")은 이미 진행중입니다.");
            return;
        }
        
        var ControlID = Src + "→" + Des;
        var SearchResult = _.findWhere(_.findWhere(SaltData["SimpleControlList"], { "Src" : Src })["DesList"], { "Des" : Des });
        //BU.CLI(SearchResult);
        var TrueList = SearchResult["True"];   // 삭제해야하는 목록
        var FalseList = SearchResult["False"];   // 추가해야하는 목록
        var RealTrueList = [];      // 진짜 삭제하는 리스트
        var RealFalseList = [];     // 진짜 작동하는 리스트
        
        // 진짜 닫아야 하는 리스트
        _.each(TrueList, function (TrueID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "1")
                RealTrueList.push(TrueID);
        });
        
        
        
        // 삭제 명령
        var AddControlObjCMD = {};
        AddControlObjCMD["ID"] = ControlID;
        AddControlObjCMD["Src"] = Src;
        AddControlObjCMD["Des"] = Des;
        AddControlObjCMD["SetWaterLevel"] = SetWaterLevel;
        AddControlObjCMD["TrueList"] = FalseList;
        AddControlObjCMD["FalseList"] = TrueList;
        
        self.DeletingCMD.push(AddControlObjCMD);
        
        // 레퍼런스 키 복원
        EditToReferenceKeys(FalseList, TrueList);
        self.ControlProgressList.push(AddControlObjCMD);

        
        // 명령 취소 장치 수행기능 호출
        var SendObj = {};
        SendObj["ID"] = ControlID;
        SendObj["Src"] = Src;
        SendObj["Des"] = Des;
        SendObj["SetWaterLevel"] = SetWaterLevel;
        SendObj["RealTrueList"] = RealFalseList;
        SendObj["RealFalseList"] = RealTrueList;
        
        //self.ControlProgressList.push(SendObj);
        
        self.main.controlSerialData.emit("RunSimpleCMD", "Delete", SendObj, AddControlObjCMD);
        SendDeletePushCallBack();
    }

    self.AddProgressManagement = function (ObjProgress, AddControlObjCMD){
        BU.log("AddProgressManagement Automation");
        //BU.CLI(self.ControlProgressList);
        //BU.CLI(AddControlObjCMD);
        
        
        //// 진행중인 해당명령 삭제
        //self.ControlProgressList = _.reject(self.ControlProgressList, function (ControlProgress) {
        //    return ControlProgress["ID"] == ObjProgress["ID"];
        //});
        
        var TrueList = ObjProgress["TrueList"];
        var FalseList = ObjProgress["FalseList"];
        
        var ChangeDeviceLength = TrueList.length + FalseList.length;
        var ChangeDeviceWatingSec = ChangeDeviceLength * CheckProgressTime;

        var IsReTry = "0";
        var CheckNumber = 0;
        var StartInterval = setInterval(function () {
            if (self.main.Control.ControlType != "Auto") { clearInterval(StartInterval); }
            CheckNumber++;
            
            TrueList = _.reject(TrueList, function (True) {
                //var Target = Salt.FindObj(True["ID"]);
                var Target = Salt.FindObj(True);
                var Value = Target.Value;
                return Value == "1";
            });
            
            FalseList = _.reject(FalseList, function (False) {
                //var Target = Salt.FindObj(False["ID"]);
                var Target = Salt.FindObj(False);
                var Value = Target.Value;
                return Value == "0";
            });

            // 진행중인 명령을 전부 완료하면 진행리스트 삭제, 완료리스트 등록
            if (BU.isEmpty(TrueList) && BU.isEmpty(FalseList)) {
                // 완료 명링리스트 등록
                if (ObjProgress["ID"] == ResetSaltpondDeviceID) {
                    //SendPush("Auto");
                    var Message = "자동모드를 시작합니다.";
                    BU.log(Message);
                    self.IsStartAutomation = "1";
                    _.each(SaltData["WaterLevelList"], function (WaterLevel) {
                        self.emit("UpdateWaterLevel", WaterLevel["ID"]);
                    });
                    StartAutoStopForAutomation();

                    InsertAlarm("", AlarmAlarm, Message);
                }
                else {
                    BU.log("명령등록완료 : " + ObjProgress["ID"]);
                    self.ControlCompleteList.push(AddControlObjCMD);
                    
                    // 진행중인 해당명령 삭제
                    self.ControlProgressList = _.reject(self.ControlProgressList, function (ControlProgress) {
                        return ControlProgress["ID"] == ObjProgress["ID"];
                    });
                    //BU.CLI(self.ControlProgressList);

                    var ProgressID = ObjProgress["ID"];
                    var SpliteProgressID = ProgressID.split("→");
                    var Src = SpliteProgressID[0];
                    var Des = SpliteProgressID[1];
                    
                    var SendObj = {};
                    SendObj["Src"] = Src;
                    SendObj["Des"] = Des;
                    
                    var Target = Salt.FindObj(Des);
                    Target["SetWaterLevel"] = ObjProgress["SetWaterLevel"];
                    //BU.CLI(ObjProgress);
                    InsertProductInfoStart(Src, Des, function (err, result) {
                        if (err) {
                            BU.log("생산정보 시작 DB 입력 실패");
                            BU.log(err);
                            return;
                        }
                        var FindObj = _.findWhere(self.ControlCompleteList, {"ID" : ObjProgress ["ID"] });
                        if (!BU.isEmpty(FindObj)) {
                            FindObj["ProductInfoSeq"] = result.insertId;
                        }
                    });
                }
                
                
                
                //SendCompletePush(ObjProgress["ID"]);
                
                SendPushControlList();

                //BU.CLI(self.ControlProgressList);
                //BU.CLI(self.ControlCompleteList);
                clearInterval(StartInterval);
            }
            
            // 설정한 명령 응답시간을 넘어서도 진행중인 명령을 수행하지 못한다면 1회에 한하여 재시도
            else if (CheckNumber > ChangeDeviceWatingSec && IsReTry == "0") {
                BU.log("명령 재시도");
                BU.CLI(ObjProgress);
                BU.CLI(AddControlObjCMD);
                BU.CLI(TrueList);
                BU.CLI(FalseList);
                IsReTry = "1";
                CheckNumber = 0;
                _.each(TrueList, function (True) {
                    //BU.log("True : " + True);
                    self.main.controlSerialData.emit("SetDevice", True, "1", function (err, res) { });
                });
                _.each(FalseList, function (False) {
                    //BU.log("False : " + False);
                    self.main.controlSerialData.emit("SetDevice", False, "0", function (err, res) { });
                });
            }
            
            // 실패시 수동모드로 전환
            else if (CheckNumber > ChangeDeviceWatingSec && IsReTry == "1") {
                // 진행중인 해당명령 삭제
                self.ControlProgressList = _.reject(self.ControlProgressList, function (ControlProgress) {
                    return ControlProgress["ID"] == ObjProgress["ID"];
                });

                clearInterval(StartInterval);
                var err = {};
                err["IsError"] = "1";
                err["Message"] = "지시한 " + AddControlObjCMD["ID"] + "가 장치에 문제가 있어 수동모드로 전환합니다.(명령추가)";
                BU.log("지시한 " + AddControlObjCMD["ID"] + "가 장치에 문제가 있어 수동모드로 전환합니다.(명령추가)");

                if (self.main.Control.ControlType == "Auto") {
                    self.EndMode();
                    self.main.Control.ManualMode.StartMode(function (err, res) { });
                }
            }
        }, 1000);
    }
    
    self.DeleteProgressManagement = function (ObjProgress, AddControlObjCMD){
        BU.log("DeleteProgressManagement 시작");
        //BU.CLI(ObjProgress);
        
        
        var TrueList = ObjProgress["TrueList"];
        var FalseList = ObjProgress["FalseList"];
        var IsReTry = "0";
        //BU.log(TrueList, FalseList)
        var ChangeDeviceLength = TrueList.length + FalseList.length;
        var ChangeDeviceWatingSec = ChangeDeviceLength * CheckProgressTime;
        
        var CheckNumber = 0;
        var StartInterval = setInterval(function () {
            if (self.main.Control.ControlType != "Auto") { clearInterval(StartInterval); }
            CheckNumber++;
            
            TrueList = _.reject(TrueList, function (True) {
                //var Target = Salt.FindObj(True["ID"]);
                var Target = Salt.FindObj(True);
                var Value = Target.Value;

                return Value === "1";
            });
            
            FalseList = _.reject(FalseList, function (False) {
                //var Target = Salt.FindObj(False["ID"]);
                var Target = Salt.FindObj(False);
                
                var Value = Target.Value;
                //BU.log("Value", Value)
                return Value === "0";
            });
            //BU.CLI("TrueList", TrueList, "FalseList", FalseList);
            // 진행중인 명령을 전부 완료하면 진행리스트 삭제, 완료리스트 등록
            if (BU.isEmpty(TrueList) && BU.isEmpty(FalseList)) {
                //BU.CLI(self.ControlCompleteList)
                //BU.CLI(AddControlObjCMD)
                var FindObj = _.findWhere(self.ControlCompleteList, { "ID" : AddControlObjCMD.ID});
				if(BU.isEmpty(FindObj)){
					BU.log("################################################ 완료  리스트 없음");
					FindObj = _.findWhere(self.ControlProgressList, { "ID": AddControlObjCMD.ID });
				}
				
				if(BU.isEmpty(FindObj)){
					BU.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ 완료 및 진행중 명령 탐색 리스트 없음");
					return;
				}
                //BU.log("찾앗다 요놈 : " + FindObj["ProductInfoSeq"]);
                //BU.CLI(FindObj);
                //BU.CLI(TrueList);
                //BU.CLI(FalseList);
                UpdateProductInfo(FindObj["ProductInfoSeq"], AddControlObjCMD["Src"], AddControlObjCMD["Des"], function (err, result) {
                    if (err) {
                        BU.log("생산정보 종료 DB 입력 실패 : " + err);
                        return;
                    }
                    //BU.log("생산정보 종료 DB 입력 성공 : " + AddControlObjCMD["ID"]);
                });
                

                self.ControlCompleteList = _.reject(self.ControlCompleteList, function (ControlComplete) {
                    return ObjProgress["ID"] == ControlComplete["ID"];
                });
                
                // 삭제 탐색 리스트 제거
                self.DeletingCMD = _.reject(self.DeletingCMD, function (CMD) {
                    return CMD["ID"] == ObjProgress["ID"];
                });
                BU.log("명령제거완료 : " + ObjProgress["ID"])
                // 진행중인 해당명령 삭제
                self.ControlProgressList = _.reject(self.ControlProgressList, function (ControlProgress) {
                    return ControlProgress["ID"] == ObjProgress["ID"];
                });
                //BU.CLI(self.DeletingCMD);
                SendPushControlList();
                
                clearInterval(StartInterval);
            }
            
            // 설정한 명령 응답시간을 넘어서도 진행중인 명령을 수행하지 못한다면 1회에 한하여 재시도
            else if (CheckNumber > ChangeDeviceWatingSec && IsReTry == "0") {
                BU.log("명령 재시도 !!!!!!!!", ObjProgress.ID, ObjProgress.TrueList, ObjProgress.FalseList);
                //BU.CLI("ObjProgress",ObjProgress);
                BU.CLI("AddControlObjCMD", AddControlObjCMD, "TrueList", TrueList, "FalseList", FalseList);
                BU.CLI(self.main.controlSerialData.SerialControlObj);
                //BU.CLIN("TrueList", TrueList);
                //BU.CLIN("FalseList", FalseList);
                IsReTry = "1";
                CheckNumber = 0;
                _.each(TrueList, function (True) {
                    self.main.controlSerialData.emit("SetDevice", True, "1", function (err, res) { });
                });
                _.each(FalseList, function (False) {
                    self.main.controlSerialData.emit("SetDevice", False, "0", function (err, res) { });
                });
            }
            
            // 실패시 수동모드로 전환
            else if (CheckNumber > ChangeDeviceWatingSec && IsReTry == "1") {
                BU.log("명령 실패(명령 추가)")
                BU.CLI("ObjProgress", ObjProgress);
                BU.CLI("AddControlObjCMD", AddControlObjCMD, "TrueList", TrueList, "FalseList", FalseList);
                BU.CLIN(self.main.controlSerialData.SerialControlObj);

                clearInterval(StartInterval);
                var err = {};
                err["IsError"] = "1";
                err["Message"] = "지시한 " + AddControlObjCMD["ID"] + "가 장치에 문제가 있어 수동모드로 전환합니다.(명령추가)";
                BU.log("지시한 " + AddControlObjCMD["ID"] + "가 장치에 문제가 있어 수동모드로 전환합니다.(명령추가)");
                
                if (self.main.Control.ControlType == "Auto") {
                    self.EndMode();
                    self.main.Control.ManualMode.StartMode(function (err, res) { });
                }
            }
        }, 1000);
    }

    // 장치 값에 따른 급수 대상 제거
    self.UpdateSalinity = function (SalinityID, Salinity) {
        //BU.log("UpdateSalinity");
        var Parents = Salt.FindParent(SalinityID, "Salinity")[0];
        var SettingSalinity = Parents["SettingSalinity"];
        var SettingSalinityLow;

        if (SettingSalinity != "")
            SettingSalinityLow = SettingSalinity - 1;
        
        SettingSalinity = Number(SettingSalinity);
        Salinity = Number(Salinity);
        
        if (SettingSalinity != "" && SettingSalinity <= Salinity && !Parents["IsSendedReachSalinity"]) {
            Parents["IsSendedReachSalinity"] = true;

            var gcm = new _gcm.GCM();
            var message = FindObjName(Parents["ID"]) + "의 염도가 설정한 수치(" + Parents["SettingSalinity"] + ")에 도달하였습니다.";
            gcm.sendAll(message, "default");
            
            //BI.GetGCMList(function (err, result) {
            //    if (err) {
            //        BU.log(err);
            //        return;
            //    }
                
            //    var GCM_Device_List = result;
            //    var GCM = new _gcm.GCM();
                
            //    _.each(GCM_Device_List, function (Device) {
            //        //BU.log(FindObjName(Parents["ID"]) + "의 염도가 설정한 수치(" + Parents["SettingSalinity"] + ")에 도달하였습니다.");
            //        GCM.Send({ "Message" : FindObjName(Parents["ID"]) + "의 염도가 설정한 수치(" + Parents["SettingSalinity"] + ")에 도달하였습니다.", "status" : "default", "RegIds" : [Device["registration_id"]] });
            //    });
            //});
        }
        else if (SettingSalinity != "" && SettingSalinityLow > Salinity && Parents["IsSendedReachSalinity"]) {
            Parents["IsSendedReachSalinity"] = false;
        }
    }
    
    self.DeviceErrorDetected = function (DeviceID){
        self.EndMode();
        SendPush("Manual");

        var ErrorDeviceName = Salt.FindObj(DeviceID)["Name"];

        var gcm = new _gcm.GCM();
        var message = "장치(" + ErrorDeviceName + ")에 이상이 감지되어 수동모드로 변경합니다.";
        gcm.sendAll(message, "deviceError");
    }
    
    self.GetControlList = function (){
        var SortByControlCompleteList = _.sortBy(self.ControlCompleteList, "Src");
        var NowControlList = [];
       
        _.each(SortByControlCompleteList, function (Control) {
            var AddObj = {};
            AddObj["Src"] = Control["Src"];
            AddObj["Des"] = Control["Des"];
            NowControlList.push(AddObj);
        });

        return NowControlList;
    }
    
    var FindObjName = function (TargetID) {
        return Salt.FindObj(TargetID).Name;
    }
    
    var EditToReferenceKeys = function (TrueList, FalseList) {
        _.each(TrueList, function (TrueID) {
            var ChangeTarget = _.findWhere(self.ControlReferenceKeys, { "ID" : TrueID });
            ChangeTarget["Value"]++;
        });
        _.each(FalseList, function (FalseID) {
            var ChangeTarget = _.findWhere(self.ControlReferenceKeys, { "ID" : FalseID });
            ChangeTarget["Value"]--;
        });
    }
    
    var InsertProductInfoStart = function (GiveID, ReceiveID, CallBack) {
        var GiveStatus = Salt.FindObj(GiveID).GetStatus();
        var ReceiveStatus = Salt.FindObj(ReceiveID).GetStatus();
        
        var SendObj = {};
        SendObj["Give_ID"] = GiveStatus["ID"];
        SendObj["Give_Prev_WaterLevel"] = Number(GiveStatus["WaterLevel"]).toFixed(1);
        SendObj["Give_Prev_Salinity"] = Number(GiveStatus["Salinity"]).toFixed(1);
        SendObj["Give_After_WaterLevel"] = null;
        SendObj["Give_After_Salinity"] = null;
        SendObj["Receive_ID"] = ReceiveStatus["ID"];
        SendObj["Receive_Prev_WaterLevel"] = Number(ReceiveStatus["WaterLevel"]).toFixed(1);
        SendObj["Receive_Prev_Salinity"] = Number(ReceiveStatus["Salinity"]).toFixed(1);
        SendObj["Receive_After_WaterLevel"] = null;
        SendObj["Receive_After_Salinity"] = null;
        
        BI.InsertProductInfo(SendObj, CallBack);
    }
    
    var InsertAlarm = function (DeviceID, AlarmType, Message) {
        var SendObj = {};
        SendObj["Device_ID"] = DeviceID;
        SendObj["Alarm_Type"] = AlarmType;
        SendObj["Message"] = Message;
        
        BI.InsertAlarm(SendObj, function () { });
    }

    var UpdateProductInfo = function (ProductInfoSeq, GiveID, ReceiveID, CallBack) {
        //BU.log("UpdateProductInfo");
        //BU.CLI(ProductInfoSeq);
        var GiveStatus = Salt.FindObj(GiveID).GetStatus();
        var ReceiveStatus = Salt.FindObj(ReceiveID).GetStatus();
        
        var SendObj = {};
        SendObj["ProductInfoSeq"] = ProductInfoSeq;
        SendObj["Give_After_WaterLevel"] = Number(GiveStatus["WaterLevel"]).toFixed(1);
        SendObj["Give_After_Salinity"] = Number(GiveStatus["Salinity"]).toFixed(1);
        SendObj["Receive_After_WaterLevel"] = Number(ReceiveStatus["WaterLevel"]).toFixed(1);
        SendObj["Receive_After_Salinity"] = Number(ReceiveStatus["WaterLevel"]).toFixed(1);
        
        BI.UpdateProductInfo(SendObj, CallBack);
    }
    
    
    var CheckWaterTankInterval = function (SrcID, DesID) {
        //BU.log("CheckWaterTankInterval");
        var err = {};
        
        var SrcObj = Salt.FindObj(SrcID);
        var DesObj = Salt.FindObj(DesID);
        var SrcObjStatus = SrcObj.GetStatus();
        var DesObjStatus = DesObj.GetStatus();
        
        if (SrcObj["Type"] == "WaterTank" && DesObj["PlateType"].indexOf("Crystallizing") != -1) {
            if (SrcObj["IsFeedWater"] == "1") {
                err["IsError"] = 1;
                err["Message"] = "해주(" + SrcObj.Name + ")로 염수가 유입되고 있어 명령을 실행할수 없습니다.";
                BU.log("해주(" + SrcObj.Name + ")로 염수가 유입되고 있어 명령을 실행할수 없습니다.");
                return err;
            }
            
            var NowDate = new Date();
            var RecentFeedWaterEndDate = SrcObjStatus["RecentFeedWaterEndDate"];
            
            if (RecentFeedWaterEndDate != "") {
                var RecentDate = BU.convertTextToDate(RecentFeedWaterEndDate);
                var RemainSec = parseInt(NowDate - RecentDate) / 1000;
                var StandardRemain = (WaterTankFeedDelayHour * 60 * 60) + (WaterTankFeedDelayMin * 60);
                
                // 지정 시간이 지나지 않을 경우
                if (StandardRemain > RemainSec) {
                    var RemainSec = StandardRemain - RemainSec;
                    
                    var RemainDay = parseInt(RemainSec / 60 / 60 / 24);
                    RemainSec = (RemainSec - (RemainDay * 60 * 60 * 24));
                    var RemainHour = parseInt(RemainSec / 60 / 60);
                    RemainSec = (RemainSec - (RemainHour * 60 * 60));
                    var RemainMin = parseInt(RemainSec / 60);
                    RemainSec = parseInt(RemainSec - (RemainMin * 60));
                    
                    err["IsError"] = 1;
                    err["Message"] = "해주(" + SrcObj.Name + ")로 염수가 유입된지 3시간이 지나지 않았습니다.\n잔여 시간:" + RemainHour + '시간 ' + RemainMin + '분 ' + RemainSec + '초';
                    BU.log("해주(" + SrcObj.Name + ")로 염수가 유입된지 3시간이 지나지 않았습니다.\n잔여 시간: " + RemainHour + '시간 ' + RemainMin + '분 ' + RemainSec + '초');
                    return err;
                }
            }
        }
        return err;
    }
   
   
    var StartAutoStopForAutomation = function () {
        var UnionArrayControView = _.union(
            SaltData["SaltPlateList"],
            SaltData["WaterTankList"],
            SaltData["ReservoirList"]
        );
        
        // 1초마다 상태체크
        self.AutoStopForAutomation = setInterval(function () {
            if (self.main.Control.ControlType != "Auto") { clearInterval(self.AutoStopForAutomation); return; }
            _.each(UnionArrayControView, function (Target) {
                var FindObj = Salt.FindObj(Target["ID"]);
                var TargetStatus = FindObj.GetStatus();
                
                var MaxWaterLevel = Number(TargetStatus["MaxWaterLevel"]);
                var MinWaterLevel = Number(TargetStatus["MinWaterLevel"]);
                var SetWaterLevel = Number(TargetStatus["SetWaterLevel"]);
                var WaterLevel = Number(TargetStatus["WaterLevel"]);
                
                var SettingSalinity = FindObj["SettingSalinity"];
                var Salinity = Number(TargetStatus["Salinity"]);

                var PlateType = TargetStatus["PlateType"];
                
                if (WaterLevel === "") {
                    BU.log("현재 수위를 알수없어 오토스탑을 종료합니다.");
                    return;
                }
                
                // 염전 자동 급수 명령 삭제 
                if (WaterLevel >= MaxWaterLevel || WaterLevel >= SetWaterLevel) {
                    // 급수대상에 관련된 명령 추출
                    var DeleteTargetList = _.where(self.ControlCompleteList, { "Des" : Target["ID"] });
                    
                    _.each(DeleteTargetList, function (DeleteTarget) {
                        var IsExist = _.findWhere(self.DeletingCMD, { "ID" : DeleteTarget["ID"] });
                        
                        if (BU.isEmpty(IsExist)) {
                            self.DeleteAutomationCommand(DeleteTarget["Src"], DeleteTarget["Des"], SetWaterLevel, SendDeletePush);
                        }
                    });
                }

                // 염전 자동 배수 명령 삭제 
                else if (WaterLevel <= MinWaterLevel) {
                    // 배수대상에 관련된 명령 추출
                    var DeleteTargetList = _.where(self.ControlCompleteList, { "Src" : Target["ID"] });
                    
                    _.each(DeleteTargetList, function (DeleteTarget) {
                        var IsExist = _.findWhere(self.DeletingCMD, { "ID" : DeleteTarget["ID"] });
                        
                        if (BU.isEmpty(IsExist)) {
                            self.DeleteAutomationCommand(DeleteTarget["Src"], DeleteTarget["Des"], SetWaterLevel, SendDeletePush);
                        }
                    });
                    
                    if (self.main.Control.ControlType == "Auto") {
                        // 증발지일경우 자동급수 조건 검색
                        if (PlateType != undefined && PlateType.indexOf(EvaporatingPond) != -1) {
                            // 자동 급수 조건 탐색 
                            var IsFeedProgress = _.where(self.ControlProgressList, { "Des" : Target["ID"] });
                            var IsFeedComplete = _.where(self.ControlCompleteList, { "Des" : Target["ID"] });
                            
                            // 진행중 명령 체크
                            if (BU.isEmpty(IsFeedProgress) && BU.isEmpty(IsFeedComplete)) {
                                // 해당 오브젝트 급수 순위 추출
                                var TargetRank = _.findWhere(SaltData["FeedRankList"], { "ID": Target["ID"] });
                                //BU.log("TargetRank", TargetRank)
                                
                                // Rank 순위가 없다면 종료
                                if (_.isEmpty(TargetRank))
                                    return;
                                // 급수가능 체크(수위 체크)
                                var ResultRank_RemoveRunning = _.reject(TargetRank["Rank"], function (RankTarget) {
                                    var FindObj = Salt.FindObj(RankTarget).GetStatus();
                                    //BU.CLI(FindObj)
                                    var WaterLevel = Number(FindObj.WaterLevel);
                                    if (WaterLevel <= FindObj["MinWaterLevel"])
                                        return true;
                                });
                                // 급수 가능 체크(진행중 명령 충돌 체크)
                                var ResultRank_RemoveClash = _.reject(ResultRank_RemoveRunning, function (RankTarget) {
                                    //BU.log("급수 가능 체크 테스트");
                                    var Src = RankTarget;
                                    var Des = Target["ID"];
                                    var SearchResult = _.findWhere(_.findWhere(SaltData["SimpleControlList"], { "Src" : Src })["DesList"], { "Des" : Des });
                                    
                                    if (BU.isEmpty(SearchResult)) {
                                        BU.log("급수 순위에 해당 없음. 종료 : " + SearchResult);
                                        return;
                                    }

                                    // 등록된 레퍼런스키 충돌 판별
                                    var TrueList = SearchResult["True"];
                                    var FalseList = SearchResult["False"];
                                    var RealTrueList = [];
                                    var RealFalseList = [];
                                    
                                    var IsClashTrue = _.filter(TrueList, function (TrueID) {
                                        var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
                                        if (FindObj["Value"] === undefined) {
                                            BU.log("언디파인드에러");
                                            BU.CLI(FindObj);
                                        }
                                        return FindObj["Value"] < 0;
                                    });
                                    
                                    var IsClashFalse = _.filter(FalseList, function (FalseID) {
                                        var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : FalseID });
                                        if (FindObj["Value"] === undefined) {
                                            BU.log("언디파인드에러");
                                            BU.CLI(FindObj);
                                        }
                                        return FindObj["Value"] > 0;
                                    });
                                    
                                    // 충돌 시 리스트 제거
                                    if (!(BU.isEmpty(IsClashTrue) && BU.isEmpty(IsClashFalse))) {
                                        return true;
                                    }
                            
                                });
                                
                                // 충돌이 있지 않을 경우 1순위 추출. 명령 하달
                                if (!BU.isEmpty(ResultRank_RemoveClash)) {
                                    var FinalResultRank = ResultRank_RemoveClash[0];
                                    
                                    var SimpleCMD = {};
                                    SimpleCMD["Src"] = FinalResultRank;
                                    SimpleCMD["Des"] = Target["ID"];
                                    SimpleCMD["SetWaterLevel"] = "";
                                    SimpleCMD["ControlType"] = "SimpleCMD";
                                    
                                    var ResultInterval = CheckWaterTankInterval(FinalResultRank, Target["ID"]);
                                    if (BU.isEmpty(ResultInterval)) {
                                        self.OrderControl(SimpleCMD, function (err, result) {});
                                    }
                                }
                            }
                        }
                    }
                }
                
                // 설정 염도 초과시 우선순위에 따라 자동 이동
                if (SettingSalinity != "" && SettingSalinity <= Salinity && WaterLevel >= MinWaterLevel) {
                    // 요청중 또는 진행중 명령이 있는지 확인
                    //BU.log("SettingSalinity : " + SettingSalinity, Salinity)
                    var IsFeedProgress = _.where(self.ControlProgressList, { "Des" : Target["ID"] });
                    var IsFeedComplete = _.where(self.ControlCompleteList, { "Des" : Target["ID"] });

                    if (BU.isEmpty(IsFeedProgress) && BU.isEmpty(IsFeedComplete)) {
                        var TargetRank = _.findWhere(SaltData["MaxSalinityFeedRankList"], { "ID" : Target["ID"] });
                        // 급수가능 체크(수위가 최대수위를 넘어섰다면 제거)
                        if (TargetRank["Rank"] == undefined) {
                            BU.log("타겟 링크가 없음.")
                            BU.CLI(SaltData["MaxSalinityFeedRankList"])
                            BU.CLI(TargetRank);
                            return;
                        }
                        var ResultRank_RemoveRunning = _.reject(TargetRank["Rank"], function (RankTarget) {
                            var FindObj = Salt.FindObj(RankTarget).GetStatus();
                            var WaterLevel = Number(FindObj.WaterLevel);
                            if (WaterLevel >= FindObj["MaxWaterLevel"])
                                return true;
                        });


                        // 급수 가능 체크(진행중 명령 충돌 체크)
                        var ResultRank_RemoveClash = _.reject(ResultRank_RemoveRunning, function (RankTarget) {
                            //BU.log("급수 가능 체크 테스트");
                            var Src = RankTarget;
                            var Des = Target["ID"];
                            var SearchResult = _.findWhere(_.findWhere(SaltData["SimpleControlList"], { "Src" : Src })["DesList"], { "Des" : Des });
                            
                            if (BU.isEmpty(SearchResult)) {
                                //BU.log("급수 순위에 해당 없음. 종료");
                                //BU.CLI(RankTarget);
                                return;
                            }
                            
                            // 등록된 레퍼런스키 충돌 판별
                            var TrueList = SearchResult["True"];
                            var FalseList = SearchResult["False"];
                            var RealTrueList = [];
                            var RealFalseList = [];
                            
                            var IsClashTrue = _.filter(TrueList, function (TrueID) {
                                var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
                                if (FindObj["Value"] === undefined) {
                                    BU.log("언디파인드에러");
                                    BU.CLI(FindObj);
                                }
                                return FindObj["Value"] < 0;
                            });
                            
                            var IsClashFalse = _.filter(FalseList, function (FalseID) {
                                var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : FalseID });
                                if (FindObj["Value"] === undefined) {
                                    BU.log("언디파인드에러");
                                    BU.CLI(FindObj);
                                }
                                return FindObj["Value"] > 0;
                            });
                            
                            // 충돌 시 리스트 제거
                            if (!(BU.isEmpty(IsClashTrue) && BU.isEmpty(IsClashFalse))) {
                                return true;
                            }
                        });
                        
                        // 충돌이 있지 않을 경우 1순위 추출. 명령 하달
                        if (!BU.isEmpty(ResultRank_RemoveClash)) {
                            var FinalResultRank = ResultRank_RemoveClash[0];
                            
                            var SimpleCMD = {};
                            SimpleCMD["Src"] = Target["ID"];
                            SimpleCMD["Des"] = FinalResultRank;
                            SimpleCMD["SetWaterLevel"] = "";
                            SimpleCMD["ControlType"] = "SimpleCMD";
                            //BU.CLI(SimpleCMD);
                            var ResultInterval = CheckWaterTankInterval(FinalResultRank, Target["ID"]);
                            if (BU.isEmpty(ResultInterval)) {
                                self.OrderControl(SimpleCMD, function (err, result) { });
                            }
                        }
                    }
                }
            });
        }, 1000 * 2);
    }
    
    
    // 명령, 레퍼런스키 값, 모델 설정 수위 초기화
    var MakeControlStatus = function () {
        self.ControlProgressList = [];
        self.ControlCompleteList = [];
        self.ControlReferenceKeys = [];
        
        var UnionArrayControlDevice = _.union(
            SaltData["WaterDoorList"],
            SaltData["ValveList"],
            SaltData["PumpList"]
        );
        _.each(UnionArrayControlDevice, function (Device) {
            var AddObj = {};
            AddObj["ID"] = Device["ID"];
            AddObj["Value"] = 0;
            self.ControlReferenceKeys.push(AddObj);
        });
        
        var UnionArrayControView = _.union(
            SaltData["SaltPlateList"],
            SaltData["WaterTankList"]
        );
        _.each(UnionArrayControView, function (Target) {
            Target["SetWaterLevel"] = Target["MaxWaterLevel"];
        });
    }
    
    // 세팅모드의 장치상태를 점검
    var CheckDeviceStatus = function (SettingObj) {
        var IsDeviceError = _.filter(SettingObj["True"].concat(SettingObj["False"]), function (DeviceID) {
            var FindObj = Salt.FindObj(DeviceID);
            var ObjStatus = FindObj.GetStatus();
            //BU.CLI(ObjStatus)
            return ObjStatus.IsError != 0;
        });
        
        if (!BU.isEmpty(IsDeviceError)) {
            return true;
        }
        else
            return false;
    }
    
    var SendPush = function (ControlStatus) {
        self.main.Control.ControlType = ControlStatus;
        var SendObj = {};
        SendObj["CMD"] = "ControlStatus";
        SendObj["ControlStatus"] = ControlStatus;
        var pushServer = global.pushServer;
        pushServer.emit("sendAllClient", SendObj);
    }
    
    var SendPushControlList = function () {
        var SendObj = {};
        SendObj["CMD"] = "ControlList";
        SendObj["Contents"] = self.GetControlList();
        var pushServer = global.pushServer;
        // BU.CLI(pushServer)
        // BU.CLI(SendObj)
        pushServer.emit("sendAllClient", SendObj);
    }

    var SendPushReachSalinity = function(Target, Message) {
        //BU.log("ReachSalinity : " + Target);
        var SendObj = {};
        SendObj["CMD"] = "ReachSalinity";
        SendObj["ID"] = Target;
        SendObj["Message"] = Message;
        // BU.log(SendObj);
        var pushServer = global.pushServer;
        pushServer.emit("sendAllClient", SendObj);
    }

    var SendCompletePush = function(CompleteID) {
        BU.log("명령 등록 완료 : " + CompleteID);
        _.each(self.ControlCompleteList, function (Complete) {
            //BU.log(Complete["ID"]);
        });

        //var SpliteCompleteID = CompleteID.split("→");
        //var SrcName = FindObjName(SpliteCompleteID[0]);
        //var DesName = FindObjName(SpliteCompleteID[1]);
        

        //var SendObj = {};
        //SendObj["CMD"] = "ControlList";
        //SendObj["Message"] = "명령(" + SrcName + "→" + DesName + ")을 수행합니다.";
        //var pushServer = global.worker.socketServer.push;
        ////BU.log("샌드푸시");
        //pushServer.emit("sendAllClient", SendObj);

        //BU.log("명령(" + SrcName + "→" + DesName + ")을 수행합니다.");
    }
    
    var SendDeletePush = function (Empty, Obj) {
        //if (BU.isEmpty(Empty)) {
        //    //BU.log("명령 제거 완료 : " + Obj["ID"]);
        //    BU.log("명령 제거 요청 : ");
        //    _.each(self.DeletingCMD, function (CMD) {
        //        BU.log(CMD["ID"]);
        //    });
        //}
        

        //BU.CLI(self.ControlReferenceKeys);
        
        //var SpliteCompleteID = CompleteID.split("→");
        //var SrcName = FindObjName(SpliteCompleteID[0]);
        //var DesName = FindObjName(SpliteCompleteID[1]);
        
        
        //var SendObj = {};
        //SendObj["CMD"] = "DeleteCMD";
        //SendObj["Message"] = "명령(" + SrcName + "→" + DesName + ")이 완료되었습니다.";
        //var pushServer = global.worker.socketServer.push;
        ////BU.log("샌드푸시");
        //pushServer.emit("sendAllClient", SendObj);
        
        //BU.log("명령(" + SrcName + "→" + DesName + ")이 완료되었습니다.");
    }
}
util.inherits(AutomationMode, events.EventEmitter);
exports.AutomationMode = AutomationMode;


// 우천 모드 ~!@
var RainMode = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.main = global.main;
    var Salt = self.main.Salt;
    var SaltData = Salt.SaltData;
    //var BI = self.main.BI;
    
    var CheckGroupWaterLevelTime = 1;         // 그룹의 수위체크를 할 시간(1초)
    var CheckProgressTime = 20;         // 명령을 내리고 30초가 지나도 상태값이 바뀌지 않는다면 진행중인 명령 취소 후 장치값 복구(20초)
    
    self.ControlReferenceKeys = [];      // 제어장치 값
    //self.GroupStatus = [];
    self.RainControlList;
    
    self.ControlProgressList = [];
    self.ControlCompleteList = [];
    self.DeletingCMD = [];

    self.ControlReferenceKeys = [];
    
    self.StartCheckGroupWaterLevel;
    
    var NowWaterTankList = []
    
    var InitSetting = false;

    self.StartMode = function (CallBack) {
        InitSetting = false;
        var SettingControlList = SaltData["SettingControlList"];
        var SettingObj = _.findWhere(SettingControlList, { "ID" : ResetSaltpondDeviceID });
        //if (CheckDeviceStatus(SettingObj)) {
        //    var err = {};
        //    err["IsError"] = "1";
        //    err["Message"] = "장치에 오류가 발생하여 명령을 수행할 수 없습니다.";
        //    BU.log("장치에 오류가 발생하여 명령을 수행할 수 없습니다.");
        //    CallBack(err);
        //    return;
        //}
        NowWaterTankList = SaltData["WaterTankList"];
        SendPush("Rain");
        
        if (global.fixmeConfig.isDev) {
            // 임시
            var SettingControlList = SaltData["SettingControlList"];
            var SettingObj = _.findWhere(SettingControlList, { "ID": GoToSea });
            self.main.controlSerialData.emit("RunSettingCMD", SettingObj);
        }
        else {
            MakeControlStatus();    // 명령, 레퍼런스키, 모델 설정 초기화
            CheckGroupWaterLevel(); // 그룹별 최저 수위 체크
        }
        
        BU.log("우천모드를 시작합니다.");

        CallBack("", "Rain");
    }
    
    self.EndMode = function () {
        clearInterval(self.StartCheckGroupWaterLevel);
        InitSetting = false;
        BU.log("우천모드를 종료합니다.");
    }
    
    // 그룹별 최저 수위 체크
    var CheckGroupWaterLevel = function () {
        //BU.CLI("self.RainControlList", self.RainControlList)
        self.StartCheckGroupWaterLevel = setInterval(function () {
            // 염수이동이 완료됐을 경우 수위 체크 종료, 최종 우천 대피 모드 실행
            if (BU.isEmpty(self.RainControlList)) {
                clearInterval(self.StartCheckGroupWaterLevel);
                BU.log("최종 우천 대피 시작");
                
                //BU.CLI(self.ControlProgressList);
                //BU.CLI(self.ControlCompleteList);
                //BU.CLI(self.DeletingCMD);

                var SettingControlList = SaltData["SettingControlList"];
                var SettingObj = _.findWhere(SettingControlList, { "ID" : GoToSea });
                self.main.controlSerialData.emit("RunSettingCMD", SettingObj);
            }
            // 수위 탐색
            _.each(self.RainControlList, function (GroupControl) {
                //BU.CLI(GroupControl)
                var ExistWater = _.filter(GroupControl["GroupElement"], function (Element) {
                    var ElementStatus = Salt.FindObj(Element).GetStatus();
                    //BU.CLI("id", Element, "waterlevel", ElementStatus["WaterLevel"], "MinWaterLevel", ElementStatus["MinWaterLevel"])
                    return ElementStatus["WaterLevel"] > ElementStatus["MinWaterLevel"];
                });
                //BU.CLI("ExistWater", ExistWater);
                var ExistCMD = FindExistGroupCMD(GroupControl["GroupID"]);
                //BU.CLI(ExistCMD);
                // 그룹의 수위가 전부 최저수위 이하
                if (BU.isEmpty(ExistWater)) {
                    // 진행중인 명령이 있다면 해당 명령 삭제
                    if (!BU.isEmpty(ExistCMD["CompleteCMD"]) && BU.isEmpty(ExistCMD["DeletingCMD"]))
                        DeleteControl(ExistCMD["CompleteCMD"], "0");
                    else if (!BU.isEmpty(ExistCMD["ProgressCMD"]) && BU.isEmpty(ExistCMD["DeletingCMD"]))
                        DeleteControl(ExistCMD["ProgressCMD"], "0");
                    else if (BU.isEmpty(ExistCMD["DeletingCMD"])) {
                        //BU.log("컨트롤 리스트 삭제. 명령 없어")
                        self.RainControlList = _.reject(self.RainControlList, function (RainControl) { return RainControl["GroupID"] == GroupControl["GroupID"]; });
                    }
                    //else
                    //    BU.log("Delay 대기?")
                }
            // 수위가 존재하나 명령이 없을 경우
                else if (!BU.isEmpty(ExistWater) && BU.isEmpty(ExistCMD["CompleteCMD"]) && BU.isEmpty(ExistCMD["ProgressCMD"])) {

                    var IsFind = "0";
                    //BU.log("수위가 존재하나 명령이 없을 경우" + GroupControl["GroupID"]);
                    //BU.CLI("GroupControl", GroupControl)
                    _.each(GroupControl["DesList"], function (Des) {
                        var FindObjStatus = Salt.FindObj(Des["Des"]).GetStatus();
                        //BU.CLI(FindObjStatus);
                        // 해주 수위 체크, 조건 충족시 명령 지시
                        if (FindObjStatus["WaterLevel"] > FindObjStatus["MinWaterLevel"] && IsFind == "0") {
                            //BU.log("조건 충족");
                            var ResultCheckControlClash = CheckControlClash(Des["True"], Des["False"]);
                            if (ResultCheckControlClash["IsClash"] == "1") {
                                BU.log(GroupControl["GroupID"]);
                                BU.log(Des["Des"]);
                                IsFind = "1"
                                //BU.log("명령 충돌이 발생하여 대기합니다. : " + FindObjStatus["ID"]);
                                //BU.CLI(ResultCheckControlClash);
                                return;
                            }
                            //BU.log("명령 없음.")
                            
                            //BU.CLI(GroupControl["GroupID"]);
                            IsFind = "1";
                            ControlManagement(GroupControl["GroupID"], Des, ResultCheckControlClash);
                        }
                    });
                    // 해주들의 염수가 전부 가득 찼을 경우 해당 그룹 탐색리스트에서 삭제
                    if (IsFind == "0") {
                        //BU.log("해주들 수위 전부 차서 그룹 탐색리스트에서 삭제");
                        //BU.log(GroupControl["GroupID"]);
                        //BU.CLI(self.ControlProgressList);
                        //BU.CLI(self.ControlCompleteList);
                        //BU.CLI(self.DeletingCMD);
                        self.RainControlList = _.reject(self.RainControlList, function (RainControl) { return RainControl["GroupID"] == GroupControl["GroupID"]; });
                    }
                }
            });

            // 레퍼런스키와 다른 장비상태 변경
            if (InitSetting == false) {
                InitSetting = true;
                DeviceStatusChangeByReferenceKey();
            }
        }, 1000 * CheckGroupWaterLevelTime)
    }
    
    // 장치상태 변경. 레퍼런스키와 다른 장비
    var DeviceStatusChangeByReferenceKey = function (){
        var TrueDeviceList = [];
        var FalseDeviceList = [];
        //BU.CLI(self.ControlReferenceKeys);
        _.each(self.ControlReferenceKeys, function (Key) {
            var ObjStatus = Salt.FindObj(Key["ID"]).GetStatus();
            var ObjValue = ObjStatus.Value;
            if (Key["Value"] <= 0 && ObjValue == "1") {
                var AddObj = {};
                AddObj["ID"] = Key["ID"]
                FalseDeviceList.push(Key["ID"]);
            }
                
        });
        //BU.log("FalseDeviceList");
        self.main.controlSerialData.emit("SetDeviceList", FalseDeviceList, "0", function (err, res) { })
        //BU.CLI(FalseDeviceList);
    }

        // 명령 추가 관리
    var ControlManagement = function (GroupID, Des, ResultClash) {
        //BU.CLI("ControlManagement", GroupID, "Des", Des, "ResultClash", ResultClash)
        
        EditToReferenceKeys(Des["True"], Des["False"]);

        var AddControlObjCMD = {};
        AddControlObjCMD["ID"] = GroupID + "→" + Des["Des"];
        AddControlObjCMD["PrevID"] = GroupID + "→" + Des["Des"];
        AddControlObjCMD["Src"] = GroupID;
        AddControlObjCMD["Des"] = Des["Des"];
        AddControlObjCMD["Delay"] = Des["Delay"];
        AddControlObjCMD["TrueList"] = Des["True"];
        AddControlObjCMD["FalseList"] = Des["False"];
        
        //BU.CLI(AddControlObjCMD);
        
        //self.ControlProgressList.push(AddControlObjCMD);
        
        // 장치 수행기능 호출
        var SendObj = {};
        SendObj["ID"] = GroupID + "→" + Des["Des"];
        SendObj["Src"] = GroupID;
        SendObj["Des"] = Des["Des"];
        SendObj["Delay"] = Des["Delay"];
        SendObj["RealTrueList"] = ResultClash["RealTrueList"];
        SendObj["RealFalseList"] = ResultClash["RealFalseList"];
        
        //BU.CLI(SendObj);
        
        
        self.main.controlSerialData.emit("RunSimpleCMD", "Add", SendObj, AddControlObjCMD);
        
    }
    
    self.CheckWaterTankWaterLevel = function (ChildID) {
        var ParentsList = Salt.FindParent(ChildID, "WaterLevel");
        var Parents = ParentsList[0];
        var ParentsStatus = Parents.GetStatus();
        
        
        
        if (ParentsStatus["ID"].indexOf("WT") != 0) {
            //BU.log("잡았다 요놈! 해주아닌놈! : " + ParentsStatus["ID"]);
            return;
        }
        
        if (ParentsStatus["WaterLevel"] === "") {
            BU.log("현재 수위를 알수없습니다. 대상 : " + FindObjName(Parents));
            return;
        }
        
        //if (ParentsStatus["ID"] == "WT2") {
        //    BU.log(ParentsStatus["WaterLevel"]);
        //}
        //BU.log(ChildID);
        
        var IsExist = _.findWhere(NowWaterTankList, {"ID": ParentsStatus["ID"]} );

        // 한계수위 초과시 급수 제거FindExistWaterTankCMD(수위 초과, 삭제진행명령리스트 존재 X, 장치들중 열려있는게 있을 경우)
        if (ParentsStatus["WaterLevel"] >= ParentsStatus["MaxWaterLevel"] && !BU.isEmpty(IsExist)) {
            NowWaterTankList = _.reject(NowWaterTankList, function (NowWaterTank) {
                return NowWaterTank["ID"] == ParentsStatus["ID"];
            });
            
            //_.each(NowWaterTankList, function (NowWaterTank) {
            //    //BU.log("현재 남아잇는 워터탱크놈");
            //    BU.log(NowWaterTank["ID"]);
            //});

            //BU.log("명령 존재 체크");
            
            var ExistCMD = FindExistWaterTankCMD(ParentsStatus["ID"]);
            //BU.CLI(ExistCMD);
            
            //returnvalue["CompleteCMD"] = _.difference(ExistCompleteCMD, ExistDeletingCMD);
            //returnvalue["ProgressCMD"] = _.difference(ExistProgressCMD, ExistDeletingCMD);
            //returnvalue["DeletingCMD"] = ExistDeletingCMD;
            
            var CompletedID = _.difference(ExistCMD["CompleteCMD"], ExistCMD["DeletingCMD"]);
            
            //_.each(CompletedID, function (CompleteCMD) {
            //    BU.log("수위 초과로 간다!");
            //    BU.CLI(CompleteCMD);
            //    DeleteAndContinueControl(CompleteCMD);
            //});
            //BU.log("19노마");
            //BU.CLI(ExistCMD);
            _.each(ExistCMD["CompleteCMD"], function (CompleteCMD) {
                DeleteAndContinueControl(CompleteCMD);
            });

            //_.each(ExistCMD["ProgressCMD"], function (ProgressCMD) {
            //    DeleteAndContinueControl(ProgressCMD);
            //});

            //BU.CLI(ExistCMD);
        }
    }
    

    
    self.AddProgressManagement = function (ObjProgress, AddControlObjCMD) {
        //self.ControlProgressList.push(AddControlObjCMD);
        //BU.CLI(self.ControlProgressList);
        var TrueList = ObjProgress["TrueList"];
        var FalseList = ObjProgress["FalseList"];
        var IsReTry = "0";
        
        var ChangeDeviceLength = TrueList.length + FalseList.length;
        var ChangeDeviceWatingSec = ChangeDeviceLength * CheckProgressTime;
        
        var CheckNumber = 0;
        var StartInterval = setInterval(function () {
            if (self.main.Control.ControlType != "Rain") { clearInterval(StartInterval); return; }
            CheckNumber++;
            
            //BU.CLI(ObjProgress);
            //BU.CLI(TrueList);

            TrueList = _.reject(TrueList, function (True) {
                //var Target = Salt.FindObj(True["ID"]);
                var Target = Salt.FindObj(True);
                var Value = Target.Value;
                return Value == "1";
            });
            
            FalseList = _.reject(FalseList, function (False) {
                //var Target = Salt.FindObj(False["ID"]);
                var Target = Salt.FindObj(False);
                var Value = Target.Value;
                return Value == "0";
            });
            
            // 진행중인 명령을 전부 완료하면 진행리스트 삭제, 완료리스트 등록
            if (BU.isEmpty(TrueList) && BU.isEmpty(FalseList)) {
                //BU.log("명령 등록!!!!!!");
                self.ControlCompleteList.push(AddControlObjCMD);
                var ProgressID = ObjProgress["ID"];
                var SpliteProgressID = ProgressID.split("→");
                var Src = SpliteProgressID[0];
                var Des = SpliteProgressID[1];
                    
                // 진행중인 해당명령 삭제
                self.ControlProgressList = _.reject(self.ControlProgressList, function (ControlProgress) {
                    return ControlProgress["ID"] == ObjProgress["ID"];
                });
                
                SendCompletePush(ObjProgress["ID"]);
                clearInterval(StartInterval);
            }

            // 설정한 명령 응답시간을 넘어서도 진행중인 명령을 수행하지 못한다면 1회에 한하여 재시도
            else if (CheckNumber > ChangeDeviceWatingSec && ObjProgress["Type"] != "Setting" && IsReTry == "0") {
                IsReTry = "1";
                CheckNumber = 0;
                _.each(TrueList, function (True) {
                    self.main.controlSerialData.emit("SetDevice", True, "1", function (err, res) { });
                });
                _.each(FalseList, function (False) {
                    self.main.controlSerialData.emit("SetDevice", False, "0", function (err, res) { });
                });
            }
            
            // 실패시 수동모드로 전환
            else if (CheckNumber > ChangeDeviceWatingSec && ObjProgress["Type"] != "Setting" && IsReTry == "1") {
                clearInterval(StartInterval);
                if (self.main.Control.ControlType == "Rain") {
                    self.EndMode();
                    self.main.Control.ManualMode.StartMode(function (err, res) { });
                }
            }
        }, 1000);
    }
    
    self.DeleteProgressManagement = function (ObjProgress, AddControlObjCMD) {
        //BU.log("DeleteProgressManagement 시작");
        //BU.CLI(ObjProgress);

        var TrueList = ObjProgress["TrueList"];
        var FalseList = ObjProgress["FalseList"];
        
        var ChangeDeviceLength = TrueList.length + FalseList.length;
        var ChangeDeviceWatingSec = ChangeDeviceLength * CheckProgressTime;

        var IsReTry = "0";
        var CheckNumber = 0;
        
        var StartInterval = setInterval(function () {
            //BU.log("self.main.Control.ControlType : " + self.main.Control.ControlType);
            if (self.main.Control.ControlType != "Rain") { clearInterval(StartInterval); return; }
            CheckNumber++;
            
            TrueList = _.reject(TrueList, function (True) {
                //var Target = Salt.FindObj(True["ID"]);
                var Target = Salt.FindObj(True);
                var Value = Target.Value;
                
                return Value == "1";
            });
            
            FalseList = _.reject(FalseList, function (False) {
                //var Target = Salt.FindObj(False["ID"]);
                var Target = Salt.FindObj(False);
                var Value = Target.Value;
                return Value == "0";
            });
            
            
            // 진행중인 명령을 전부 완료하면 진행리스트 삭제, 완료리스트 등록
            if (BU.isEmpty(TrueList) && BU.isEmpty(FalseList)) {
                self.ControlCompleteList = _.reject(self.ControlCompleteList, function (ControlComplete) { return AddControlObjCMD["PrevID"] == ControlComplete["ID"];});
                //BU.CLI(self.ControlCompleteList);
                BU.log("남아있는 완료 진행중")
                _.each(self.ControlCompleteList, function (C) {
                    BU.log(C["ID"]);
                });
                // 삭제 탐색 리스트 제거
                self.DeletingCMD = _.reject(self.DeletingCMD, function (CMD) { return CMD["ID"] == AddControlObjCMD["PrevID"]; });
                BU.log("남아있는 삭제 진행중")
                _.each(self.DeletingCMD, function (CMD) {
                    BU.log(CMD["ID"]);
                });
                //BU.CLI(self.DeletingCMD);
                //_.each(self.DeletingCMD, function (C) {
                //    BU.log(C["ID"]);
                //});
                clearInterval(StartInterval);
                //BU.CLI(self.ControlCompleteList);                                                                                                           
            }
            
            // 설정한 명령 응답시간을 넘어서도 진행중인 명령을 수행하지 못한다면 1회에 한하여 재시도
            else if (CheckNumber > ChangeDeviceWatingSec && ObjProgress["Type"] != "Setting" && IsReTry == "0") {
                BU.log("명령 재시도");
                IsReTry = "1";
                CheckNumber = 0;
                _.each(TrueList, function (True) {
                    self.main.controlSerialData.emit("SetDevice", True, "1", function (err, res) { });
                });
                _.each(FalseList, function (False) {
                    self.main.controlSerialData.emit("SetDevice", False, "0", function (err, res) { });
                });
            }
            
            // 실패시 수동모드로 전환
            else if (CheckNumber > ChangeDeviceWatingSec && ObjProgress["Type"] != "Setting" && IsReTry == "1") {
                clearInterval(StartInterval);
                if (self.main.Control.ControlType == "Rain") {
                    self.EndMode();
                    self.main.Control.ManualMode.StartMode(function (err, res) { });
                }
            }
        }, 1000);
    }
    
    self.DeviceErrorDetected = function (DeviceID) {
        self.EndMode();
        SendPush("Manual");
        
        var ErrorDeviceName = Salt.FindObj(DeviceID)["Name"];

        var gcm = new _gcm.GCM();
        var message = "장치(" + ErrorDeviceName + ")에 이상이 감지되어 수동모드로 변경합니다.";
        gcm.sendAll(message, "deviceError");
    }

    // 명령 삭제. 레퍼런스 키 복원
    var DeleteAndContinueControl = function (ControlCMD) {
        //BU.log("DeleteAndContinueControl");
        if (ControlCMD.constructor  ===  Array)
            ControlCMD = ControlCMD[0];

        //BU.CLI(ControlCMD);
        var ControlID = ControlCMD["ID"];
        var TrueList = ControlCMD["TrueList"];   // 삭제해야하는 목록
        var FalseList = ControlCMD["FalseList"];   // 추가해야하는 목록
        var RealTrueList = [];      // 진짜 삭제하는 리스트
        var RealFalseList = [];     // 진짜 작동하는 리스트
        //BU.CLI(ControlCMD["Src"]);
        var ThisControlGroup = _.findWhere(SaltData["RainControlList"], { "GroupID" : ControlCMD["Src"] });
        var NextDes = {};
        var IsFindDes = false;
        
        //BU.CLI(ThisControlGroup);
        // 후순위 명령 탐색
        _.each(ThisControlGroup["DesList"], function (Des) {
            if (IsFindDes) {
                var FindObjStatus = Salt.FindObj(Des["Des"]).GetStatus();
                // 해주 수위 체크
                if (FindObjStatus["WaterLevel"] < FindObjStatus["MaxWaterLevel"]) {
                    IsFindDes = false;
                    NextDes = Des;
                }
            }
                
            if (Des["Des"] == ControlCMD["Des"])
                IsFindDes = true;
        });
        
        //BU.CLI(NextDes);

        // 후순위 명령이 없다면 명령삭제, 레퍼런스키를 복원, 탐색 리스트에서 삭제
        if (BU.isEmpty(NextDes)) {
            DeleteControl(ControlCMD, "1");
            return;
        }

        // 진짜 닫아야 하는 리스트
        var ListCloseDevice = _.filter(TrueList, function (TrueID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
            var FindObjValue = FindObj.Value;
            return FindObjValue == "1";
        });

        EditToReferenceKeys(FalseList, TrueList);
        var ResultCheckControlClash = CheckControlClash(NextDes["True"], NextDes["False"]);
        var RealListCloseDevice = _.difference(ListCloseDevice, ResultCheckControlClash["RealTrueList"]);
        
        // 명령 충돌이 있다면 기존 명령만 삭제, 레퍼런스키 복원
        if (ResultCheckControlClash["IsClash"] == "1") {
            EditToReferenceKeys(TrueList, FalseList);
            DeleteControl(ControlCMD, "1");
            BU.log("해주의 수위가 찼으나 다음 명령이 충돌하여 대기상태로 들어갑니다.");
            //BU.CLI(ControlCMD);
            return;
        }
        
        // 기존 명령 삭제 리스트에 추가
        var DeleteTargetList = _.where(self.ControlCompleteList, { "Des" : ControlCMD["Des"] });
        _.each(DeleteTargetList, function (DeleteTarget) {
            if (!_.contains(self.DeletingCMD, DeleteTarget)) {
                self.DeletingCMD.push(DeleteTarget);
            }
        });
        BU.log("삭제 리스트");
        _.each(self.DeletingCMD, function (C) {
            BU.log(C["ID"]);
        });
        // 다음 명령 레퍼런스 키 적용
        EditToReferenceKeys(NextDes["True"], NextDes["False"]);
        
        // 신규 명령 추가
        var AddControlObjCMD = {};
        AddControlObjCMD["ID"] = ControlCMD["Src"] + "→" + NextDes["Des"];
        AddControlObjCMD["PrevID"] = ControlCMD["ID"];
        AddControlObjCMD["Src"] = ControlCMD["Src"];
        AddControlObjCMD["Des"] = NextDes["Des"];
        AddControlObjCMD["Delay"] = NextDes["Delay"];
        AddControlObjCMD["TrueList"] = NextDes["True"];
        AddControlObjCMD["FalseList"] = NextDes["False"];
        
        // 명령 취소 장치 수행기능 호출
        var SendObj = {};
        SendObj["ID"] = ControlCMD["Src"] + "→" + NextDes["Des"];
        SendObj["Src"] = ControlCMD["Src"];
        SendObj["Des"] = NextDes["Des"];
        SendObj["PrevID"] = ControlCMD["ID"];
        SendObj["Delay"] = NextDes["Delay"];
        SendObj["RealTrueList"] = ResultCheckControlClash["RealTrueList"];
        SendObj["RealFalseList"] = RealListCloseDevice;
        
        self.main.controlSerialData.emit("RunSimpleCMD", "AddDelete", SendObj, AddControlObjCMD);
    }

    
    // 명령 삭제. 레퍼런스 키 복원
    var DeleteControl = function (ControlCMD, IsNow){
        //BU.log("DeleteControl")
        //BU.CLI(ControlCMD);
        var ControlID = ControlCMD["ID"];
        var TrueList = ControlCMD["TrueList"];   // 삭제해야하는 목록
        var FalseList = ControlCMD["FalseList"];   // 추가해야하는 목록
        var RealTrueList = [];      // 진짜 삭제하는 리스트
        var RealFalseList = [];     // 진짜 작동하는 리스트
        
        
        // 진짜 닫아야 하는 리스트
        _.each(TrueList, function (TrueID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "1")
                RealTrueList.push(TrueID);
        });
        
        // 삭제 명령
        var AddControlObjCMD = {};
        AddControlObjCMD["ID"] = ControlID;
        AddControlObjCMD["PrevID"] = ControlID;
        AddControlObjCMD["Src"] = ControlCMD["Src"];
        AddControlObjCMD["Des"] = ControlCMD["Des"];
        AddControlObjCMD["Delay"] = ControlCMD["Delay"];
        AddControlObjCMD["TrueList"] = FalseList;
        AddControlObjCMD["FalseList"] = TrueList;
        
        // 명령 취소 장치 수행기능 호출
        var SendObj = {};
        SendObj["ID"] = ControlID;
        SendObj["Src"] = ControlCMD["Src"];
        SendObj["Des"] = ControlCMD["Des"];
        SendObj["PrevID"] = ControlID;
        SendObj["Delay"] = ControlCMD["Delay"];
        SendObj["RealTrueList"] = RealFalseList;
        SendObj["RealFalseList"] = RealTrueList;
        
        var DeleteTargetList = _.where(self.ControlCompleteList, { "Src" : ControlCMD["Src"] });
        _.each(DeleteTargetList, function (DeleteTarget) {
            if (!_.contains(self.DeletingCMD, DeleteTarget)) {
                self.DeletingCMD.push(DeleteTarget);
            }
        });
      
        var setTimeOutDelay = 0;
        if (ControlCMD["Delay"] != undefined)
            setTimeOutDelay = ControlCMD["Delay"];
        
        //BU.log("setTimeOutDelay : " + setTimeOutDelay);
        //BU.log("IsNow : " + IsNow);
        //BU.log("self.DeletingCMD : " + self.DeletingCMD);
        //BU.CLI(self.DeletingCMD);
        
        if (setTimeOutDelay == 0 || IsNow == "1") {
            EditToReferenceKeys(FalseList, TrueList);
            //BU.CLI("setTimeOutDelay = 0");
            //BU.CLI(SendObj);
            self.main.controlSerialData.emit("RunSimpleCMD", "Delete", SendObj, AddControlObjCMD);
        }
        else {
            // 수위가 낮아졌을 경우에는 명령과 명령 사이의 딜레이를 적용
            setTimeout(function () {
                //BU.CLI("setTimeOutDelay =asdasdsadsaa");
                //BU.CLI(SendObj);
                EditToReferenceKeys(FalseList, TrueList);
                
                self.main.controlSerialData.emit("RunSimpleCMD", "Delete", SendObj, AddControlObjCMD);
            }, 1000 * setTimeOutDelay)
        }
    }
    


    // 명령 충돌 체크
    var CheckControlClash = function (TrueList, FalseList){
        var returnvalue = {};
        returnvalue["IsClash"] = "1";
        returnvalue["IsClashTrue"] = [];
        returnvalue["IsClashFalse"] = [];
        returnvalue["RealTrueList"] = [];
        returnvalue["RealFalseList"] = [];

        var IsClashTrue = _.filter(TrueList, function (TrueID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : TrueID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "0")
                returnvalue["RealTrueList"].push(TrueID);
            return FindObj["Value"] < 0;
        });
        
        var IsClashFalse = _.filter(FalseList, function (FalseID) {
            var FindObj = _.findWhere(self.ControlReferenceKeys, { ID : FalseID });
            var FindObjValue = FindObj.Value;
            if (FindObjValue == "1")
                returnvalue["RealFalseList"].push(FalseID);
            return FindObj["Value"] > 0;
        });
        
        if (BU.isEmpty(IsClashTrue) && BU.isEmpty(IsClashFalse)) {
            returnvalue["IsClash"] = "0";
        }
        
        returnvalue["IsClashTrue"] = IsClashTrue;
        returnvalue["IsClashFalse"] = IsClashFalse;

        return returnvalue;
    }
    
    // 해당 그룹ID와 관련이 있는 진행중인 명령이 있는지 체크
    var FindExistGroupCMD = function (GroupID){
        var returnvalue = {};
        returnvalue["CompleteCMD"] = _.findWhere(self.ControlCompleteList, { "Src" : GroupID });
        returnvalue["ProgressCMD"] = _.findWhere(self.ControlProgressList, { "Src" : GroupID });
        returnvalue["DeletingCMD"] = _.findWhere(self.DeletingCMD, { "Src" : GroupID });
       
        return returnvalue;
    }
    
    // 해당 해주ID와 관련이 있는 진행중인 명령이 있는지 체크
    var FindExistWaterTankCMD = function (WaterTankID) {
        var returnvalue = {};
        

        var ExistCompleteCMD = _.where(self.ControlCompleteList, { "Des" : WaterTankID });
        var ExistProgressCMD = _.where(self.ControlProgressList, { "Des" : WaterTankID });
        var ExistDeletingCMD = _.where(self.DeletingCMD, { "Des" : WaterTankID });
        
        returnvalue["CompleteCMD"] = _.difference(ExistCompleteCMD, ExistDeletingCMD);
        returnvalue["ProgressCMD"] = _.difference(ExistProgressCMD, ExistDeletingCMD);
        returnvalue["DeletingCMD"] = ExistDeletingCMD;
        return returnvalue;
    }
    
    // 명령, 레퍼런스키 값, 모델 설정 수위 초기화
    var MakeControlStatus = function () {
        self.ControlProgressList = [];
        self.ControlCompleteList = [];
        self.ControlReferenceKeys = [];
        self.RainControlList = _.clone(SaltData["RainControlList"]);
        
        var UnionArrayControlDevice = _.union(
            SaltData["WaterDoorList"],
            SaltData["ValveList"],
            SaltData["PumpList"]
        );
        _.each(UnionArrayControlDevice, function (Device) {
            var AddObj = {};
            AddObj["ID"] = Device["ID"];
            AddObj["Value"] = 0;
            self.ControlReferenceKeys.push(AddObj);
        });
        
        var UnionArrayControView = _.union(
            SaltData["SaltPlateList"],
            SaltData["WaterTankList"]
        );
        _.each(UnionArrayControView, function (Target) {
            Target["SetWaterLevel"] = Target["MaxWaterLevel"];
        });
    }
    
    var EditToReferenceKeys = function (TrueList, FalseList) {
        _.each(TrueList, function (TrueID) {
            var ChangeTarget = _.findWhere(self.ControlReferenceKeys, { "ID" : TrueID });
            ChangeTarget["Value"]++;
        });
        _.each(FalseList, function (FalseID) {
            var ChangeTarget = _.findWhere(self.ControlReferenceKeys, { "ID" : FalseID });
            ChangeTarget["Value"]--;
        });
    }
    
    // 세팅모드의 장치상태를 점검
    var CheckDeviceStatus = function (SettingObj) {
        var IsDeviceError = _.filter(SettingObj["True"].concat(SettingObj["False"]), function (DeviceID) {
            var FindObj = Salt.FindObj(DeviceID);
            var ObjStatus = FindObj.GetStatus();
            //BU.CLI(ObjStatus)
            return ObjStatus.IsError != 0;
        });
        
        if (!BU.isEmpty(IsDeviceError)) {
            return true;
        }
        else
            return false;
    }

    var SendPush = function (ControlStatus) {
        self.main.Control.ControlType = ControlStatus;
        var SendObj = {};
        SendObj["CMD"] = "ControlStatus";
        SendObj["ControlStatus"] = ControlStatus;
        var pushServer = global.pushServer;
        pushServer.emit("sendAllClient", SendObj);
    }

    var SendCompletePush = function (CompleteID) {
        //BU.log("우천 명령 등록 완료 : " + CompleteID);
        //_.each(self.ControlCompleteList, function (Complete) {
        //    BU.log(Complete["ID"]);
        //});
        //BU.log("End");
        //BU.CLI(self.ControlCompleteList);
        //BU.CLI(self.ControlProgressList);
        
        //var SpliteCompleteID = CompleteID.split("→");
        //var SrcName = FindObjName(SpliteCompleteID[0]);
        //var DesName = FindObjName(SpliteCompleteID[1]);
        

        //var SendObj = {};
        //SendObj["CMD"] = "CompleteCMD";
        //SendObj["Message"] = "명령(" + SrcName + "→" + DesName + ")을 수행합니다.";
        //var pushServer = global.worker.socketServer.push;
        ////BU.log("샌드푸시");
        //pushServer.emit("sendAllClient", SendObj);

        //BU.log("명령(" + SrcName + "→" + DesName + ")을 수행합니다.");
    }
    
    var SendDeletePush = function (CompleteID) {
        BU.log("우천 명령 제거 완료 : " + CompleteID);

        //BU.CLI(self.ControlReferenceKeys);
        
        //var SpliteCompleteID = CompleteID.split("→");
        //var SrcName = FindObjName(SpliteCompleteID[0]);
        //var DesName = FindObjName(SpliteCompleteID[1]);
        
        
        //var SendObj = {};
        //SendObj["CMD"] = "DeleteCMD";
        //SendObj["Message"] = "명령(" + SrcName + "→" + DesName + ")이 완료되었습니다.";
        //var pushServer = global.worker.socketServer.push;
        ////BU.log("샌드푸시");
        //pushServer.emit("sendAllClient", SendObj);
        
        //BU.log("명령(" + SrcName + "→" + DesName + ")이 완료되었습니다.");
    }
}
util.inherits(RainMode, events.EventEmitter);
exports.RainMode = RainMode;