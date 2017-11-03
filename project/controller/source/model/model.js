var events = require('events');
var util = require('util');
var _ = require('underscore');

var BU = require('base-util-jh').baseUtil;
var _gcm = require("../init/gcm.js");
var _CalData = require("../algorithm/calcData.js");

//var pushServer = global.main.pushServer;
var pushServer = global.pushServer;

var SendDeviceErrorGCM = function (Model) {
    var BI = global.main.BI;
    var ControlType = global.main.Control.ControlType;
    
    if (Model.IsError == "1" && ControlType == "Manual") {

        var gcm = new _gcm.GCM();
        var message = "장치(" + Model.Name + ")에 이상이 감지되었습니다.";
        gcm.sendAll(message, "deviceError");

        //BI.GetGCMList(function (err, result) {
        //    if (err) {
        //        BU.log(err);
        //        return;
        //    }
        //    var GCM_Device_List = result;
        //    var GCM = new _gcm.GCM();
                
        //    _.each(GCM_Device_List, function (Device) {
        //        //BU.log("GCM 발송 : 장치(" + Model.Name + ")에 이상이 감지되었습니다.");
        //        GCM.Send({ "Message" : "장치(" + Model.Name + ")에 이상이 감지되었습니다.", "status" : "deviceError", "RegIds" : [Device["registration_id"]] });
        //    });
        //});
    }
    else if (Model.IsError == "1" && ControlType != "Manual"){
        global.main.Control.emit("SendDeviceErrorGCM", Model.ID);
    }
}

var GetTargetID = function (TargetList) {
    var returnvalue = [];
    _.each(TargetList, function (Target) {
        returnvalue.push(Target["ID"])
    });
    
    return returnvalue;
}

