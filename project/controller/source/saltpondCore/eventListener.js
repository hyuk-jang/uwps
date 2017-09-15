var events = require('events');
var util = require('util');
var _ = require("underscore");

// var BU = require('../util/baseUtil.js');
var BI = require('../db/BI.js');
var _gcm = require("../init/gcm.js");
var ControlModel = require("./commander.js");

var Control = function (main){
    events.EventEmitter.call(this);
    var self = this;
    self.main = main;
    // BU.CLI(main)
    // var setInfo = main.setInfo;
    var mapObj = main.mapObj;

    var Salt = self.main.Salt;
    var SaltData = Salt.SaltData;
    
    // 자동/수동 여부 
    self.ControlType = "";       // Manual: 수동, Auto: 자동, Rain: 우천
    //self.InputControlType = "";

    self.ManualMode;
    self.AutomationMode;
    self.RainMode;
    
    self.IsSettingControl = "0";

    self.on("Start", function () {
        // BU.log("Control Start");
        MakeShortControl();

        self.ManualMode = new ControlModel.ManualMode();
        self.AutomationMode = new ControlModel.AutomationMode();
        self.RainMode = new ControlModel.RainMode();
        
        //self.ManualMode.Reset();
        //CheckCompleteStatusCheck();
    });
    
    self.on("CompleteStatusCheck", function (CheckValue) {
        //BU.log("CompleteStatusCheck CheckValue: " + CheckValue);
        if(CheckValue == "0") {
            BU.log("장치 상태값 탐색 완료. 수동 모드 시작준비");
            self.IsSettingControl = "1";
            self.ManualMode.Reset();
        }
        else {
            //BU.log("이미 리셋");
        }

    });
    
    var CheckCompleteStatusCheck = function (){
        if (self.main.controlSerialData.IsCompleteStatusCheck == "1") {
            BU.log("장치 상태값 탐색 완료. 수동 모드 시작준비");
            self.ManualMode.Reset();
        }
            
        else {
            var SetTimeout = setTimeout(function () {
                BU.log("CheckCompleteStatusCheck");
                CheckCompleteStatusCheck();
            }, 1000);
        } 
            
    }
    
    self.on("ChangeControlMode", function (ControlType, CallBack) {
        //BU.log("ChangeControlMode"); 
        
        var err = {};
        //BU.log("ControlType : " + ControlType);
        if (self.ControlType == "") {
            err["IsError"] = 1;
            err["Message"] = "아직 초기화가 되지 않았습니다. 잠시 후 다시 시도해주십시오.";
            CallBack(err);
            BU.log("아직 초기화가 되지 않았습니다. 잠시 후 다시 시도해주십시오.");
            return;
        }

        if (self.ControlType == ControlType) {
            err["IsError"] = 1;
            err["Message"] = "같은 제어 상태입니다.";
            CallBack(err);
            BU.log("같은 제어 상태입니다.");
            return;
        }
        else if (ControlType != "Manual" && ControlType != "Auto" && ControlType != "Rain") {
            err["IsError"] = 1;
            err["Message"] = "알수없는 제어상태값입니다.";
            CallBack(err);
            BU.log("알수없는 제어상태값입니다.");
            return;
        }
        else if (ControlType == "Auto" && self.ControlType == "Rain") {
            err["IsError"] = 1;
            err["Message"] = "우천모드에서는 자동모드로 변경할 수 없습니다.";
            CallBack(err);
            BU.log("우천모드에서는 자동모드로 변경할 수 없습니다.");
            return;
        }
        //else if (ControlType == "Rain" && self.main.WeatherDeviceStatus.Rain_Status == "0") {
        //    err["IsError"] = 1;
        //    err["Message"] = "우천이 감지되지 않아 우천모드로 변경할 수 없습니다.";
        //    CallBack(err);
        //    BU.log("우천이 감지되지 않아 우천모드로 변경할 수 없습니다.");
        //    return;
        //}
        
        if (self.ControlType == "Auto")
            self.AutomationMode.EndMode();
        else if (self.ControlType == "Rain")
            self.RainMode.EndMode();

        // 자동모드 전환
        if (ControlType == "Auto") {
            self.AutomationMode.StartMode(CallBack);
        }
        // 수동모드 전환
        else if (ControlType == "Manual") {
            self.ManualMode.StartMode(CallBack);
        }
        // 우천모드 전환
        else if (ControlType == "Rain") {
            self.RainMode.StartMode(CallBack);
        }
    });


    /************************************************************************************************/
    /**************************          장치 상태값 수신 관련 시작         *************************/
    /************************************************************************************************/
    // 수문 상태값 변경
    self.on("UpdateWaterDoor", function (WaterDoorID, WaterDoorValue) {
        var ParentsList = Salt.FindParent(WaterDoorID, "WaterDoor");
        var WaterTankList = _.where(ParentsList, { "Type" : "WaterTank" });

        _.each(WaterTankList, function (WaterTank) {
            if (WaterDoorValue == "1") {
                WaterTank["IsFeedWater"] = "1";
                return;
            }
            else if (WaterDoorValue == "0" && BU.isEmpty(GetOpendWaterTankDoor(WaterTank["ID"]))) {
                // 해주와 연결된 파이프 라인이 있는지 탐색
                var IsExistPipeLine = _.contains(_.union(_.flatten(_.pluck(SaltData["ValveRankList"], "Low"))), WaterTank["ID"]);
                // 파이프 라인이 있다면 연결된 밸브리스트 탐색
                if (IsExistPipeLine) {
                    var ListWaterTankWithValve = _.filter(SaltData["ValveRankList"], function (ValveRank) {
                        return _.contains(ValveRank["Low"], WaterTank["ID"]);
                    });
                    
                    var ResultSearchPipeLine = [];
                    
                    // 밸브 리스트들의 상위로 올라가면서 해당 장치가 작동 or 열려있는지 확인. 최종 목적지인 펌프까지 한개라도 작동중인 파이프라인이 있다면 급수중인걸로 판별
                    _.each(ListWaterTankWithValve, function (WaterTankWithValve) {
                        CheckServiceablePipeLine(WaterTankWithValve["ID"], function (err, result) {
                            if (err) {
                                BU.log(err);
                                ResultSearchPipeLine.push(false);
                            }
                            else {
                                ResultSearchPipeLine.push(true);
                                //BU.log("사용가능한 파이프 라인이 존재합니다.");
                            }
                        });
                    });
                    
                    // 작동중인 파이프라인이 없다면 최종 급수시간 반영
                    if (!_.contains(ResultSearchPipeLine, true)) {
                        WaterTank["IsFeedWater"] = "0";
                        WaterTank["RecentFeedWaterEndDate"] = BU.convertDateToText(new Date());
                        //BU.log("작동중인 파이프라인이 없다면 최종 급수시간 반영 : " + WaterTank["RecentFeedWaterEndDate"]);
                    }
                }
                // 해주와 연결된 파이프라인이 존재하지 않는다면 최종 급수시간 반영
                else {
                    WaterTank["IsFeedWater"] = "0";
                    WaterTank["RecentFeedWaterEndDate"] = BU.convertDateToText(new Date());
                    //BU.log("해주와 연결된 파이프라인이 존재하지 않는다면 최종 급수시간 반영 : " + WaterTank["RecentFeedWaterEndDate"]);
                }
            }
        });
    });

    // 펌프가 켜질경우 밸브 상태에 따라 조건체크
    self.on("PumpStatusChange", function (DeviceID, IsPumpOn, CallBack) {
        if (self.ControlType == "Manual")
            self.ManualMode.PumpStatusChange(DeviceID, IsPumpOn, CallBack);
    });
    
    // 펌프 상태값 변경
    self.on("UpdatePump", function (DeviceID, IsPumpOn) {
        CheckFeedWaterByPumpOrValve(DeviceID, IsPumpOn);
    });
    
    // 밸브 상태값 변경()변경에 따른 펌프 Off 수행
    self.on("ValveStatusChange", function (DeviceID, IsValvesOpen) {
        if (self.ControlType == "Manual")
            self.ManualMode.ValveStatusChange(DeviceID, IsValvesOpen);

        CheckFeedWaterByPumpOrValve(DeviceID, IsValvesOpen);
    });
    
    // 염도 상태값 변경
    self.on("UpdateSalinity", function (SalinityID, Salinity) {
        if (self.ControlType == "Auto" && self.AutomationMode.IsStartAutomation == "1")
            self.AutomationMode.UpdateSalinity(SalinityID, Salinity);
        
        var FindObj = Salt.FindParent(SalinityID, "Salinity")[0];
        // 염도가 25도 이상, 염판이 결정지라면 GCM 메시지 체크
        if (FindObj["Type"] == "SaltPlate") {
            if (Salinity >= 25 && FindObj["PlateType"].indexOf("Crystallizing") !== -1 && FindObj["IsSendedGCM"] === "0") {
                FindObj["IsSendedGCM"] = "1";
                var date = new Date();
                date.setHours(date.getHours() + 6);
                var TextAlarmDate = BU.convertDateToText(date, "kor", 4, 1);

                var gcm = new _gcm.GCM();
                var message = FindObj["Name"] + "의 예상 채염 시각은 " + TextAlarmDate + "입니다.";
                gcm.sendAll(message, "default");
            }
            if (Salinity < 20 && FindObj["PlateType"].indexOf("Crystallizing") !== -1) {
                FindObj["IsSendedGCM"] = "0";
            }
        }
    });
    
    // 수위 상태값 변경
    self.on("UpdateWaterLevel", function (WaterLevelID) {
        if (self.ControlType == "Manual")
            self.ManualMode.RemoveFeedWater(WaterLevelID);
        else if (self.ControlType == "Rain") {
            self.RainMode.CheckWaterTankWaterLevel(WaterLevelID);
        }
    });
    
    
    self.on("UpdateBattery", function (DeviceID, Battery) {
        //BU.log("배터리 업데이트", DeviceID, Battery)
        var deviceCategory = "";
        if (DeviceID.indexOf("WD") != -1)
            deviceCategory = "WaterDoor";
        else if (DeviceID.indexOf("V") != -1)
            deviceCategory = "Valve";
        else if (DeviceID.indexOf("P") != -1)
            deviceCategory = "Pump";
        else
            return;
        //BU.log("deviceCategory", deviceCategory)
        
        var findObj = Salt.FindObj(DeviceID);
        // 배터리가 9V 이하로 떨어질 경우
        if (Battery < 9) {
            //BU.log("findObj", deviceCategory, findObj)

            if (findObj.isSendBatteryGCM == "0") {
                findObj.isSendBatteryGCM = "1";
                var date = new Date();
                //date.setHours(date.getHours() + 6);
                var TextAlarmDate = BU.convertDateToText(date);
                var SendTextDate = TextAlarmDate.substring(5, 7) + "월 ";
                SendTextDate = SendTextDate + TextAlarmDate.substring(8, 10) + "일 ";
                SendTextDate = SendTextDate + TextAlarmDate.substring(11, 13) + "시 ";
                SendTextDate = SendTextDate + TextAlarmDate.substring(14, 16) + "분";

                var currDate = BU.convertDateToText(new Date(), "kor", 4, 1);

                var gcm = new _gcm.GCM();
                var message = findObj.Name + "의 배터리(적정:9V, 현재:" + findObj.Battery + "V)가 부족합니다. 발생 시각: " + currDate;
                gcm.sendAll(message, "deviceError");
            }
       


        }
        else{
            findObj.isSendBatteryGCM = "0";
        }

        
    });
    

    /************************************************************************************************/
    /**************************          장치 상태값 수신 관련 끝         *************************/
    /************************************************************************************************/
    
    
    
    
    
    
    

    /************************************************************************************************/
    /*****************************          수동 제어 관련 시작         *****************************/
    /************************************************************************************************/
    // 장치 개별제어 명령
    self.on("DeviceControl", function (DeviceID, DeviceValue, DeviceType, CallBack) {
        self.ManualMode.DeviceOrder(DeviceID, DeviceValue, DeviceType, CallBack);
    });
    
    
    /************************************************************************************************/
    /*****************************          수동 제어 관련 끝         *****************************/
    /************************************************************************************************/
    
    
    
    
    
    
    /************************************************************************************************/
    /*****************************          자동 제어 관련 시작         *****************************/
    /************************************************************************************************/
    // 명령제어
    self.on("OrderControl", function (SimpleCMD, CallBack) {
        //BU.log("OrderControl");
        self.AutomationMode.OrderControl(SimpleCMD, CallBack);
    });
    
    // 명령취소
    self.on("CancelControl", function (SimpleCMD, CallBack) {
        BU.log("CancelControl");
        self.AutomationMode.DeleteAutomationCommand(SimpleCMD["Src"], SimpleCMD["Des"], "", CallBack);
    });
    
    // 진행중 명령 관리
    self.on("AddProgressManagement", function (ObjProgress, AddControlObjCMD, CallBack) {
        //if (self.InputControlType == "Rain")
        //    self.RainMode.AddProgressManagement(ObjProgress, AddControlObjCMD, CallBack);
        //else
        //    self.AutomationMode.AddProgressManagement(ObjProgress, AddControlObjCMD, CallBack);

        if (self.ControlType == "Rain")
            self.RainMode.AddProgressManagement(ObjProgress, AddControlObjCMD, CallBack);
        else if(self.ControlType == "Auto")
            self.AutomationMode.AddProgressManagement(ObjProgress, AddControlObjCMD, CallBack);
    });
    
    // 삭제중인 명령 관리
    self.on("DeleteProgressManagement", function (ObjProgress, AddControlObjCMD, CallBack) {
        if (self.ControlType == "Rain")
            self.RainMode.DeleteProgressManagement(ObjProgress, AddControlObjCMD, CallBack);
        else if (self.ControlType == "Auto")
            self.AutomationMode.DeleteProgressManagement(ObjProgress, AddControlObjCMD, CallBack);
    });
    
    // 장치 에러유무 체크
    self.on("SendDeviceErrorGCM", function (DeviceID) {
        if (self.ControlType == "Auto" && self.AutomationMode.IsStartAutomation == "1")
            self.AutomationMode.DeviceErrorDetected(DeviceID);
        else if (self.ControlType == "Rain")
            self.RainMode.DeviceErrorDetected(DeviceID);
        self.ManualMode.Reset();
    });
    
    /************************************************************************************************/
    /*****************************          자동 제어 관련 끝         *****************************/
    /************************************************************************************************/

    
    
    
    
    
    // 해당 장치의 상태를 판별. 해당 장치가 작동 or 열려있다면 상위 장치 탐색(재귀). 최종 목적지인 펌프가 작동 중이라면 작동중인 파이프라인이 있다고 판별.
    var CheckServiceablePipeLine = function (DeviceID, CallBack) {
        BU.log("CheckServiceablePipeLine");
        var Serviceable = [];
        GetIsFeedWaterByPump(DeviceID, function (result) { Serviceable.push(result) });
        
        if (_.contains(Serviceable, true)) {
            BU.log("CheckServiceablePipeLine 참이다 : " + DeviceID);
            CallBack("");
        }
        else {
            var sendObj = {};
            sendObj["IsError"] = 1;
            sendObj["Message"] = "장치(" + DeviceID + ")와 연결된 급수중인 파이프라인이 없습니다.";
            CallBack(sendObj);
        }
    }
    
    // 해당 ID를 가진 장치의 상태를 점검. 작동중일 경우 상위 장치 탐색. (재귀)
    var GetIsFeedWaterByPump = function (DeviceID, CallBack) {
        var FindObjStatus = Salt.FindObj(DeviceID).GetStatus();
        
        if (DeviceID.indexOf("P") == 0) {
            if (FindObjStatus["Value"] == "1")
                CallBack(true);
            else
                CallBack(false);
            return;
        }
        else if (FindObjStatus["Value"] == "1") {
            var ValveRank = _.findWhere(SaltData["ValveRankList"], { "ID" : DeviceID });
            var ValveRankHigh = ValveRank["High"];
            _.each(ValveRankHigh, function (High) {
                GetIsFeedWaterByPump(High, CallBack);
            });
        }
        else
            CallBack(false);
    }
    
    // 해주 수문 중 열려있는게 있는지 판별
    var GetOpendWaterTankDoor = function (WaterTankID) {
        var WaterTankObj = Salt.FindObj(WaterTankID);
        var OpendWaterDoor = [];
        OpendWaterDoor = _.filter(WaterTankObj["WaterDoorList"], function (WaterDoor) {
            return WaterDoor["Value"] == "1";
        });
        
        if (OpendWaterDoor === undefined)
            OpendWaterDoor = [];
        
        return OpendWaterDoor;
    }
    
    
    // 해당 장치를 기준으로 하위에 해주가 존재하며 해당 루트의 밸브가 열려있을 경우. 상위 장치 탐색 및 자신의 상태값에 따라 제어
    var CheckFeedWaterByPumpOrValve = function (DeviceID, DeviceValue) {
        //BU.log("CheckFeedWaterByPumpOrValve");
        CheckServiceablePipeLineAndNodeIsWaterTank(DeviceID, function (WaterTankList) {
            if (DeviceValue == "0") {
                _.each(WaterTankList, function (WaterTank) {
                    var FindObj = Salt.FindObj(WaterTank);
                    //BU.log("IsFeedWater : " + FindObj["IsFeedWater"]);
                    if (FindObj["IsFeedWater"] == "1") {
                        var IsWaterDoorOpen = "0";
                        var IsServiceablePipeLine = "0";
                        
                        _.each(FindObj["WaterDoorList"], function (WaterDoor) {
                            if (WaterDoor["Value"] == "1")
                                IsWaterDoorOpen = "1";
                        });
                        
                        _.each(FindObj["ValveList"], function (Valve) {
                            CheckServiceablePipeLine(Valve["ID"], function (err, result) {
                                var ResultSearchPipeLine = [];
                                if (err) {
                                    BU.log(err);
                                    ResultSearchPipeLine.push(false);
                                }
                                else {
                                    ResultSearchPipeLine.push(true);
                                    //BU.log("사용가능한 파이프 라인이 존재합니다." + WaterTank );
                                }
                                
                                // 작동중인 파이프라인이 없다면 최종 급수시간 반영
                                if (_.contains(ResultSearchPipeLine, true)) {
                                    IsServiceablePipeLine = "1";
                                    //BU.log("(밸브펌프) 작동중인 파이프라인이 있으므로 급수중으로 변경: dafsdfs" + WaterTank );
                                }
                            });
                        });
                        
                        if (IsWaterDoorOpen == "0" && IsServiceablePipeLine == "0") {
                            FindObj["RecentFeedWaterEndDate"] = BU.convertDateToText(new Date());
                            FindObj["IsFeedWater"] = "0";
                            //BU.log("밸브 펌프) 최종 급수 시간을 기입 : " +  WaterTank  + FindObj["RecentFeedWaterEndDate"]);
                        }
                            
                    }
                });
            }
            // 밸브나 펌프를 작동시킬 경우
            else {
                //BU.log("밸브나 펌프를 작동시킬 경우");
                _.each(WaterTankList, function (WaterTank) {
                    var FindObj = Salt.FindObj(WaterTank);
                    BU.log("IsFeedWater : " + FindObj["IsFeedWater"]);
                    // 하위 해주가 급수 정지일때만 실행
                    if (FindObj["IsFeedWater"] == "0") {
                        CheckServiceablePipeLine(DeviceID, function (err, result) {
                            var ResultSearchPipeLine = [];
                            if (err) {
                                BU.log(err);
                                ResultSearchPipeLine.push(false);
                            }
                            else {
                                ResultSearchPipeLine.push(true);
                                //BU.log("열릴경우 사용가능한 파이프 라인이 존재합니다." + WaterTank);
                            }
                            
                            // 작동중인 파이프라인이 없다면 최종 급수시간 반영
                            if (_.contains(ResultSearchPipeLine, true)) {
                                FindObj["IsFeedWater"] = "1";
                                //BU.log("(밸브펌프) 작동중인 파이프라인이 있으므로 급수중으로 변경: " + WaterTank);
                            }
                        });
                    }
                });
            }
        });
    }
    
    // 해당 장치를 기준으로 하위에 해주가 존재하며 해당 루트의 밸브가 열려있는 해주 이름 반환
    var CheckServiceablePipeLineAndNodeIsWaterTank = function (DeviceID, CallBack) {
        //BU.log("CheckServiceablePipeLineAndNodeIsWaterTank");
        var Serviceable = [];
        GetServiceablePipeLineAndNodeIsWaterTank(DeviceID, function (result) {
            
            if (result != "")
                Serviceable.push(result)
            //BU.log("result" + result);
        });
        
        CallBack(Serviceable);
    }
    
    // 파이프라인의 끝에 해주가 존재하는지 판별
    var GetServiceablePipeLineAndNodeIsWaterTank = function (TargetID, CallBack) {
        var ValveRank = _.findWhere(SaltData["ValveRankList"], { "ID" : TargetID });
        var ValveRankLow = ValveRank["Low"];
        var ValveStatus = [];
        _.each(ValveRankLow, function (Low) {
            var LowStatus = Salt.FindObj(Low).GetStatus();
            if (LowStatus["ID"].indexOf("WT") == 0) {
                CallBack(LowStatus["ID"]);
                return;
            }
            else {
                if (LowStatus["Value"] == "1") {
                    GetServiceablePipeLineAndNodeIsWaterTank(LowStatus["ID"], CallBack);
                }
                    
                else {
                    //BU.log("밸브닫혀져 종료 : " + LowStatus["ID"]);
                    CallBack("");
                    return;
                }
            }
        });
    }
    
    
    

    // App으로 보내줄 제어명령 작성(Src와 Des만 추출)
    var MakeShortControl = function () {
        // BU.CLI(mapObj)
        var controlMapObj = mapObj.mapControl;
        var ShortListSimple = [];
        _.each(controlMapObj.SimpleMode, function (List) {
            var AddObj = {};
            AddObj["Src"] = List["SrcID"];
            var DesList = [];
            _.each(List["DesList"], function (Des) {
                if (Des["Type"] !== "Emulator") {
                    DesList.push(Des["DesID"]);
                }
            });
            AddObj["Des"] = DesList;
            ShortListSimple.push(AddObj);
        });
        main.ShortListSimple = ShortListSimple;

        var ShortListAutomation = [];
        _.each(controlMapObj.AutomationMode, function (List) {
            var AddObj = {};
            AddObj["Src"] = List["Src"];
            AddObj["Des"] = List["Des"];
            ShortListAutomation.push(AddObj);
        });
        main.ShortListAutomation = ShortListAutomation;
    }

    function SendPush(ControlStatus) {
        BU.log("ControlStatus : " + ControlStatus);
        self.ControlType = ControlStatus;
        var SendObj = {};
        SendObj["CMD"] = "ControlStatus";
        SendObj["ControlStatus"] = ControlStatus;
        var PushServer = self.main.PushServer;
        //BU.log("샌드푸시");
        PushServer.emit("sendAllClient", SendObj);
    }
}
util.inherits(Control, events.EventEmitter);
exports.Control = Control;