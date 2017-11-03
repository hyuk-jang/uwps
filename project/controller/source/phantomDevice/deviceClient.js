var net = require("net");
var util = require("util");
var events = require("events");
var _ = require("underscore");

var BU = require('base-util-jh').baseUtil;
var _Smbuffer = require("../util/smBuffer.js");
var IntegratedServer = require("../phantomDevice/deviceIntegratedServer.js");

function GetData(Case, Value, controlNumber, DeviceData){
    var returnValue = "";
    //if (Value == "") {
    //    BU.log("데이터 노입력");
    //    Value = 1;
    //}
    
    switch (Case) {
        case "WD":
            if (Value === ""){
                returnValue = Math.round(Math.random() * 100) % 2;
                //returnValue = 0;
            }
            else
                returnValue = Value;
            return returnValue;
        case "WL":
            //controlNumber++;
            //var rData = Value;
            ////if (Value.toString().substr(0, 1) == "R")
            ////    rData = Value.substr(1);

            //var standardValue = Number(Value);
            //var mat = Math.random();
            //var mat2 = mat * 3 / 10;
            //if (controlNumber % 2 == 0)
            //    standardValue += mat2;
            //else
            //    standardValue -= mat2;
            
            //returnValue = ((Math.round(standardValue * 1000)) / 1000).toFixed(3);
            var standardValue = Number(Value);

            //if (DeviceData.WaterOffset != undefined)
            //    standardValue += DeviceData.WaterOffset;

            return standardValue;
        case "Pump":
            if (Value === "") {
                //returnValue = Math.round(Math.random() * 100) % 2;
                returnValue = 0;
            }
            else
                returnValue = Value;
            return returnValue;
        case "Salinity":
            //controlNumber++;
            
            //var standardValue = Number(Value);
            //var mat = Math.random();
            //var mat2 = mat * 3 / 10;
            //if (controlNumber % 2 == 0)
            //    standardValue += mat2;
            //else
            //    standardValue -= mat2;
            
            //returnValue = ((Math.round(standardValue * 1000)) / 1000).toFixed(3);

            var standardValue = Number(Value);

            //if (DeviceData.SalinityOffset != undefined)
            //    standardValue += DeviceData.SalinityOffset;

            return standardValue;
        case "Valve":
            if (Value === "") {
                returnValue = 0;
                //returnValue = Math.round(Math.random() * 100) % 2;
            }
            else
                returnValue = Value;
            return returnValue;
        case "W_D":
            if (Value === "" || Value === undefined) {
                returnValue = Math.round(Math.random() * 100) % 2;
            }
            else
                returnValue = Value;
            return returnValue;
    }
}