/**
수문 클래스

@class WaterDoor : 수문
@constructor
**/
var WaterDoor = function () {
    events.EventEmitter.call(this);
    var self = this;

    self.ID = "";
    self.DeviceType = "";
    self.BoardID = "";
    self.IP = "";
    self.Port = null;
    self.Name = "";

    //self.CtrDate = 0;
    self.IsOpen = false;
    self.IsError = 1;
    self.Value = "0";
    self.Battery = 0;
    self.DeviceCMD = {};
    
    self.IsEqualWaterDoor = "0";

    // 배터리 GCM 전송 여부
    self.isSendBatteryGCM = "0";
	self.isFirst = "0";

    //소켓에서 데이터를 받음
	self.on("UpdateData", function (DeviceValue, DeviceIsError, DeviceUpdated, Battery) {
	    // BU.log("수문 업데이트", DeviceValue, DeviceIsError, DeviceUpdated, Battery)
        DeviceValue = typeof DeviceValue == "number" ? DeviceValue.toString() : DeviceValue;
        
		if(DeviceValue == "2"  ){
			if(self.isFirst == "0"){
				self.isFirst = "1"
				DeviceValue = "0";
			}
			else
				return;
		}
		
		//BU.debugConsole();
        //BU.log("수문 업데이트", DeviceValue, DeviceIsError, DeviceUpdated, Battery)
        //BU.log("self", self)
        if (DeviceIsError == "0") {
            var isDiffValue = self.Value != DeviceValue;
            var isDiffBattery = self.Battery != Battery;
            
            //BU.CLI(isDiffValue)
            //BU.CLI(isDiffBattery)

            if (isDiffValue || isDiffBattery) {
                //BU.log("수문 : " + self.ID + " 현재 값: " + self.Value + "  갱신 값 : " + DeviceValue, DeviceIsError, DeviceUpdated);

				
                self.Value = DeviceValue;
                self.Battery = Battery;

                self.IsOpen = self.Value == "1" ? true : false;

                //var pushServer = global.main.pushServer;
                var SendData = this.GetStatus();
                SendData.CMD = "DeviceStatus";
                pushServer.emit("sendAllClient", SendData);
                //BU.log("수문모델 장치변경 : ");

                if (isDiffValue)
                    global.main.Control.emit("UpdateWaterDoor", self["ID"], self.Value);
                if (isDiffBattery)
                    global.main.Control.emit("UpdateBattery", self["ID"], self.Battery);
            } 
        }

        if (DeviceIsError != self.IsError) {
            self.IsError = DeviceIsError;
            SendDeviceErrorGCM(self);
            //var pushServer = global.main.pushServer;
            var SendData = this.GetStatus();
            //BU.log("수문모델 에러 변경 : ");
            //BU.CLI(SendData)
            SendData.CMD = "DeviceStatus";
            pushServer.emit("sendAllClient", SendData);
        }
    });

    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        //SendObj["In_Out"] = self["In_Out"];
        SendObj["IsOpen"] = self["IsOpen"];
        SendObj["Value"] = self["Value"];
        SendObj["Battery"] = self["Battery"];
        SendObj["IsError"] = self["IsError"];
        //SendObj["CtrDate"] = self["CtrDate"];
        return SendObj;
    }

    /**
    수문을 오픈한다.
    @method SetOpen : 수문 오픈
    **/
    self.SetOpen = function (pIsOpen, CallBack) {
        BU.log("수문 오픈 수행 : " + self.ID);
        //명령어 집어 넣음
        self.DeviceCMD = { "IsOpen" : pIsOpen, "CallBack" : CallBack};
        
        if (self.IsError != "0") {
            BU.log("수문의 장치가 작동하지않습니다. 명령을 수행할 수 없습니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        if (self.IsOpen === pIsOpen) {
            BU.log("이미 같은 상태 입니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        var SendValue = "";
        if (pIsOpen)
            SendValue = "1";
        else
            SendValue = "0";

        //var SendID = BU.sizeChangeID(self.ID);
        //var SendValue = BU.sizeChangeValue(SendValue);
         //global.main.Control.emit("DeviceControl", self.ID, SendValue, "Valve", CallBack);
        main.Control.emit("DeviceControl", self.ID, SendValue, "WaterDoor", CallBack);
        //global.main.controlSerialData.emit("SetDevice", SendID, SendValue, CallBack);
        BU.log("*****************디바이스로 명령을 보냈습니다.*******************");
    }

    self.DeviceKey = "WD";
    self.IsDeviceServerRun = 1;
    self.IsDeviceClientRun = 1;
    self.GetDeviceStatus = function () {
        if (self.IsDeviceServerRun == 0) {
            self["Value"] = "";
            self["IsError"] = "1";
        }
        
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }
}
util.inherits(WaterDoor, events.EventEmitter);
exports.WaterDoor = WaterDoor;



var WaterLevel = function () {
    events.EventEmitter.call(this);
    var self = this;

    self.ID = "";
    self.DeviceType = "";
    self.BoardID = "";
    self.IP = "";
    self.Port = "";
    self.Name = "";
    
    self.Value = "0";
    self.Battery = 0;
    self.IsError = 1;

    self.socketValue = 0;
    
    self.on("UpdateData", function (DeviceValue, DeviceIsError, DeviceUpdated, Battery) {
        if (DeviceValue != "")
            DeviceValue = DeviceValue;

        DeviceValue = typeof DeviceValue == "number" ? DeviceValue.toString() : DeviceValue;

        //if (self.ID == "WL7") {
        //    BU.log("self.ID : " + self.Value, DeviceValue, DeviceIsError, Comment);
        //}

        if (DeviceIsError == "0") {
            var isDiffValue = self.Value != DeviceValue;
            var isDiffBattery = self.Battery != Battery;

            if (isDiffValue) {
                //BU.log("모델 : " + self.ID, self.Value, DeviceValue, DeviceIsError);
                self.Value = DeviceValue;
                self.Battery = Battery;

                //var pushServer = global.main.pushServer;
                var SendData = self.GetStatus();
                SendData.CMD = "DeviceStatus";
                pushServer.emit("sendAllClient", SendData);
                
                if (isDiffValue)
                    global.main.Control.emit("UpdateWaterLevel", self["ID"], self.Value);
                //if (isDiffBattery)
                //    global.main.Control.emit("UpdateBattery", self["ID"], self.Battery);
            }
        }
       

        if (DeviceIsError != self.IsError) {
            self.IsError = DeviceIsError;
            SendDeviceErrorGCM(self);
            //var pushServer = global.main.pushServer;
            var SendData = this.GetStatus();
            SendData.CMD = "DeviceStatus";
            pushServer.emit("sendAllClient", SendData);
        }
    });

    self.on("UpdateSocketData", function (DeviceValue) {
        //BU.log("UpdateSocketData", DeviceValue)
        self.socketValue = DeviceValue;
    })
    
    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Value"] = self["Value"];
        SendObj["Battery"] = self["Battery"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }
    
    self.CalData = new _CalData.CalData({ "averageCount" : 1, "averageMaxCount" : 6, "allowError" : 0.05 });  // 수위 0.5cm 오차허용(0.005)
    
    self.getValue = function () {
        return self.CalData.getData().toFixed(5);
    };
    
    self.setValue = function (value) {
        self.CalData.addData(value);
    }
    
    self.resetValue = function () {
        self.CalData.resetData();
    }
    
    

    self.DeviceKey = "WL";
    self.IsDeviceServerRun = 1;
    self.IsDeviceClientRun = 1;
    self.GetDeviceStatus = function () {
        if (self.IsDeviceServerRun == 0) {
            self["Value"] = "";
            self["IsError"] = "1";
        }
        
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }
}
util.inherits(WaterLevel, events.EventEmitter);
exports.WaterLevel = WaterLevel;


var Salinity = function () {
    events.EventEmitter.call(this);
    var self = this;
    self.ID = "";
    self.DeviceType = "";
    self.BoardID = "";
    self.IP = "";
    self.Port = "";
    self.Name = "";
    
    self.Value = "0";
    self.Battery = 0;
    self.IsError = 1;
    
    self.on("UpdateData", function (DeviceValue, DeviceIsError, DeviceUpdated, Battery) {
        //BU.log("UpdateData", DeviceValue, DeviceIsError, DeviceUpdated, Battery);
        DeviceValue = typeof DeviceValue == "number" ? DeviceValue.toString() : DeviceValue;
        if (DeviceValue != "")
            DeviceValue = Number(DeviceValue).toFixed(3);
        
        if (DeviceIsError == "0") {
            var isDiffValue = self.Value != DeviceValue;
            var isDiffBattery = self.Battery != Battery;
            // 장치 값이 다르거나 배터리 용량이 다르다면
            if (isDiffValue) {
                //BU.log("모델 : " + self.ID, DeviceValue, DeviceIsError);
                self.Value = DeviceValue;
                self.Battery = Battery;

                //var pushServer = global.main.pushServer;
                var SendData = self.GetStatus();
                SendData.CMD = "DeviceStatus";
                // BU.CLI(pushServer)
                pushServer.emit("sendAllClient", SendData);

                if (isDiffValue)
                    global.main.Control.emit("UpdateSalinity", self["ID"], self.Value);
                //if (isDiffBattery)
                //    global.main.Control.emit("UpdateBattery", self["ID"], self.Battery);
                
            }
        }
       

        if (DeviceIsError != self.IsError) {
            self.IsError = DeviceIsError;
            SendDeviceErrorGCM(self);
            //var pushServer = global.main.pushServer;
            var SendData = this.GetStatus();
            SendData.CMD = "DeviceStatus";
            pushServer.emit("sendAllClient", SendData);
        }
    });
    
    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Value"] = self["Value"];
        SendObj["Battery"] = self["Battery"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }

    self.CalData = new _CalData.CalData({"averageCount" : 1, "averageMaxCount" : 6, "allowError" : 0.05});  // 염도 0.2도 오차허용(0.2)
    
    self.getValue = function () {
        return self.CalData.getData().toFixed(1);
    };
    
    self.setValue = function (value) {
        self.CalData.addData(value);
    }
    
    self.resetValue = function (){
        self.CalData.resetData();
    }

    self.DeviceKey = "Salinity";
    self.IsDeviceServerRun = 1;
    self.IsDeviceClientRun = 1;
    self.GetDeviceStatus = function () {
        if (self.IsDeviceServerRun == 0) {
            self["Value"] = "";
            self["IsError"] = "1";
        }
        
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }
}
util.inherits(Salinity, events.EventEmitter);
exports.Salinity = Salinity;


/**
밸브 클래스

@class Valve : 밸브
@constructor
**/
var Valve = function () {
    events.EventEmitter.call(this);
    var self = this;
    
    self.ID = "";
    self.DeviceType = "";
    self.BoardID = "";
    self.IP = "";
    self.Port = null;
    self.Name = "";
    
    //self.CtrDate = 0;
    self.IsOpen = false;
    self.IsError = 1;
    self.Value = "0";
    self.Battery = 0;

    self.isSendBatteryGCM = "0";
    
    self.DeviceCMD = {};
    
    this.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["IsOpen"] = self["IsOpen"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        SendObj["CtrDate"] = self["CtrDate"];
        
        return SendObj;
    }
    
    //소켓에서 데이터를 받음
    self.on("UpdateData", function (DeviceValue, DeviceIsError, DeviceUpdated, Battery) {
        DeviceValue = typeof DeviceValue == "number" ? DeviceValue.toString() : DeviceValue;
        if (DeviceIsError == "0") {
            var isDiffValue = self.Value != DeviceValue;
            var isDiffBattery = self.Battery != Battery;
            
            if (isDiffValue || isDiffBattery) {
                //BU.log("모델 : " + self.ID, DeviceValue, DeviceIsError);
                self.Value = DeviceValue;
                self.Battery = Battery;

                self.IsOpen = self.Value == "1" ? true : false;

                //var pushServer = global.main.pushServer;
                var SendData = this.GetStatus();
                SendData.CMD = "DeviceStatus";
                pushServer.emit("sendAllClient", SendData);

                if (isDiffValue)
                    global.main.Control.emit("ValveStatusChange", self["ID"], self.Value);
                if (isDiffBattery)
                    global.main.Control.emit("UpdateBattery", self["ID"], self.Battery);
            }
            
            if (DeviceUpdated == "1" && !BU.isEmpty(self.DeviceCMD)) {
                BU.log("명령어를 처리 했습니다.");
                self.DeviceCMD.CallBack(undefined, self);
                self.DeviceCMD = {};
            }
        }
       
        if (DeviceIsError != self.IsError) {
            self.IsError = DeviceIsError;
            SendDeviceErrorGCM(self);
            //var pushServer = global.main.pushServer;
            var SendData = this.GetStatus();
            SendData.CMD = "DeviceStatus";
            pushServer.emit("sendAllClient", SendData);
        }
    });
    
    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["IsOpen"] = self["IsOpen"];
        SendObj["Value"] = self["Value"];
        SendObj["Battery"] = self["Battery"];
        SendObj["IsError"] = self["IsError"];
        return SendObj;
    }

    
    /**
    벨브을 오픈한다.
    @method SetOpen : 벨브 오픈
    **/
     self.SetOpen = function (pIsOpen, CallBack) {
        BU.log("벨브 오픈 수행 : " + self.ID);
        //명령어 집어 넣음
        self.DeviceCMD = { "IsOpen" : pIsOpen, "CallBack" : CallBack };
        
        if (self.IsError != "0") {
            BU.log("벨브의 장치가 작동하지않습니다. 명령을 수행할 수 없습니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        if (self.IsOpen === pIsOpen) {
            BU.log("이미 같은 상태 입니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        var SendValue = "";
        if (pIsOpen)
            SendValue = "1";
        else
            SendValue = "0";
        
        //var SendID = BU.sizeChangeID(self.ID);
        //var SendValue = BU.sizeChangeValue(SendValue);
        
        global.main.Control.emit("DeviceControl", self.ID, SendValue, "Valve", CallBack);
        //global.main.controlSerialData.emit("SetDevice", SendID, SendValue, CallBack);
    }

    self.DeviceKey = "Valve";
    self.IsDeviceServerRun = 1;
    self.IsDeviceClientRun = 1;
    self.GetDeviceStatus = function () {
        if (self.IsDeviceServerRun == 0) {
            self["Value"] = "";
            self["IsError"] = "1";
        }
            
        
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }

}
util.inherits(Valve, events.EventEmitter);
exports.Valve = Valve;



/**
펌프 클래스

@class Pump : 펌프 클래스
@constructor
**/
var Pump = function () {
    events.EventEmitter.call(this);
    var self = this;

    self.ID = "";
    self.DeviceType = "";
    self.BoardID = "";
    self.IP = "";
    self.Port = null;
    self.Name = "";
    
    //self.CtrDate = 0;
    self.IsOn = false;
    self.IsError = 1;
    self.Value = "0";
    self.Battery = 0;

    self.isSendBatteryGCM = "0";

    self.DeviceCMD = {};
    
    self.on("UpdateData", function (DeviceValue, DeviceIsError, DeviceUpdated, Battery) {
        DeviceValue = typeof DeviceValue == "number" ? DeviceValue.toString() : DeviceValue;
        //BU.log("DeviceIsError : " + self.ID, DeviceValue, DeviceIsError, DeviceUpdated);
        if (DeviceIsError == "0") {
            var isDiffValue = self.Value != DeviceValue;
            var isDiffBattery = self.Battery != Battery;
            // 장치 값이 다르거나 배터리 용량이 다르다면
            if (isDiffValue || isDiffBattery) {
                //BU.log("펌프 : " + self.ID + " 현재 값: " + NowIsOn + "  갱신 값 : " + DeviceValue, DeviceIsError, DeviceUpdated);
                self.Value = DeviceValue;
                self.Battery = Battery;

                self.IsOn = self.Value == "1" ? true : false;

                //var pushServer = global.main.pushServer;
                var SendData = this.GetStatus();
                SendData.CMD = "DeviceStatus";
                pushServer.emit("sendAllClient", SendData);


                if (isDiffValue)
                    global.main.Control.emit("UpdatePump", self["ID"], self.Value);
                if (isDiffBattery)
                    global.main.Control.emit("UpdateBattery", self["ID"], self.Battery);
            }
            
            if (DeviceUpdated == "1" && !BU.isEmpty(self.DeviceCMD)) {
                BU.log("명령을 수행했습니다.");
                self.DeviceCMD.CallBack(undefined, self);
                self.DeviceCMD = {};
            }
        }
        
        if (DeviceIsError != self.IsError) {
            self.IsError = DeviceIsError;
            SendDeviceErrorGCM(self);
            //var pushServer = global.main.pushServer;
            var SendData = this.GetStatus();
            SendData.CMD = "DeviceStatus";
            pushServer.emit("sendAllClient", SendData);
        }
    });
    
    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["IsOn"] = self["IsOn"];
        SendObj["Value"] = self["Value"];
        SendObj["Battery"] = self["Battery"];
        SendObj["IsError"] = self["IsError"];
        //SendObj["CtrDate"] = self["CtrDate"];
        return SendObj;
    }
    
    /**
    펌프를 오픈한다.
    @method SetOpen : 펌프 오픈
    **/
    self.SetOn = function (pIsOn, CallBack) {
        BU.log("펌프 오픈 수행 : " + self.ID);
        //명령어 집어 넣음
        self.DeviceCMD = { "IsOn" : pIsOn, "CallBack" : CallBack };
        
        if (self.IsError != "0") {
            BU.log("펌프의 장치가 작동하지않습니다. 명령을 수행할 수 없습니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        if (self.IsOn === pIsOn) {
            BU.log("이미 같은 상태 입니다.");
            var err = { "IsError" : -1, "Message" : "이미 같은 상태 입니다." };
            CallBack(err, self);
            self.DeviceCMD = {};
            return;
        }
        
        var SendValue = "";
        if (pIsOn)
            SendValue = "1";
        else
            SendValue = "0";
        
        // 펌프의 상태를 키고자 할 때 벨브 상태 체크
        if (self.IsOn == false && pIsOn == true) {
            global.main.Control.emit("PumpStatusChange", self.ID, SendValue, function (err, result) {
                if (err) {
                    //var err = { "IsError" : -1, "Message" : "밸브가 열려있지 않아 펌프를 작동할 수 없습니다." };
                    CallBack(err, self);
                    return;
                }
                global.main.Control.emit("DeviceControl", self.ID, SendValue, "Pump", CallBack);
            });
        }
        else
            global.main.Control.emit("DeviceControl", self.ID, SendValue, "Pump", CallBack);

        
    }


    self.DeviceKey = "Pump";
    self.IsDeviceServerRun = 1;
    self.IsDeviceClientRun = 1;
    self.GetDeviceStatus = function () {
        if (self.IsDeviceServerRun == 0) {
            self["Value"] = "";
            self["IsError"] = "1";
        }
        
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Value"] = self["Value"];
        SendObj["IsError"] = self["IsError"];
        
        return SendObj;
    }
}
util.inherits(Pump, events.EventEmitter);
exports.Pump = Pump;

/**
저수지 클래스
@class Reservoir : 저수지
@constructor
**/
var Reservoir = function () {
    events.EventEmitter.call(this);
    var self = this;
    
    self["ID"] = "";
    self["Name"] = "";
    self["Type"] = "Reservoir";
    self["Depth"] = "";
    self["IsError"] = 0;
    self["MinWaterLevel"] = 0;
    self["MaxWaterLevel"] = 10000;
    self["SetWaterLevel"] = null;
    
    self["SettingSalinity"] = "";
    
    self["WaterDoorList"] = new Array();
    self["InWaterDoorList"] = new Array();
    self["EqualWaterDoorList"] = new Array();
    self["OutWaterDoorList"] = new Array();
    self["PumpList"] = new Array();
    self["ValveList"] = new Array();
    
    self["WaterLevel"] = null;
    self["Salinity"] = null;
    
    self.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["IsError"] = self["IsError"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];
        
        SendObj["InWaterDoorList"] = self["InWaterDoorList"];
        SendObj["EqualWaterDoorList"] = self["EqualWaterDoorList"];
        SendObj["OutWaterDoorList"] = self["OutWaterDoorList"];
        
        SendObj["PumpList"] = self["PumpList"];
        SendObj["ValveList"] = self["ValveList"];
        
        SendObj["WaterLevel"] = 1000;
        SendObj["Salinity"] = 1000;
        //BU.log(SendObj);
        return SendObj;
    }

    self.GetRelation = function (){
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];

        SendObj["ListWaterDoor"] = GetTargetID(self["WaterDoorList"]);
        SendObj["ListInWaterDoor"] = GetTargetID(self["InWaterDoorList"]);
        SendObj["ListEqualWaterDoor"] = GetTargetID(self["EqualWaterDoorList"]);
        SendObj["ListOutWaterDoor"] = GetTargetID(self["OutWaterDoorList"]);
        SendObj["ListPump"] = GetTargetID(self["PumpList"]);
        SendObj["ListValve"] = GetTargetID(self["ValveList"]);
        SendObj["ListWaterLevel"] = GetTargetID(self["WaterLevelList"]);
        SendObj["ListSalinity"] = GetTargetID(self["SalinityList"]);

        return SendObj;
    }
}
util.inherits(Reservoir, events.EventEmitter);
exports.Reservoir = Reservoir;


/**
염판 클래스
@class SaltPlate : 염판
@constructor
**/
var SaltPlate = function () {
    events.EventEmitter.call(this);
    var self = this;
    
    self["ID"] = "";
    self["Name"] = "";
    self["Type"] = "SaltPlate";
    self["IsError"] = 0;
    self["Depth"] = "";
    self["PlateType"] = "";
    self["SettingSalinity"] = "";
    self["MinWaterLevel"];
    self["MaxWaterLevel"];
    self["SetWaterLevel"];
    
    self["WaterDoorList"] = new Array();
    self["InWaterDoorList"] = new Array();
    self["EqualWaterDoorList"] = new Array();
    self["OutWaterDoorList"] = new Array();
    self["PumpList"] = new Array();
    self["ValveList"] = new Array();

    self["WaterLevelList"] = new Array();
    self["SalinityList"] = new Array();
    
    self["IsSendedReachSalinity"] = false;
    self["IsSendedGCM"] = "0";
    
 
    this.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        SendObj["IsError"] = self["IsError"];
        SendObj["PlateType"] = self["PlateType"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];
        SendObj["SetWaterLevel"] = self["SetWaterLevel"];
        
        SendObj["InWaterDoorList"] = self["InWaterDoorList"];
        SendObj["EqualWaterDoorList"] = self["EqualWaterDoorList"];
        SendObj["OutWaterDoorList"] = self["OutWaterDoorList"];
        
        SendObj["PumpList"] = self["PumpList"];
        SendObj["ValveList"] = self["ValveList"];
        
        SendObj["WaterLevel"] = self["WaterLevelList"][0].Value;
        SendObj["Salinity"] = self["SalinityList"][0].Value;
        return SendObj;
    }
    
    self.GetRelation = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        SendObj["PlateType"] = self["PlateType"];
        SendObj["SettingSalinity"] = self["SettingSalinity"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];

        SendObj["ListWaterDoor"] = GetTargetID(self["WaterDoorList"]);
        SendObj["ListInWaterDoor"] = GetTargetID(self["InWaterDoorList"]);
        SendObj["ListEqualWaterDoor"] = GetTargetID(self["EqualWaterDoorList"]);
        SendObj["ListOutWaterDoor"] = GetTargetID(self["OutWaterDoorList"]);
        SendObj["ListPump"] = GetTargetID(self["PumpList"]);
        SendObj["ListValve"] = GetTargetID(self["ValveList"]);
        SendObj["ListWaterLevel"] = GetTargetID(self["WaterLevelList"]);
        SendObj["ListSalinity"] = GetTargetID(self["SalinityList"]);

        return SendObj;
    }

}
util.inherits(SaltPlate, events.EventEmitter);
exports.SaltPlate = SaltPlate;


