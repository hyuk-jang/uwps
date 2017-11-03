var _ = require('underscore');
var events = require('events');
var util = require('util');
var net = require("net");

const BU = require('base-util-jh').baseUtil;
var _GCM = require("../init/gcm.js");
var _Smbuffer = require("../util/smBuffer.js");

const config = require('./config.js')

var controlSerialData = function (main) {
    events.EventEmitter.call(this);
    var self = this;
    
    //main = global.main; //메인 프로그램
    var setInfo = global.fixmeConfig;
    var Salt = main.Salt;

    self.saltData = main.Salt.SaltData;
    self.DeviceInfo_List = Salt.DeviceList();
    
    var ReconnectIntervalTime = 5;     // 장치와 연결이 끊어질 경우 재연결 시도 인터벌(초)
    var DeviceTimeOutTime = 10;         // 장치와의 연결을 시도하는 최대 시간(초). 이 시간을 넘어서 연결이 안될경우 타임아웃으로 간주
    
    // 개발 테스트를 위한 가상장치 Socket 정보
    var socketDeviceIP = 'localhost';
    var socketDevicePort = 12345;
    // Zigbee 연결 정보
    var serialDevicePort = config.current.serialDevicePort;
    var serialDeviceBaudRate = config.current.serialDeviceBaudRate;
    
    // Socket 접속 유무
    self.SocketClient = null;
    // Zigbee 접속 리스트
    self.SerialClient = null
    
    
    // 시리얼 조작 정보
    self.xbeeSH = setInfo.xbeeSH;       // Serial Number High

    // 실제 제어 명령 코드
    self.cmdWaterDoorOpen = "@cgo";
    self.cmdWaterDoorClose = "@cgc";
    self.cmdValveOpen = "@cvo";
    self.cmdValveClose = "@cvc";
    self.cmdPumpOpen = "@cpo";
    self.cmdPumpClose = "@cpc";
    self.cmdDeviceGetStatus = "@sts";
    self.cmdDeviceGetSalinity = "@csm";
    
    // 코디네이터로 데이터 전송 유무
    self.sendCoordinatorTimer = null;

    // 컨트롤러 실행 시 최초 1회 상태값 추출 완료 여부
    self.IsCompleteStatusCheck = "0";
    // 시리얼 제어에 관련된 변수
    self.SerialControlObj = [];
    //self.SerialControlObj.IsInitSetting = "0";               // 0 : 대기, 1 : 요청중, 2 : 완료
    self.SerialControlObj.InitCountNumber = 0;             //  Real Board ID 추출하기 위한 넘버링
    //self.SerialControlObj.SalinityCountNumber = 0;             //  주기적인 상태 값 조회 시도 횟수. 횟수를 통해 염도를 측정할 타이밍을 잡음
    self.SerialControlObj.NowSerialControlBoardID = "";      //  제어명령 보드 ID
    //self.SerialControlObj.NowSerialStatusBoardID = "";       //  상태값 추출 보드 ID
    self.SerialControlObj.arrCmdPeriodic = [];    //  주기적인 상태값 요청 명령 리스트
    self.SerialControlObj.arrCmdControl = [];     //  제어명령 리스트
    self.SerialControlObj.SerialSendCommandType = "";        //  명령 타입 ("Order" 와 세부적인 상태값 요청명령 타입으로 나뉨)
    self.SerialControlObj.LastestSerialCommand = null;         //  마지막에 지시한 명령
    self.SerialControlObj.ThisControlOrderObj = {};          //  현재 제어 명령
    self.SerialControlObj.GetStatusOrderObj = {};               // 제어명령 결과값이 상이할 경우 해당 장치 상태 정보를 요청할 명령 저장
    self.SerialControlObj.ErrorDetectedList = [];            // 장치 데이터를 받지 못한 장치 리스트(장치값을 받았을 경우 해당 아이디 제거, 1회에 한하여 유예를 두기위함)
    
    
    // 명령 실패 시 재시도 횟수
    self.RetryNumber = 0;
    // 시리얼로 데이터 보내는 타이머(0.1초 딜레이로 설정됨)
    self.ReSendDataSetTimer = "";
    //var IsDeviceConnect = "0";
    var IsNeedSalinityCheck = "1";
    // 최초 시작
    self.on("Start", function () {
        //ConnectToSocketDevice(socketDeviceIP, socketDevicePort);
        //if (setInfo.isUsedSerial == "0") {
        //    self.IsCompleteStatusCheck = "1";
        //}

        if (setInfo.isUsedSerial == "0" || setInfo.isUsedSerial == "1") {
            BU.log("소켓 사용 모드")
            ConnectToSocketDevice(socketDeviceIP, socketDevicePort);
            global.main.Control.ControlType = "Manual";
        }
        
        if (setInfo.isUsedSerial == "1" || setInfo.isUsedSerial == "2") {
            BU.log("시리얼 사용 모드")
            self.initXbee();
            ConnectToSerialDevice(serialDevicePort, serialDeviceBaudRate);
        }
        main.Control.emit("Start");
        SalinityCheckTimerStart();
    });
    
    // 5분마다 염도 측정
    var SalinityCheckTimerStart = function (){
        var SetTimer = setTimeout(function () {
            IsNeedSalinityCheck = "1";
            SalinityCheckTimerStart();
        }, 1000 * 60 * 5);
    }
    // 장치 단일 제어
    self.on("SetDevice", function (DeviceID, DeviceValue, CallBack) {
        BU.log("SetDevice", DeviceID, DeviceValue);
        
        var ChangeDeviceList = [];
        var ChangeDevice = {};
        ChangeDevice["ID"] = DeviceID;
        ChangeDevice["Value"] = DeviceValue;
        ChangeDeviceList.push(ChangeDevice);
        
        var ReturnResults = [];
        // 실제 명령 프로토콜 생성 구문 호출
        DeviceWriter(ChangeDeviceList, function (result) {
            ReturnResults.push(result);
            
            var ReturnResult = CheckDeviceChangeResult(ReturnResults);
            // 장치에 이상(false)이 있다고 판단되면 받은 에러구문 콜백에 실어 리턴
            if (!BU.isEmpty(ReturnResult))
                CallBack(ReturnResult);
            // 장치 명령 제어 수와 완료 응답받은 장치 수가 같다면 이상없다고 콜백 처리
            if (ChangeDeviceList.length == ReturnResults.length) {
                CallBack("");
            }
        });
    });
    // 다중 장치 제어
    self.on("SetDeviceList", function (DeviceList, DeviceValue, CallBack) {
        //BU.log("SetDeviceList");
        BU.CLI("DeviceList", DeviceList, "DeviceValue", DeviceValue);
        //BU.log("DeviceValue : " + DeviceValue);
        var ChangeDeviceList = [];
        var ReturnResults = [];
        // 장치를 보호하기 위한 장치 제어 순서 변경
        _.each(SortDeviceByValue(DeviceList, DeviceValue), function (Device) {
            var ChangeDevice = {};
            ChangeDevice["ID"] = Device;
            ChangeDevice["Value"] = DeviceValue;
            ChangeDeviceList.push(ChangeDevice);
        });
        // 실제 명령 프로토콜 생성 구문 호출
        DeviceWriter(ChangeDeviceList, function (result) {
            ReturnResults.push(result);
            // 장치에 이상(false)이 있다고 판단되면 받은 에러구문 콜백에 실어 리턴
            var ReturnResult = CheckDeviceChangeResult(ReturnResults);
            if (!BU.isEmpty(ReturnResult))
                CallBack(ReturnResult);
            // 장치 명령 제어 수와 완료 응답받은 장치 수가 같다면 이상없다고 콜백 처리
            if (ChangeDeviceList.length == ReturnResults.length) {
                CallBack("");
            }
        });
    });
    
    // 장체 제어 복합 구문. 명령 추가, 명령 삭제 등의 구문 처리
    self.on("RunSimpleCMD", function (Type, SendObj, AddControlObjCMD) {
        BU.log("RunSimpleCMD");
        //BU.CLI("Type", Type, "SendObj", SendObj)
        //BU.CLI("Type", Type, "SendObj", SendObj, "AddControlObjCMD", AddControlObjCMD)
        var err = {};
        var TrueList = [];
        var FalseList = [];
        
        var ChangeDeviceList = [];
        var ReturnResults = [];
        
        // 동작시키는 값이 "1" 인 장치 ID 리스트를 오브젝트 형식으로 변환 후 TrueList 배열에 집어 넣음
        _.each(SortDeviceByValue(SendObj["RealTrueList"], "1"), function (deviceID) {
            
            //var FindObj = Salt.FindObj(deviceID).GetStatus();
            //if (FindObj["Value"] == "0" && FindObj["IsError"] == "0") {
                var AddObj = {};
                AddObj["ID"] = deviceID;
                AddObj["Value"] = 1;
                TrueList.push(deviceID);
                ChangeDeviceList.push(AddObj);
            //}
        });
        // 동작시키는 값이 "0" 인 장치 ID 리스트를 오브젝트 형식으로 변환 후 FalseList 배열에 집어 넣음
        _.each(SortDeviceByValue(SendObj["RealFalseList"], "0"), function (deviceID) {
            //BU.CLI(deviceID);
            //var FindObj = Salt.FindObj(False).GetStatus();
            //if (FindObj["Value"] == "1" && FindObj["IsError"] == "0") {
                var AddObj = {};
                AddObj["ID"] = deviceID;
                AddObj["Value"] = 0;
                FalseList.push(deviceID);
                ChangeDeviceList.push(AddObj);
            //}
        });
        
        // 작업 요청 객체 생성
        var ProgressObj = {};
        ProgressObj["ID"] = SendObj["ID"];
        ProgressObj["Src"] = SendObj["Src"];
        ProgressObj["Des"] = SendObj["Des"];
        ProgressObj["Type"] = Type;
        ProgressObj["SetWaterLevel"] = SendObj["SetWaterLevel"];
        ProgressObj["TrueList"] = TrueList;
        ProgressObj["FalseList"] = FalseList;
        
        
        

        
        //if (BU.isEmpty(TrueList.concat(FalseList))) {
        //    BU.log("RunSimpleCMD 장치조작이 없음. ");
        //    return;
        //}

        //  장치 명령 프로토콜 생성 구문 호출. 콜백 검증 구문은 빠진듯(ControlModel Interval Check로 대체됨.)
        DeviceWriter(ChangeDeviceList, function (result) {});
    
        if (Type == "Add") {
            main.Control.emit("AddProgressManagement", ProgressObj, AddControlObjCMD);
        }
        else if (Type == "Delete") {
            //BU.log("Delete");
            main.Control.emit("DeleteProgressManagement", ProgressObj, AddControlObjCMD);
        }
        else if (Type == "AddDelete") {
            main.Control.emit("AddProgressManagement", ProgressObj, AddControlObjCMD);
            main.Control.emit("DeleteProgressManagement", ProgressObj, AddControlObjCMD);
        }

    });
    
    // map에서 명시된 제어 명령을 처리.(GoToSea[바다로 가는 경로 모두 1], ResetSaltpondDeviceID[장치 모든 값 0]), controlModel에서 해당 명령 객체를 찾아 보내줌.
    self.on("RunSettingCMD", function (SettingObj) {
        //BU.debugConsole();
        //BU.CLI("RunSettingCMD", SettingObj)
        if (_.isEmpty(SettingObj))
            return;
        var TrueList = [];
        var FalseList = [];
        
        var ChangeDeviceList = [];
        var ReturnResults = [];
        //BU.CLI(SettingObj)

        _.each(SortDeviceByValue(SettingObj.True, "1"), function (deviceID) {
        //BU.log("deviceID", deviceID)
        var FindObj = Salt.FindObj(deviceID).GetStatus();
        var ExistID = _.where(self.SerialControlObj.arrCmdControl, { "ID": deviceID });
        var LastExistID = "";
        var IsPush = "0";
        if (!BU.isEmpty(ExistID)) {
            LastExistID = _.last(ExistID);
            if (LastExistID["Value"] == "1")
                return;
            else
                IsPush = "1";
        }
        else if (FindObj["Value"] == "0")
            IsPush = "1";
                

        if (IsPush == "1") {
            var AddObj = {};
            AddObj["ID"] = deviceID;
            AddObj["Value"] = 1;
            TrueList.push(deviceID);
            ChangeDeviceList.push(AddObj);
        }
    });
        _.each(SortDeviceByValue(SettingObj.False, "0"), function (deviceID) {
            var FindObj = Salt.FindObj(deviceID).GetStatus();
            
            
            var ExistID = _.where(self.SerialControlObj.arrCmdControl, { "ID": deviceID });
            var LastExistID = "";
            var IsPush = "0";
           
            if (!BU.isEmpty(ExistID)) {
                LastExistID = _.last(ExistID);
                if (LastExistID["Value"] == "0")
                    return;
                else
                    IsPush = "1";
            }
            else if (FindObj["Value"] == "1")
                IsPush = "1";
            

            if (IsPush == "1") {
                var AddObj = {};
                AddObj["ID"] = deviceID;
                AddObj["Value"] = 0;
                FalseList.push(deviceID);
                ChangeDeviceList.push(AddObj);
            }
        });

        var ProgressObj = {};
        ProgressObj["ID"] = SettingObj["ID"];
        ProgressObj["Src"] = SettingObj["Src"];
        ProgressObj["Des"] = SettingObj["Des"];
        ProgressObj["Type"] = "Setting";
        ProgressObj["TrueList"] = TrueList;
        ProgressObj["FalseList"] = FalseList;
        //BU.CLI(ProgressObj);
        //if (BU.isEmpty(TrueList.concat(FalseList))) {
        //    BU.log("아무것도 없어서 그냥 실행");
        //    main.Control.emit("AddProgressManagement", ProgressObj, ProgressObj);
        //    return;
        //}
        
        //  장치 명령 프로토콜 생성 구문 호출. 콜백 검증 구문은 빠진듯
        DeviceWriter(ChangeDeviceList, function (result) {
            ReturnResults.push(result);
        });

        main.Control.emit("AddProgressManagement", ProgressObj, ProgressObj);
    });


    self.xbeeC = null;
    self.xbeeAPI = null;
    self.initXbee = function () {
        var xbee_api = require('xbee-api');
        self.xbeeC = xbee_api.constants;
        self.xbeeAPI = new xbee_api.XBeeAPI({
            api_mode: 1
        });
//~!@
        self.xbeeAPI.on("frame_object", function (frame) {
			return;
            // 데이터가 들어온다면 타이머 해제
            if (self.sendCoordinatorTimer != null) {
                clearTimeout(self.sendCoordinatorTimer);
            }

            var strData = "";
            BU.CLI(frame);

            var resXbee = frame;

            if (resXbee == "" || resXbee == null) {
                BU.log("알수없는 데이터입니다.");
                ErrorDeviceDetected(3);
                return;
            }

            var resType = resXbee.type;

            if (typeof resType !== "number") {
                BU.log("type 에러");
                ErrorDeviceDetected(3);
                return;
            }
            // ND 탐색일 경우
            if (resType == 136) {

            }
                // Transmit Status
            else if (resType == 139) {
                //BU.log("OK OK  !!!");
                //BU.CLI("resXbee.transmitRetryCount", resXbee.transmitRetryCount, "resXbee.deliveryStatus", resXbee.deliveryStatus);
                // 코디네이터가 전송이 실패하였다면
                if (resXbee.deliveryStatus != 0) {
                    BU.errorLog("serialError", resXbee)
                    BU.log("Transmit Status ERROR!!!");
                    IsReceiveOneOrder = "0";
                    // 현재 수행중인 명령이 상태 체크이고 제어 명령이 왔을 경우 재시도 하지 않고 제어명령 우선 수행
                    if (self.SerialControlObj.SerialSendCommandType != "Order" && !BU.isEmpty(self.SerialControlObj.arrCmdControl)) {
                        self.setLastestSerialCommand();
                        self.setNowSerialControlBoardID();
                        //self.SerialControlObj.NowSerialStatusBoardID = "";
                        SendDataToSerial();
                        self.RetryNumber = 0;
                        return;
                    }
                    else
                        return ErrorDeviceDetected(3);
                }
            }

                // Receive Packet
            else if (resType == 144) {
                //BU.log("Receive Packet OK  !!!", resXbee.data.toString());
                //BU.CLI("Receive Packet OK  !!!", resXbee.data.toString())
                //BU.log("Receive Packet OK  !!!");
                IsReceiveOneOrder = "0";

                strData = resXbee.data.toString();

                // 보드 
                var BoardTypeStartPoint = 1;
                var BoardTypeEndPoint = BoardTypeStartPoint + 4;
                // 장치 타입 구간
                var ProductTypeStartPoint = BoardTypeEndPoint;
                var ProductTypeEndPoint = ProductTypeStartPoint + 4;
                // 수문 데이터 구간
                var WaterDoorStartPoint = ProductTypeEndPoint;
                var WaterDoorEndPoint = WaterDoorStartPoint + 2;
                // 수위 데이터 구간
                var WaterLevelStartPoint = WaterDoorEndPoint;
                var WaterLevelEndPoint = WaterLevelStartPoint + 2;
                // 온도 데이터 구간
                //var TemperatureStartPoint = WaterLevelEndPoint;
                //var TemperatureEndPoint = TemperatureStartPoint + 2;
                // 염도 데이터 구간
                var SalinityStartPoint = WaterLevelEndPoint;
                var SalinityEndPoint = SalinityStartPoint + 4;
                // 배터리 데이터 구간
                var GateBatteryStartPoint = SalinityEndPoint;
                var GateBatteryEndPoint = GateBatteryStartPoint + 4;
                
                // 밸브 데이터 구간
                var ValveStartPoint = ProductTypeEndPoint;
                var ValveEndPoint = ValveStartPoint + 2;
                // 배터리 데이터 구간
                var ValveBatteryStartPoint = ValveEndPoint;
                var ValveBatteryEndPoint = ValveBatteryStartPoint + 4;

                // 펌프 데이터 구간
                var PumpStartPoint = ProductTypeEndPoint;
                var PumpEndPoint = PumpStartPoint + 2;
                // 배터리 데이터 구간
                var PumpBatteryStartPoint = PumpEndPoint;
                var PumpBatteryEndPoint = PumpBatteryStartPoint + 4;
                // 보드 아이디
                var BoardID = resXbee.remote64.substring(self.xbeeSH.length).toUpperCase();


                var EffectedDeviceByBoardID = [];

                if (self.SerialControlObj.NowSerialControlBoardID != BoardID) {
                    BU.log("다른 BoardID 옴. 상태값 리뉴얼 X", self.SerialControlObj.NowSerialControlBoardID, BoardID);
                    return;
                }

                //CheckReceiveSerialData(BoardID);
                // 해당 BoardID를 사용하는 장치 리스트 구성.(Serial 만)
                _.each(Salt.mapSetInfo, function (DeviceCategory) {
                    _.each(DeviceCategory, function (Device) {
                        if (Device["BoardID"] == BoardID && Device["DeviceType"] == "Serial")
                            EffectedDeviceByBoardID.push(Device);
                    });
                });


                var arrUpdateDeviceList = [];
                var isDeviceError = "0";
                // 관련된 장치 순회.
                _.each(EffectedDeviceByBoardID, function (Device) {
                    var Value = null;
                    var RealValue = null;
                    var Battery = null;
                    var Err = "0";
                    var DeviceCategory = null;
                    // 수문
                    if (Device["ID"].indexOf("WD") != -1) {
                        Value = strData.substring(WaterDoorStartPoint, WaterDoorEndPoint);
                        Battery = Number(strData.substring(GateBatteryStartPoint, GateBatteryEndPoint));
                        //BU.log("Value", Value)
                        if (Value == "00") {
                            Err = "1";
                            //RealValue = "0";
                        }
                        else if (Value == "01")
                            RealValue = "0";
                        else if (Value == "02")
                            RealValue = "1";
                        else
                            Err = "1";

                        DeviceCategory = "WaterDoorList";
                    }
                        // 수위
                    else if (Device["ID"].indexOf("WL") != -1) {
                        Value = Number(strData.substring(WaterLevelStartPoint, WaterLevelEndPoint));
                        Battery = Number(strData.substring(GateBatteryStartPoint, GateBatteryEndPoint));
                        //BU.log("수위 ID : " + Device["ID"]);
                        BU.log("수위 값 : " + Value);
                        RealValue = Value / 10;

                        if (RealValue < 0) {
                            BU.log("수위가 0 들어와서 무시!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            Err = "1";
                            //return;
                        }

                        DeviceCategory = "WaterLevelList";
                    }
                        // 염도
                    else if (Device["ID"].indexOf("S") != -1) {
                        Value = strData.substring(SalinityStartPoint, SalinityEndPoint);
                        Battery = Number(strData.substring(GateBatteryStartPoint, GateBatteryEndPoint));
                        //BU.log("염도 ID : " + Device["ID"]);
                        //BU.log("염도 값 : " + Value);

                        RealValue = Number(Value);
                        if (RealValue < 0) {
                            BU.log("염도가 0 들어와서 무시!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                            Err = "1";
                            //return;
                        }

                        DeviceCategory = "SalinityList";
                    }
                        // 펌프
                    else if (Device["ID"].indexOf("P") != -1) {
                        Value = strData.substring(PumpStartPoint, PumpEndPoint);
                        Battery = Number(strData.substring(PumpBatteryStartPoint, PumpBatteryEndPoint));
                        if (Value == "00")
                            RealValue = "0";
                        else if (Value == "01")
                            RealValue = "1";
                        else
                            Err = "1";

                        DeviceCategory = "PumpList";
                    }
                        // 밸브
                    else if (Device["ID"].indexOf("V") != -1) {
                        Value = strData.substring(ValveStartPoint, ValveEndPoint);
                        Battery = Number(strData.substring(ValveBatteryStartPoint, ValveBatteryEndPoint));
                        if (Value == "00")
                            Err = "1";
                        else if (Value == "01")
                            RealValue = "0";
                        else if (Value == "02")
                            RealValue = "1";
                        else if (Value == "03") {
                            Err = "1";
                        }
                        else if (Value == "04")
                            RealValue = "0";
                        else if (Value == "05")
                            RealValue = "1";
                        else
                            Err = "1";

                        DeviceCategory = "ValveList";
                    }

                    else {
                        BU.log("알수없는 BoardID 입니다.");
                    }

                    if (Err == "1")
                        isDeviceError = "1";

                    var addObj = {};
                    addObj.ID = Device["ID"];
                    addObj.DeviceCategory = DeviceCategory;
                    addObj.Value = RealValue;
                    addObj.Battery = Battery;
                    addObj.Err = Err;
                    arrUpdateDeviceList.push(addObj);


                    //var Device_OBJ = Salt.FindObjByDeviceType(Device["ID"], "PumpList");
                    //Device_OBJ.emit("UpdateData", RealValue, Err);

                });

                // 수신 데이터에 문제가 있다면 이전 명령 재전송. Retry Number 3증가
                if (isDeviceError == "1")
                    return ErrorDeviceDetected(3);

                // 관련된 업데이트 장치들 실제 반영
                //BU.CLI(arrUpdateDeviceList)
                _.each(arrUpdateDeviceList, function (updateDevice) {
                    //BU.log("updateDevice", updateDevice)
                    var Device_OBJ = Salt.FindObjByDeviceType(updateDevice.ID, updateDevice.DeviceCategory);
                    Device_OBJ.emit("UpdateData", updateDevice.Value, updateDevice.Err, "", updateDevice.Battery);
                });
                //BU.CLI(self.SerialControlObj)
                self.RetryNumber = 0;
                //BU.log("self.SerialControlObj.NowSerialControlBoardID:L " + self.SerialControlObj.NowSerialControlBoardID);
                //BU.CLI(self.SerialControlObj.ErrorDetectedList)
                // 해당값이 제대로 들어왔다면 오류 장치리스트에서 해당 장치 삭제
                self.SerialControlObj.ErrorDetectedList = _.reject(self.SerialControlObj.ErrorDetectedList, function (ErrorDetectedBoardID) {
                    return ErrorDetectedBoardID == self.SerialControlObj.NowSerialControlBoardID;
                });

                CheckReceiveSerialData(BoardID);


            }


        });
    }

    
    // 지그비(Xbee) 시리얼 연결
    var ConnectToSerialDevice = function (Path, BaudRate) {
        BU.CLI("ConnectToSerialDevice", Path);
        //BU.log("ConnectToSerialDevice", Path, BaudRate);
        //var LogHeader = "염전";
        
        var IsReceiveOneOrder = "0";

        if (Path == "")
            return;
        
        var serialport = require("serialport");

        var serialPort = new serialport(Path, {
            baudrate: BaudRate,
            parser: self.xbeeAPI.rawParser()
        });
        
        serialPort.on("open",function (error) {
            if (error) {
                BU.log('failed to open: ' + error);
                serialPort.close();
                return;
            }
            
            BU.CLI("염전 장치(Serial)와 연결이 되었습니다.", Path)
            self.SerialClient = serialPort;

            CheckGetSerialData();
            serialPort.on("timeout", function () {
                BU.log("시리얼 타임아웃 발생");
                serialPort.emit("close");
            });

        });
        
        serialPort.on("close", function (err) {
            BU.log("시리얼 Close");
            self.SerialClient = null;
            serialPort.close(function (err) {
                BU.log('port closed', err);
            });
            setTimeout(function () {
                BU.log("염전 지그비 연결을 재시도 합니다." + Path);
                ConnectToSerialDevice(Path, BaudRate);
            }, 1000 * ReconnectIntervalTime);
        });
        
        serialPort.on("error", function (err) {
            BU.log("/Error", "염전 시리얼에러가 발생했습니다." + err);
            setTimeout(function () {
                BU.log("염전 지그비 연결을 재시도 합니다." + Path);
                ConnectToSerialDevice(Path, BaudRate);
            }, 1000 * ReconnectIntervalTime);
            
        });
    }
    
    
    
    // 지그비 모듈을 통해 명령 전송이 성공했으나 상태정보가 들어오지 않을 경우 명령 재시도(3초)
    var CheckReceiveSerialDataSuccess = function (Data) {
        self.ReSendDataSetTimer = setTimeout(function () {
            BU.log("ReSendDataSetTimer ERROR !!! : " + self.SerialControlObj.NowSerialControlBoardID, self.SerialControlObj.LastestSerialCommand);
            // 제어 명령이 왔을 경우 재시도 하지 않고 제어명령 우선 수행
            if (self.SerialControlObj.SerialSendCommandType != "Order" && self.SerialControlObj.SerialSendCommandType != "Init" && !BU.isEmpty(self.SerialControlObj.arrCmdControl)) {
                self.setLastestSerialCommand();
                self.setNowSerialControlBoardID();
                SendDataToSerial();
                return;
            }
            
            ErrorDeviceDetected(1);
        }, 3000);
    }
    
    // 장치의 에러 상황 감지.
    var ErrorDeviceDetected = function (AddRetryNumber){
        self.RetryNumber += AddRetryNumber;
        //BU.log("self.SerialControlObj.LastestSerialCommand : ");
        //BU.log("Error : " + self.SerialControlObj.LastestSerialCommand)
        // 재시도 횟수 가중치가 10
        if (self.RetryNumber <= 10) {
            writeCmdToSerial(self.SerialControlObj.LastestSerialCommand, "", "");
        }
        else {
            self.RetryNumber = 0;
            // 장치가 에러가 나면 현재 제어명령 실패 콜백, 제어명령 리스트를 초기화. 로그 작성
            if (self.SerialControlObj.SerialSendCommandType == "Order") {
                self.SerialControlObj.ThisControlOrderObj["CallBack"](false);
                self.SerialControlObj.arrCmdControl = [];
                self.SerialControlObj.SerialSendCommandType = "";
                BU.appendFile("./log/DeviceError.txt", self.SerialControlObj.ThisControlOrderObj["BoardID"]);
            }
            else {
                self.SerialControlObj.arrCmdPeriodic.splice(0, 1);
                BU.appendFile("./log/DeviceError.txt", self.SerialControlObj.ThisControlOrderObj["BoardID"]);
            }
            
            if (_.contains(self.SerialControlObj.ErrorDetectedList, self.SerialControlObj.NowSerialControlBoardID)) {
                // 장치들 에러로 판단 처리
                var FindObjList = Salt.FindObjByDeviceType(self.getNowSerialControlBoardID(), "");
                _.each(FindObjList, function (FindObj) {
                    FindObj.emit("UpdateData", "0", "1");
                });
                BU.log("ReSendDataSetTimer 장치 에러로 판단 : " + self.SerialControlObj.NowSerialControlBoardID);
            }
            else {
                self.SerialControlObj.ErrorDetectedList.push(self.getNowSerialControlBoardID());
                BU.log("ReSendDataSetTimer 1번 유예(해당 BoardID) : " + self.getNowSerialControlBoardID());
            }

            self.setLastestSerialCommand();
            self.setNowSerialControlBoardID();
            //BU.CLI(self.SerialControlObj.arrCmdPeriodic)
            SendDataToSerial();
        }

        BU.log("RetryNumber : " + self.RetryNumber);
        //return;
    }

    // 지그비 장치로 명령 전송 ~!@
    var writeCmdToSerial = function (SendData, SerialCommandType, OrderObj) {
        BU.CLI("writeCmdToSerial", SendData, "SerialCommandType", SerialCommandType, "OrderObj", OrderObj)

        var xbeeSendData = self.xbeeAPI.buildFrame(SendData);
        


        //var SetTimer = setTimeout(function () {
            if (xbeeSendData == "") {
                BU.log("xbeeSendData 가 없어서 종료");
                return;
            }
            self.SerialClient.write(xbeeSendData, function (err, res) {
                if (err) {
                    BU.log("xbeeSendDataToSerial ERR : " + err);
                }
                else {
					// self.cmdWaterDoorOpen = "@cgo";
    // self.cmdWaterDoorClose = "@cgc";
    // self.cmdValveOpen = "@cvo";
    // self.cmdValveClose = "@cvc";
    // self.cmdPumpOpen = "@cpo";
    // self.cmdPumpClose = "@cpc";
    // self.cmdDeviceGetStatus = "@sts";
    // self.cmdDeviceGetSalinity = "@csm";
	// BU.CLI(self.getNowSerialControlBoardID())
	BU.log(self.SerialControlObj.NowSerialControlBoardID)
					
                    // 명령을 보냈지만 아무런 응답이 없을 경우 에러로 처리
                    // self.sendCoordinatorTimer = setTimeout(function () {
                        // ErrorDeviceDetected(10);
                    // }, 1000 * 3);

                    //BU.log("명령 전송 요청 성공 :  " + self.SerialControlObj.NowSerialControlBoardID);
                    self.setLastestSerialCommand(SendData);
                    
                    if (SerialCommandType != "")
                        self.SerialControlObj.SerialSendCommandType = SerialCommandType;
                    
                    if (OrderObj != "")
                        self.SerialControlObj.ThisControlOrderObj = OrderObj;
					
					
					var findObj = Salt.FindObjByDeviceType(self.SerialControlObj.NowSerialControlBoardID, "")[0];
					BU.CLI(findObj.Name,findObj.Value,SerialCommandType)
					if(SendData.data == self.cmdWaterDoorClose){
						findObj.emit("UpdateData", 0, 0, "", 12);
						}
						else if(SendData.data == self.cmdWaterDoorOpen){
						findObj.emit("UpdateData", 1, 0, "", 12);
						}
						else if(SendData.data == self.cmdDeviceGetStatus){
						findObj.emit("UpdateData", 2, 0, "", 12);
						}
						setTimeout(function(){
							CheckReceiveSerialData(self.SerialControlObj.NowSerialControlBoardID);
						}, 500)
					
                }
            });
        //}, 500);
    }
    
    // 시리얼로 보낼 명령 ~!@
    var SendDataToSerial = function () {
        //BU.log("SendDataToSerial");
        // BU.CLI(self.SerialControlObj)
        //BU.CLI("self.SerialControlObj.NowSerialControlBoardID : " + self.SerialControlObj.NowSerialControlBoardID);
        
        //BU.log("self.SerialControlObj.LastestSerialCommand: " + self.SerialControlObj.LastestSerialCommand, self.SerialControlObj.NowSerialControlBoardID);

        // 요청중인 명령이 명령이 없다면
        if (self.getNowSerialControlBoardID() == "" && self.getLastestSerialCommand() == null) {
            BU.log("요청중 명령 없음.")
            //BU.CLI(self.SerialControlObj.arrCmdControl);
            // 제어 명령
            if (!BU.isEmpty(self.getGetStatusOrderObj())) {
                BU.log("상태 요청할 내용이 있음.")
                self.setNowSerialControlBoardID(self.SerialControlObj.GetStatusOrderObj["BoardID"]);
                writeCmdToSerial(self.SerialControlObj.GetStatusOrderObj["SendData"], "GetStatus", self.SerialControlObj.GetStatusOrderObj);
            }

            else if (!BU.isEmpty(self.SerialControlObj.arrCmdControl)) {
                var ThisSendObj = self.SerialControlObj.arrCmdControl[0];
                BU.log("SendDataToSerial 명령제어 요청")
                //BU.CLI(ThisSendObj);
                self.setNowSerialControlBoardID(ThisSendObj["BoardID"]);
                
                writeCmdToSerial(ThisSendObj["SendData"], "Order", ThisSendObj);
            }
            else if (!BU.isEmpty(self.SerialControlObj.arrCmdPeriodic) && self.getLastestSerialCommand() == null) {
                //BU.log("상태 정보 가져올 차례");
                var PeriodicSerialCommand = self.SerialControlObj.arrCmdPeriodic[0];

                var frame_obj = { // AT Request to be sent to  
                    type: 0x10, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST 
                    id: 0x01, // optional, nextFrameId() is called per default 
                    destination64: self.xbeeSH.concat(PeriodicSerialCommand["BoardID"]),
                    destination16: "fffe", // optional, "fffe" is default 
                    broadcastRadius: 0x00, // optional, 0x00 is default 
                    options: 0x00, // optional, 0x00 is default 
                    data: PeriodicSerialCommand["CommandType"] // Can either be string or byte array. 
                }
                //BU.CLI(frame_obj)
                //BU.log("Status frame_obj : " + frame_obj);
                self.setNowSerialControlBoardID(PeriodicSerialCommand["BoardID"]);
                writeCmdToSerial(frame_obj, PeriodicSerialCommand["CommandType"], "");
            }
        }
    }
    
    // 제어명령이 완료되었을 경우 호출.
    var CheckReceiveSerialData = function (BoardID) {
        clearTimeout(self.ReSendDataSetTimer);
        self.RetryNumber = 0;
        BU.log("self.SerialControlObj.SerialSendCommandType : " + self.SerialControlObj.SerialSendCommandType);
        
        // 제어명령이 성공했을 경우
        if (self.SerialControlObj.SerialSendCommandType == "Order" && !BU.isEmpty(self.SerialControlObj.ThisControlOrderObj)) {
            BU.log("제어명령이 성공했을 경우 CheckReceiveSerialData self.SerialControlObj.NowSerialControlBoardID " + self.SerialControlObj.NowSerialControlBoardID);
            
            var orderObj = self.SerialControlObj.ThisControlOrderObj;


            var findObj = Salt.FindObj(orderObj.ID).GetStatus();
			
			BU.log("@@@@@@@@@@@@",findObj.Value)
			BU.log("@@@@@@@@@@@@",orderObj.Value)
			BU.CLI(findObj.Value)
BU.CLI(orderObj)
            // 제어명령 값과 모델 정보값이 다르다면 상태값 갱신명령 생성
            if (findObj.Value.toString() != orderObj.Value.toString()) {
                self.SerialControlObj.GetStatusOrderObj = self.SerialControlObj.ThisControlOrderObj;
                self.SerialControlObj.GetStatusOrderObj["CountNumber"] = 0;
                self.SerialControlObj.GetStatusOrderObj.SendData.data = self.cmdDeviceGetStatus;
            }
            else {
				BU.log("콜백 트루")
                self.SerialControlObj.ThisControlOrderObj["CallBack"](true);
            }
            // 현재 제어명령 초기화
            self.SerialControlObj.ThisControlOrderObj = {};

            // 첫째 제어 명령 제거
            self.SerialControlObj.arrCmdControl.splice(0, 1);
            
            self.setNowSerialControlBoardID();
        }
        // 제어 명령 값과 모델 정보값이 달라 상태정보 값을 요청한 결과 로직
        else if (self.SerialControlObj.SerialSendCommandType == "GetStatus") {
            var Device_OBJ = Salt.FindObjByDeviceType(self.SerialControlObj.GetStatusOrderObj["ID"], self.SerialControlObj.GetStatusOrderObj["DeviceCategory"]);
            
            // 명령 제어 후 상태값이 명령 내린 결과와 같다면
            if (Device_OBJ["Value"] == self.SerialControlObj.GetStatusOrderObj["Value"]) {
                //BU.log("내린 결과와 같음 : Value " + Device_OBJ["Value"] + " Obj Value " + self.SerialControlObj.GetStatusOrderObj["Value"]);
                //BU.CLI(self.SerialControlObj.GetStatusOrderObj);
                self.SerialControlObj.GetStatusOrderObj["CallBack"](true);
                self.setGetStatusOrderObj();
                self.setNowSerialControlBoardID();
            }
            // 제어명령 값과 상태값이 다를 경우
            else {
                // 장치 상태값이 안바뀐다면 (10회 요청시)
                if (self.SerialControlObj.GetStatusOrderObj["CountNumber"] >= 10) {
                    var FindObjList = Salt.FindObjByDeviceType(self.SerialControlObj.NowSerialControlBoardID, "");
                    _.each(FindObjList, function (FindObj) {
                        FindObj.emit("UpdateData", "0", "1");
                    });
                    
                    BU.log("ReSendDataSetTimer 장치 에러로 판단 : " + self.SerialControlObj.NowSerialControlBoardID);
                    

                    self.SerialControlObj.GetStatusOrderObj["CallBack"](false);
                    self.SerialControlObj.GetStatusOrderObj = {};
                    self.setNowSerialControlBoardID();
                }
                // 상태값 재요청
                else {
                    BU.log("내린 결과와 같지않음 : Value " + Device_OBJ["Value"] + " Obj Value " + self.SerialControlObj.GetStatusOrderObj["Value"]);
                    self.SerialControlObj.GetStatusOrderObj["CountNumber"]++;
                    writeCmdToSerial(self.SerialControlObj.GetStatusOrderObj["SendData"], "GetStatus", self.SerialControlObj.GetStatusOrderObj);
                }
            }
        }
        // 상태조회 명령을 수행한 경우
        else if (self.SerialControlObj.SerialSendCommandType == self.cmdDeviceGetStatus) {
            self.SerialControlObj.arrCmdPeriodic.splice(0, 1);
            self.setNowSerialControlBoardID();
            // 시리얼 장치 상태 조회가 모두 완료될 경우
            if (BU.isEmpty(self.SerialControlObj.arrCmdPeriodic)) {
                //BU.log("상태값 전송 요청이 완료 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
                // 사용자로부터 명령을 수행할 수 있는 신호 전송(수동모드 시작)
                global.main.Control.emit("CompleteStatusCheck", self.IsCompleteStatusCheck);
                self.IsCompleteStatusCheck = "1";
            }
        }
        else if (self.SerialControlObj.SerialSendCommandType == self.cmdDeviceGetSalinity) {
            self.SerialControlObj.arrCmdPeriodic.splice(0, 1);
            self.setNowSerialControlBoardID();
        }
        //else
        //    return;
        
        self.setLastestSerialCommand();
        SendDataToSerial();
    }

   
    
    // @@@ 정기적인 장치 상태 조회. ???초에 한번씩 시리얼 데이터 체크
    var CheckGetSerialData = function () {
        checkPeriodicCmd();
        var TimeOut = setTimeout(function () {
            CheckGetSerialData();
        }, 1000 * 10);
    }
    
    // @@@ 장치 상태값 갱신을 위한 명령. 제어명령 리스트가 존재하거나 정기 명령 리스트가 있다면 정기 명령 생성 X, 동작중인 장치가 있다면 해당 카테고리 집중 탐색
    var checkPeriodicCmd = function () {
        //BU.log("checkPeriodicCmd 시작");
        //var GetSerialDataInterval = setInterval(function () {
        if (!BU.isEmpty(self.SerialControlObj.arrCmdPeriodic)) {
            BU.CLI("정기 상태요청 리스트가 남아있습니다.", self.SerialControlObj.arrCmdPeriodic)
            SendDataToSerial();
            //BU.CLI(self.SerialControlObj.arrCmdPeriodic);
            return;
        }

        var PeriodicSerialCommandArray = [];
        
        // 진행중인 제어 명령이 존재한다면 상태값 명령 조회구문 만들지 않음.
        if (self.SerialControlObj.NowSerialControlBoardID != "") {
            BU.log("진행중인 제어 명령이 있음.");
            return;
        }
        
        // 염도값 갱신(5초마다 상태값 요청할 경우 10분)
        if (IsNeedSalinityCheck == "1") {
            IsNeedSalinityCheck = "0";
        // 염도 측정 장치 리스트 중 시리얼 장비이고 주기적인 명령 리스트에 등재되어 있다면 제외. 없다면 해당 염도 측정 장비 실행 명령 탑재
            _.each(self.DeviceInfo_List["SalinityList"], function (DeviceSalinity) {
                if (DeviceSalinity["DeviceType"] == "Serial") {
                    var isExist = _.findWhere(PeriodicSerialCommandArray, { "BoardID" : DeviceSalinity["BoardID"] });
                    if (BU.isEmpty(isExist)) {
                        var AddObj = {};
                        AddObj["BoardID"] = DeviceSalinity["BoardID"];
                        AddObj["CommandType"] = self.cmdDeviceGetSalinity;
                        PeriodicSerialCommandArray.push(AddObj);
                    }
                }
            });
        }
        else {
            // 장치가 동작중이라면 장치와 관련된 염판 및 해주의 상태값 갱신을 우선적으로 함. 관련된 염판에는 염도 센서, 수위 센서가 있음
            // 제어 장치(수문, 밸브, 펌프)들을 중복제거하여 객체 구성
            var ControlDeviceList = _.union(self.saltData["WaterDoorList"], self.saltData["ValveList"], self.saltData["PumpList"]);
            var OperationControlDeviceList = [];
            // 장치 리스트를 순회하면서 해당 장치값이 "1"인 대상 탐색
            _.each(ControlDeviceList, function (ControlDevice) {
                var FindObj = Salt.FindObj(ControlDevice["ID"]).GetStatus();
                if (FindObj["Value"] == "1") {
                    // 각 Deivce ID 장치를 탐색 후 부모(염판, 해주) 객체 추출
                    var WaterDoorParent = Salt.FindParent(ControlDevice["ID"], "WaterDoor");
                    var ValveParent = Salt.FindParent(ControlDevice["ID"], "Valve");
                    var PumpParent = Salt.FindParent(ControlDevice["ID"], "Pump");
                    var ParentList = _.union(WaterDoorParent, ValveParent, PumpParent);
                    
                    // 부모가 수로라면 리스트 제거
                    var ViewParentList = [];
                    _.each(ParentList, function (Parent) {
                        if (Parent["Type"] != "WaterWay")
                            ViewParentList.push(Parent);
                    });
                    
                    // 부모가 가지고 있는 염도 센서, 수위 센서가 있다면 상태값 조회 리스트에 추가
                    var ViewDeviceList = [];
                    _.each(ViewParentList, function (ViewParent) {
                        _.each(ViewParent["SalinityList"], function (Device) {
                            OperationControlDeviceList.push(Device);
                        });
                        _.each(ViewParent["WaterLevelList"], function (Device) {
                            OperationControlDeviceList.push(Device);
                        });
                    });
                }
            });
            // 최종 상태값 탐색 장치 중복 제거
            var OperationDeviceList = _.union(OperationControlDeviceList);
            // 집중 조회할 장치 상태값 리스트가 있고 해당 장치가 시리얼이라면 정기 명령 구문에 탑재
            if (!BU.isEmpty(OperationDeviceList)) {
                _.each(OperationDeviceList, function (OperationDevice) {
                    if (OperationDevice["DeviceType"] == "Serial") {
                        var isExist = _.findWhere(PeriodicSerialCommandArray, { "BoardID" : OperationDevice["BoardID"] });
                        if (BU.isEmpty(isExist)) {
                            var AddObj = {};
                            AddObj["BoardID"] = OperationDevice["BoardID"];
                            AddObj["CommandType"] = self.cmdDeviceGetStatus;
                            PeriodicSerialCommandArray.push(AddObj);
                        }
                    }
                });
            }
            // 집중 조회할 장치 상태값 리스트가 없다면 모든 장비 상태값 갱신 명령 구문 생성
            else {
                _.each(self.DeviceInfo_List, function (DeviceCategory) {
                    _.each(DeviceCategory, function (Device) {
                        //if (Device["DeviceType"] == "Serial" && (Device["DeviceKey"] == "WL" || Device["DeviceKey"] == "Salinity")) {
                        if (Device["DeviceType"] == "Serial") {
                            var isExist = _.findWhere(PeriodicSerialCommandArray, { "BoardID" : Device["BoardID"] });
                            if (BU.isEmpty(isExist)) {
                                var AddObj = {};
                                AddObj["BoardID"] = Device["BoardID"];
                                AddObj["CommandType"] = self.cmdDeviceGetStatus;
                                PeriodicSerialCommandArray.push(AddObj);
                            }
                        }
                    });
                });
            }
            //BU.log("GetSerialStatusOrderList");
        }
        // 생성된 정기명령을 메인에 탑재. 시리얼 명령 요청
        self.SerialControlObj.arrCmdPeriodic = PeriodicSerialCommandArray;
        SendDataToSerial();
        
        //self.SerialControlObj.InitCountNumber--;
        //self.SerialControlObj.SalinityCountNumber--;
    }
    
    // 소켓 통신 접속 
    var ConnectToSocketDevice = function (DeviceIP, DevicePort) {
        //BU.CLIS(DeviceIP, DevicePort)
        BU.log("ConnectToSocketDevice : " + DeviceIP, DevicePort);
        var client = new net.Socket();
        
        client.setNoDelay(true);
        client.setTimeout(1000 * DeviceTimeOutTime);
        client.on('error', function (err) {
            ConnectError();
            BU.log(err);
            client.destroy();
        });
        //타임아웃이 발생했을 때 처리 
        client.on("timeout", function () {
            BU.log("타임아웃 발생 : " + DeviceIP, DevicePort);
            //client.emit("close");
        });
        
        client.connect(DevicePort, DeviceIP, function () {
            BU.log("!!")
            self.SocketClient = client;
            BU.log("염전 장치(Socket)와 연결이 되었습니다." + DeviceIP, DevicePort);
            if (setInfo.isUsedSerial == "0") {
                global.main.Control.emit("CompleteStatusCheck", self.IsCompleteStatusCheck);
                self.IsCompleteStatusCheck = "1";
            }
            
            var DeviceList = Salt.DeviceList();
            _.each(DeviceList, function (DeviceCategory) {
                _.each(DeviceCategory, function (Device) {
                    if (setInfo.isUsedSerial == 2) {
                        return;
                    }
                    if (setInfo.isUsedSerial == 1 && Device["DeviceType"] != "Socket") {
                        return;
                    }

                    Device["IsError"] = "0";

                    //if (Device["DeviceKey"] !== "Salinity" && Device["DeviceKey"] !== "WL")
                    //    DeviceClose["False"].push(Device["ID"]);
                });
            });

            //client.destroy();

            //ConnectSuccess();
        });
        
        client.Smbuffer = new _Smbuffer.SmBuffer();
        client.Smbuffer.on("EndBuffer", function (Data) {
            client.emit("ReadAll", Data);
        });
        
        client.on("ReadAll", function (data) {
            var DataObj = null;
            try {
                DataObj = JSON.parse(data);
            }
                catch (ex) {
                DataObj = null;
            }
            if (DataObj == null) {
                return;
            }
            
            if (DataObj.indexOf("#") == -1) {
                BU.log("알수없는 데이터입니다.");
                return;
            }
            
            //BU.log("@@@@@@@@@@  " + DataObj)
            var DeviceID = DataObj.substring(1, 7);
            var DeviceValue = DataObj.substring(7, 19);
            var DeviceIsError = DataObj.substring(19, 20);
            var DeviceUpdated = DataObj.substring(21, 22);
            
            var re = /&/g;
            DeviceID = DeviceID.replace(re, "");
            DeviceValue = DeviceValue.replace(re, "");
            DeviceIsError = DeviceIsError.replace(re, "");
            
            
            //// 장치 에러가 검출되고 자동모드일 경우 수동모드로 전환
            //if (DeviceValue == "" && main.Control.ControlType == "Auto") {
            //    main.Control.emit("SendDeviceErrorGCM", DeviceID);
            //}
            
            if (DeviceValue == "") {
                DeviceIsError = "1";
            }
            //if (DeviceID == "WL1") {
                //BU.log(DeviceID, DeviceValue, DeviceIsError);
            //}

            
            var Device_OBJ = Salt.FindObj(DeviceID);
            var test = Device_OBJ.Value + "ConnectToSocketDevice";
            Device_OBJ.emit("UpdateData", DeviceValue, DeviceIsError, test);
        });
        
        client.on("data", function (data) {
            //client.Smbuffer.emit("AddBuffer", data);
        });
        
        client.on('close', function () {
            //var nowIsClosed = IsDeviceConnect;
            //IsDeviceConnect = "0";
            //if(IsDeviceConnect != nowIsClosed)
            //    SendPush(IsDeviceConnect);
            
            //self.SocketClient = null;
            //client.destroy();
            //setTimeout(function () {
            //    BU.log("염전 장치와의 연결을 재시도합니다.");
            //    ConnectToSocketDevice(DeviceIP, DevicePort);
            //}, 1000 * ReconnectIntervalTime);
        });
    }
    // 소켓 접속 장애시 소켓 장치 에러 처리
    var ConnectError = function () {
        //BU.CLI(self.saltData)
        _.each(self.saltData["WaterDoorList"], function (Model) {
            Model.IsError = -1;
        });
        _.each(self.saltData["WaterLevelList"], function (Model) {
            Model.IsError = -1;
        });
        _.each(self.saltData["SalinityList"], function (Model) {
            Model.IsError = -1;
        });
        _.each(self.saltData["ValveList"], function (Model) {
            Model.IsError = -1;
        });
        _.each(self.saltData["PumpList"], function (Model) {
            Model.IsError = -1;
        });
    }
    //// 소켓 접속 성공
    //var ConnectSuccess = function () {
    //    //BU.CLI(self.saltData)
    //    _.each(self.saltData["WaterDoorList"], function (Model) {
    //        Model.IsError = 0;
    //    });
    //    _.each(self.saltData["WaterLevelList"], function (Model) {
    //        Model.IsError = 0;
    //    });
    //    _.each(self.saltData["SalinityList"], function (Model) {
    //        Model.IsError = 0;
    //    });
    //    _.each(self.saltData["ValveList"], function (Model) {
    //        Model.IsError = 0;
    //    });
    //    _.each(self.saltData["PumpList"], function (Model) {
    //        Model.IsError = 0;
    //    });
    //}
    
    // 제어명령 0 or 1의 값을 실제 전송 프로토콜에 맞게 변경 후 명령 리스트에 탑재. 콜백 포함
    var DeviceWriter = function (ChangeDeviceList, CallBack) {
        _.each(ChangeDeviceList, function (ChangeDevice) {
            //BU.log("ChangeDevice[ID] : " + ChangeDevice["ID"] + "  DeviceValue : " + ChangeDevice["Value"]);
            var DeviceID = ChangeDevice["ID"];
            var DeviceValue = ChangeDevice["Value"];
            var FindObj = Salt.FindObj(DeviceID);
            var DeviceType = FindObj["DeviceType"];
            // 조작하는 장치 타입이 소켓이거나 시리얼 통신 모드가 아니라면 소켓통신 프로토콜 명령 제어.
            if (setInfo.isUsedSerial == "0" || (DeviceType == "Socket" && setInfo.isUsedSerial == "1")) {
                if (self.SocketClient == null) {
                    CallBack(false);
                    return;
                }
                // 모델 ID로 찾아 해당 모델의 데이터를 직접 변경함.
                var FindObj = Salt.FindObj(DeviceID);



                var battery = 10;
                // 배터리 난수 발생
                if(setInfo.isDev)
                    battery = battery * _.random(8, 30) * 0.1;

                
                
                //BU.CLI("DeviceWriter 제어명령 수행 ID", DeviceID, "DeviceValue", DeviceValue);
                FindObj.emit("UpdateData", DeviceValue, "0", "DeviceWriter", battery);
                //BU.CLI(CallBack);
                CallBack(true);
            }
            // 시리얼 통신일 경우 
            else if (DeviceType == "Serial") {
                if (self.SerialClient == null) {
                    BU.log("시리얼 연결이 안됐네요");
                    CallBack(false);
                    return;
                }
                
                var BoardID = FindObj["BoardID"];
                //BU.log("DeviceID : " + DeviceID);
                //BU.log("BoardID : " + BoardID);
                //BU.log("DeviceValue : " + DeviceValue);
                var SerialDeviceValue = "";
                
                var AddObj = {};
                // 장치 타입에 맞게 프로토콜 명령을 탑재
                if (DeviceID.indexOf("WD") != -1) {
                    AddObj["DeviceCategory"] = "WaterDoorList";
                    if (DeviceValue == "1")
                        SerialDeviceValue = self.cmdWaterDoorOpen;
                    else if (DeviceValue == "0")
                        SerialDeviceValue = self.cmdWaterDoorClose;
                }
                else if (DeviceID.indexOf("V") != -1) {
                    AddObj["DeviceCategory"] = "ValveList";
                    if (DeviceValue == "1")
                        SerialDeviceValue = self.cmdValveOpen;
                    else if (DeviceValue == "0")
                        SerialDeviceValue = self.cmdValveClose;
                }
                else if (DeviceID.indexOf("P") != -1) {
                    AddObj["DeviceCategory"] = "PumpList";
                    if(DeviceValue == "1")
                        SerialDeviceValue = self.cmdPumpOpen;
                    else if (DeviceValue == "0")
                        SerialDeviceValue = self.cmdPumpClose;
                }
                
                //BU.log("SerialDeviceValue : " + SerialDeviceValue); ~!@
                var SendData = "";

                // Xbee 전송 객체 ~!@
                var frame_obj = { // AT Request to be sent to  
                    type: 0x10, // xbee_api.constants.FRAME_TYPE.ZIGBEE_TRANSMIT_REQUEST 
                    id: 0x01, // optional, nextFrameId() is called per default 
                    destination64: self.xbeeSH.concat(BoardID),
                    destination16: "fffe", // optional, "fffe" is default 
                    broadcastRadius: 0x00, // optional, 0x00 is default 
                    options: 0x00, // optional, 0x00 is default 
                    data: SerialDeviceValue // Can either be string or byte array. 
                }


                SendData = frame_obj;

                //self.SerialControlObj.LastestSerialCommand = SendData;
                
                // 장치 제어에 필요한 요소 정의
                AddObj["ID"] = ChangeDevice["ID"];
                AddObj["BoardID"] = BoardID;
                
                AddObj["Value"] = DeviceValue;
                AddObj["SendData"] = SendData;
                AddObj["CallBack"] = CallBack;
                // 시리얼 제어 명령 리스트에 객체 탑재
                self.SerialControlObj.arrCmdControl.push(AddObj);
                //BU.CLI(self.SerialControlObj.arrCmdControl);
                SendDataToSerial();

            }
            else {
                BU.log("장치의 타입이 이상합니다.");
                return;
            }
        });
    }
    
    // 장치를 제어하는데 실패한 값이 있다면 해당 명령 에러처리
    var CheckDeviceChangeResult = function (ReturnResults) {
        //BU.CLI("ReturnResults",ReturnResults);
        var IsError = {};
        if (_.contains(ReturnResults, false)) {
            var sendObj = {};
            sendObj["IsError"] = -1;
            sendObj["Message"] = "장치를 조작하는데 실패하였습니다.";
            //CallBack(sendObj);
            IsError = sendObj;
        }
        else {
            //BU.log("명령을 수행하였습니다. : " + RunID);
            //BU.CLI(ReturnResults);
            //CallBack("");
        }
        return IsError;
    }

    // 장치를 조작함에 있어 펌프 보호를 위한 우선순위를 통한 순서 정렬(켤때는 밸브 → 펌프, 끌때는 펌프 → 밸브 순서)
    var SortDeviceByValue = function (ControlOrderDeviceList, ChangeValue) {
        var returnvalue = [];
        //BU.CLI(ControlOrderDeviceList);
        returnvalue = _.sortBy(ControlOrderDeviceList, function (ControlOrderDevice) {
            
            var OrderOfPriority = DeviceOfPriorityArray(ControlOrderDevice, ChangeValue);
            return OrderOfPriority["Value"];
        });
        return returnvalue;
    }
    
    // 우선 순위 정렬. 수문이 최우선. 펌프 동작 시에는 가중치를 밸브보다 낮게, 끌때는 밸브보다 가중치를 높게 둠.(value 가 낮을수록 가중치가 높음)
    var DeviceOfPriorityArray = function (Device, ChangeValue) {
        var returnvalue = {};
        
        if (Device.indexOf("WD") != -1) {
            returnvalue.Value = 1000;
            returnvalue.Point = 2;
        }
        else if (Device.indexOf("P") != -1 && ChangeValue == "0") {
            returnvalue.Value = 2000;
            returnvalue.Point = 1;
        }
        else if (Device.indexOf("V") != -1) {
            returnvalue.Value = 3000;
            returnvalue.Point = 1;
        }
        else if (Device.indexOf("P") != -1 && ChangeValue == "1") {
            returnvalue.Value = 4000;
            returnvalue.Point = 1;
        }
        
        return returnvalue;
    }
    

    
    //function SendPush(IsDeviceConnect) {
    //    BU.log("IsDeviceConnect : " + IsDeviceConnect);
    //    var SendObj = {};
    //    SendObj["CMD"] = "DeviceConnect";
    //    SendObj["ControlStatus"] = ControlStatus;
    //    var PushServer = main.PushServer;
    //    BU.log("샌드푸시");
    //    PushServer.emit("sendAllClient", SendObj);
    //}


    // get set
    self.setNowSerialControlBoardID = function (value) {
        if (value == undefined)
            value = "";
        self.SerialControlObj.NowSerialControlBoardID = value;
    }

    self.setLastestSerialCommand = function (value) {
        if (value == undefined)
            value = null;
        self.SerialControlObj.LastestSerialCommand = value;
    }

    self.setSerialSendCommandType = function (value) {
        if (value == undefined)
            value = "";
        self.SerialControlObj.SerialSendCommandType = value;
    }

    self.setGetStatusOrderObj = function (value) {
        if (value == undefined)
            value = {};
        self.SerialControlObj.GetStatusOrderObj = value;
    }


    self.getNowSerialControlBoardID = function () {
        return self.SerialControlObj.NowSerialControlBoardID;
    }

    self.getLastestSerialCommand = function () {
        return self.SerialControlObj.LastestSerialCommand;
    }

    self.getSerialSendCommandType = function () {
        return self.SerialControlObj.SerialSendCommandType;
    }

    self.getGetStatusOrderObj = function () {
        return self.SerialControlObj.GetStatusOrderObj;
    }

}
util.inherits(controlSerialData, events.EventEmitter);
exports.controlSerialData = controlSerialData;