var Device_Client = function () {
    events.EventEmitter.call(this);
    var self = this;
    var main = global.main; //메인 프로그램
    var setInfo = main.setInfo;
    var Salt = main.Salt;
    var DeviceInfo_List = Salt.DeviceList();

    var SendDataDelay = 1;
    
    var ClientsList = [];
    // BU.CLI(DeviceInfo_List)
    self.on("Start", function () {
        _.each(DeviceInfo_List, function (DeviceInfo) {
            _.each(DeviceInfo, function (Device) {
                
                if (Device["DeviceType"] == "Socket" || global.fixmeConfig.isUsedSerial == "0"){
                    // BU.CLI(Device)
                    DeviceConnector(Device);
                }
                    
                //else
                //    BU.log("Device_Client Device : " + Device["ID"]);
            });
        });
    });
    
    self.on("AddDeviceClient", function (Device) {
        BU.log("AddDeviceClient");
        try {
            // BU.CLIS(Device);
            DeviceConnector(Device);
        }
        catch (e) {
            BU.log("Error : " + e.message);
        }
    });
    
    
    var SubmitDataToDeviceServer = function (Device, controlNumber){
        //BU.log("SubmitDataToDeviceServer : " + Device["ID"]);
        var IsClient = _.findWhere(ClientsList, { "Device_ID" : Device["ID"] });
        
        if (BU.isEmpty(IsClient)) {
            BU.log("장치 클라이언트 없네? : " + Device["ID"]);
            return;
        }
        
        

        var Device_ID = Device["ID"];
        var IP = Device["IP"];
        var Port = Device["Port"];
        var cNumber = controlNumber++;
        
        var DeviceInfo = Salt.FindObj(Device_ID);
        
        if (Device.IsDeviceClientRun == 0) {
            BU.log("장치 클라이언트 종료 : " + Device["ID"]);
            IsClient.emit("close");
            return;
        }
        
        var SendObj = {};
        var SendObjContents = {};
        SendObjContents["ID"] = DeviceInfo.ID;
        SendObjContents["Value"] = GetData(DeviceInfo.DeviceKey, DeviceInfo.Value, cNumber++, DeviceInfo);
        
        // if (Device.ID.indexOf("WD") != -1) {
        //    BU.CLI(SendObjContents)
        // }
        //if (Device["ID"] == "S24") {
        //    BU.CLI(SendObjContents)
        //}
        
        
        //BU.log(DeviceInfo);
        
        //if (DeviceInfo.ID == "WD2") {
        //    BU.log("1818191")
        //    BU.CLI(SendObjContents);
        //}
            
        
        SendObj["CMD"] = "UpdateDeviceData";
        SendObj["IsError"] = 0;
        SendObj["Message"] = "";
        SendObj["Contents"] = SendObjContents;
        
        var SendData = BU.makeMessage(SendObj);
        
        IsClient.write(SendData);
        //BU.log(SendData);
        
        
        
        var TimeOut = setTimeout(function () {
            SubmitDataToDeviceServer(Device, cNumber);
        }, 1000 * SendDataDelay);

    }
    
    function DeviceConnector(Device) {
        var Device_ID = Device["ID"];
        var IP = Device["IP"];
        var Port = Device["Port"];
        var controlNumber = 0;
        
        var client = new net.Socket();
        client["Device_ID"] = Device["ID"];
        
        
        
        //BU.log("Device_ID : " + Device_ID);

        //client["IP"] = Device["IP"];
        //client["Port"] = Device["Port"];
        //client["controlNumber"] = Device["controlNumber"];
        //client["controlNumber"] = Device["controlNumber"];
        
        
        
        ClientsList.push(client);

        client.Smbuffer = require("../util/sm-buffer")();
        client.Smbuffer.on("endBuffer", function (Data) {
            client.emit("readAll", Data);
        });
        
        client.connect(Port, IP, function () {
            //BU.log('Connected');
            Device.IsDeviceClientRun = 1;
            SubmitDataToDeviceServer(Device, 0);
            //var StartInterval = setInterval(function () {
            //    var DeviceInfo = Salt.FindObj(Device_ID);
             
            //    if (Device.IsDeviceClientRun == 0) {
            //        clearInterval(StartInterval);
            //        client.emit("close");
            //    }
                
            //    var SendObj = {};
            //    var SendObjContents = {};
            //    SendObjContents["ID"] = DeviceInfo.ID;
            //    SendObjContents["Value"] = GetData(DeviceInfo.DeviceKey, DeviceInfo.Value, controlNumber++, DeviceInfo);

            //    //BU.log(DeviceInfo);


            
                
            // if (Device.ID == "WD4")
                //    BU.CLI(Device);

            //    SendObj["CMD"] = "UpdateDeviceData";
            //    SendObj["IsError"] = 0;
            //    SendObj["Message"] = "";
            //    SendObj["Contents"] = SendObjContents;
                        
            //    var SendData = BU.makeMessage(SendObj);
            //    //BU.log(SendData);
                        
            //    client.write(SendData);
            // }, 1000 * SendDataDelay);
        });
                
        client.on("readAll", function (data) {
            // BU.CLI("RealAll", data)
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
        });
                
        client.on('data', function (data) {
            // BU.CLI(data.toString())
            client.Smbuffer.emit("addBuffer", data);
        });
                
        client.on('close', function () {
            BU.log('Connection closed');
            Device.IsDeviceClientRun = 0;
            
            ClientsList = _.reject(ClientsList, function (Client) {
                if (Client["Device_ID"] == client["Device_ID"]) {
                    return true;
                }
            });

            client.end();
        });
                
        client.on('error', function () {
            BU.log('Connection error');
            Device.IsDeviceClientRun = 0;
        });
            
    }
}
util.inherits(Device_Client, events.EventEmitter);
exports.Device_Client = Device_Client;