/**
해주 클래스
@class WaterTank : 해주
@constructor
**/
var WaterTank = function () {
    events.EventEmitter.call(this);
    var self = this;
    //this.main = global.main;
    self["IsError"] = 0;
    self["ID"] = "";
    self["Name"] = "";
    self["Type"] = "WaterTank";
    self["Depth"] = "";
    
    self["TankType"] = "";
    self["SettingSalinity"] = "";
    self["MinWaterLevel"] = "";
    self["MaxWaterLevel"] = "";
    
    self["WaterDoorList"] = new Array();
    self["InWaterDoorList"] = new Array();
    self["EqualWaterDoorList"] = new Array();
    self["OutWaterDoorList"] = new Array();
    self["PumpList"] = new Array();
    self["ValveList"] = new Array();

    self["WaterLevelList"] = new Array();
    self["SalinityList"] = new Array();
    
    self["IsFeedWater"] = "0";
    self["RecentFeedWaterEndDate"] = "";

    this.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["IsError"] = self["IsError"];
        SendObj["TankType"] = self["TankType"];
        SendObj["SettingSalinity"] = self["SettingSalinity"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];
        
        SendObj["InWaterDoorList"] = self["InWaterDoorList"];
        SendObj["EqualWaterDoorList"] = self["EqualWaterDoorList"];
        SendObj["OutWaterDoorList"] = self["OutWaterDoorList"];
        
        SendObj["PumpList"] = self["PumpList"];
        SendObj["ValveList"] = self["ValveList"];
        
        SendObj["WaterLevel"] = self["WaterLevelList"][0].Value;
        SendObj["Salinity"] = self["SalinityList"][0].Value;
        
        SendObj["RecentFeedWaterEndDate"] = self["RecentFeedWaterEndDate"];

        //BU.log(SendObj);
        return SendObj;
    }

    self.GetRelation = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        SendObj["TankType"] = self["TankType"];
        SendObj["SettingSalinity"] = self["SettingSalinity"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];

        SendObj["ListWaterDoor"] = GetTargetID(self["WaterDoorList"]);
        SendObj["ListInWaterDoor"] = GetTargetID(self["InWaterDoorList"]);
        SendObj["ListEqualWaterDoor"] = GetTargetID(self["EqualWaterDoorList"]);
        SendObj["ListOutWaterDoor"] = GetTargetID(self["OutWaterDoorList"]);
        SendObj["ListPump"] = GetTargetID(self["PumpList"]);
        SendObj["ListValve"] = GetTargetID(self["ValveList"]);
        SendObj["ListWaterLevel"] = GetTargetID(self["WaterLevelList"]);
        SendObj["ListSalinity"] = GetTargetID(self["SalinityList"]);
        
        return SendObj;
    }
}
util.inherits(WaterTank, events.EventEmitter);
exports.WaterTank = WaterTank;


