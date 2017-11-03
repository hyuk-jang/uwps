var net = require("net");
var _ = require("underscore");
var util = require("util");
var events = require("events");

const BU = require('base-util-jh').baseUtil;
var _Smbuffer = require("../util/smBuffer.js");


// 장치 TCP
var Device_Server = function () {
    events.EventEmitter.call(this);
    var self = this;
    var main = global.main;
    var Salt = main.Salt;
    var DeviceInfo_List = Salt.DeviceList();

    self.on("Start", function () {
        _.each(DeviceInfo_List, function (DeviceInfo) {
            _.each(DeviceInfo, function (Device) {
                //if (Device["DeviceType"] == "Socket")
                DeviceConnector(Device);
                //else
                //BU.log("Device_Client Device : " + Device["ID"]);
            });
        });
    });

    self.on("AddDeviceServer", function (Device) {
        //BU.log("AddDeviceServer");
        try {
            DeviceConnector(Device);
        } catch (e) {
            BU.log("Error@@ : " + e.message);
        }
    });


    function DeviceConnector(Device) {
        var server = require('net').createServer();

        var IP = Device["IP"];
        var Port = Device["Port"];
        var Clients = [];

        server.on('listening', function () {
            Device.IsDeviceServerRun = 1;
            //BU.log('START : ', Port);
        });

        server.ID = Device["ID"];

        server.on('connection', function (socket) {
            //socket.setEncoding("utf8");
            Clients.push(socket);

            socket.Smbuffer = new _Smbuffer.SmBuffer();
            socket.Smbuffer.on("EndBuffer", function (Data) {
                socket.emit("ReadAll", Data);
            });
            socket.Smbuffer.on("Error", function (Message) {
                socket.destroy();
            });

            socket.on("ReadAll", function (data) {
                var DataObj = null;
                try {
                    DataObj = JSON.parse(data);
                } catch (ex) {
                    DataObj = null;
                }

                if (DataObj == null) {
                    return;
                }

                var SendObj = {};
                SendObj["CMD"] = "";
                SendObj["IsError"] = 0;
                SendObj["Message"] = "";
                SendObj["Contents"] = {};

                // 장비 데이터 요청
                if (DataObj["CMD"] == "UpdateDeviceData") {
                    var Contents = DataObj.Contents;
                    SendObj["CMD"] = "NowDeviceStatus";
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = DataObj["Contents"];

                    var SendData = BU.makeMessage(SendObj);

                    _.each(Clients, function (s) {
                        // BU.log(data.toString())
                        s.write(SendData);
                    });


                    var SendID = BU.sizeChangeID(Contents["ID"]);
                    //BU.CLI(SendID);
                    //BU.CLI(Contents["Value"]);
                    var SendValue = BU.sizeChangeValue(Contents["Value"]);
                    var SendIsError = BU.sizeChangeIsError("0");
                    var SendUpdated = "0";

                    var SendData = "#" + SendID + SendValue + SendIsError + SendUpdated + "\r\n";

                    SendData = BU.makeMessage(SendData);
                    // if (Contents.ID.indexOf("WD") != -1)
                    //     BU.CLI(SendData)
                        // BU.CLI(global.ControllerClients)
                    _.each(global.ControllerClients, function (s) {
                        s.write(SendData);
                    });
                }

                // 장비 데이터 요청
                else if (DataObj["CMD"] == "CloseDevice") {
                    var FindObj = Salt.FindObj(DataObj["ID"]);

                    SendObj["CMD"] = "CloseDeviceEnd";
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = "";
                    var SendData = BU.makeMessage(SendObj);

                    _.each(Clients, function (s) {
                        s.write(SendData);
                    });
                    socket.emit("allClose");
                    server.emit("close");


                    var SendID = BU.sizeChangeID(DataObj["ID"]);
                    var SendValue = BU.sizeChangeValue("");
                    var SendIsError = BU.sizeChangeIsError("1");
                    var SendUpdated = "0";

                    var SendData = "#" + SendID + SendValue + SendIsError + SendUpdated + "\r\n";
                    //BU.log("!@#!@#");
                    //BU.CLI(SendData);
                    SendData = BU.makeMessage(SendData);
                    _.each(global.ControllerClients, function (s) {
                        s.write(SendData);
                    });
                } else {
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["IsError"] = -1;
                    SendObj["Message"] = "알수 없는 명령어 입니다.";
                    SendObj["Contents"] = {};

                    var SendData = BU.makeMessage(SendObj);
                    socket.write(SendData);
                    return;
                }
            });

            socket.on("data", function (data) {
                //BU.log("data : " + data);
                socket.Smbuffer.emit("AddBuffer", data);
            });

            socket.on('close', function () {
                BU.log('socket close');
                Clients = _.filter(Clients, function (s) {
                    if (s === socket)
                        return false;
                    else
                        return true;
                });
                socket.destroy();
            });

            socket.on('allClose', function () {
                BU.log('socket close');
                Clients = _.filter(Clients, function (s) {
                    return false;
                    s.destroy();
                });
            });

            socket.on("error", function (err) {
                socket.destroy();
            });
        });

        server.on('close', function () {
            BU.log('Server is now closed');
            server.close();
            Device.IsDeviceServerRun = 0;
        });
        server.on('error', function (err) {
            // BU.CLI(Device);
            BU.log('Error occured:', err.message);
            //server.close();
            Device.IsDeviceServerRun = 0;
        });

        server.listen(Port);
    }


}
util.inherits(Device_Server, events.EventEmitter);
exports.Device_Server = Device_Server;