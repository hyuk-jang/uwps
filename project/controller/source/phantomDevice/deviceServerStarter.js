var _Device_IntegratedServer = require("./deviceIntegratedServer.js");
var _Device_Server = require("./deviceServer.js");
var _Device_Client = require("./deviceClient.js");


 //연계 서버 작동
var Monitoring_Server = new _Device_IntegratedServer.Monitoring_Server();
Monitoring_Server.emit("Start");

//var CommunicationToController = new _Device_IntegratedServer.CommunicationToController();
//CommunicationToController.emit("Start");

// 장치 TCP Client 작동
var Device_Client = new _Device_Client.Device_Client();
Device_Client.emit("Start");

 //장치 TCP Server 작동
var Device_Server = new _Device_Server.Device_Server();
Device_Server.emit("Start");