/**
바다 클래스
@class WaterOut : 바다
@constructor
**/
var WaterOut = function () {
    events.EventEmitter.call(this);
    var self = this;
    //this.main = global.main;

    self["ID"] = "";
    self["Name"] = "";
    self["Type"] = "WaterOut";
    self["Depth"] = "";

    self["MinWaterLevel"] = 0;
    self["MaxWaterLevel"] = 10000;
    self["SetWaterLevel"];
    
    self["SettingSalinity"] = "";

    self["WaterDoorList"] = new Array();
    self["InWaterDoorList"] = new Array();
    self["EqualWaterDoorList"] = new Array();
    self["OutWaterDoorList"] = new Array();

    self["SalinityList"] = new Array();
    self["WaterLevelList"] = new Array();
    self["ValveList"] = new Array();
    self["PumpList"] = new Array();

    this.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];
        SendObj["SetWaterLevel"] = self["SetWaterLevel"];
        
        SendObj["InWaterDoorList"] = self["InWaterDoorList"];
        SendObj["EqualWaterDoorList"] = self["EqualWaterDoorList"];
        SendObj["OutWaterDoorList"] = self["OutWaterDoorList"];
        
        SendObj["PumpList"] = self["PumpList"];
        SendObj["ValveList"] = self["ValveList"];
        
        SendObj["WaterLevel"] = 1000;
        SendObj["Salinity"] = 1000;
        return SendObj;
    }

    self.GetRelation = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        SendObj["MinWaterLevel"] = self["MinWaterLevel"];
        SendObj["MaxWaterLevel"] = self["MaxWaterLevel"];

        SendObj["ListWaterDoor"] = GetTargetID(self["WaterDoorList"]);
        SendObj["ListInWaterDoor"] = GetTargetID(self["InWaterDoorList"]);
        SendObj["ListEqualWaterDoor"] = GetTargetID(self["EqualWaterDoorList"]);
        SendObj["ListOutWaterDoor"] = GetTargetID(self["OutWaterDoorList"]);
        SendObj["ListPump"] = GetTargetID(self["PumpList"]);
        SendObj["ListValve"] = GetTargetID(self["ValveList"]);
        SendObj["ListWaterLevel"] = GetTargetID(self["WaterLevelList"]);
        SendObj["ListSalinity"] = GetTargetID(self["SalinityList"]);
        
        return SendObj;
    }

}
util.inherits(WaterOut, events.EventEmitter);
exports.WaterOut = WaterOut;


/**
수로 클래스
@class WaterWay : 수로
@constructor
**/
var WaterWay = function () {
    events.EventEmitter.call(this);
    var self = this;
    //this.main = global.main;
    
    self["ID"] = "";
    self["Name"] = "";
    self["Type"] = "WaterWay";
    self["Depth"] = "";

    self["WaterDoorList"] = new Array();
    self["InWaterDoorList"] = new Array();
    self["EqualWaterDoorList"] = new Array();
    self["OutWaterDoorList"] = new Array();
    
    
    this.GetStatus = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        
        SendObj["InWaterDoorList"] = self["InWaterDoorList"];
        SendObj["EqualWaterDoorList"] = self["EqualWaterDoorList"];
        SendObj["OutWaterDoorList"] = self["OutWaterDoorList"];
        
        return SendObj;
    }

    self.GetRelation = function () {
        var SendObj = {};
        SendObj["ID"] = self["ID"];
        SendObj["Name"] = self["Name"];
        SendObj["Depth"] = self["Depth"];
        
        SendObj["ListWaterDoor"] = GetTargetID(self["WaterDoorList"]);
        SendObj["ListInWaterDoor"] = GetTargetID(self["InWaterDoorList"]);
        SendObj["ListEqualWaterDoor"] = GetTargetID(self["EqualWaterDoorList"]);
        SendObj["ListOutWaterDoor"] = GetTargetID(self["OutWaterDoorList"]);
        
        return SendObj;
    }

}
util.inherits(WaterWay, events.EventEmitter);
exports.WaterWay = WaterWay;



function MRF(pValue)
{
    return BU.MRF(pValue);

}
