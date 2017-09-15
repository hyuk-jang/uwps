var net = require("net");
var _ = require("underscore");
var util = require("util");
var events = require("events");

// var BU = require('../util/baseUtil.js');
var _smBuffer = require("../util/smBuffer.js");

var _deviceServer = require("./deviceServer.js");
var _deviceClient = require("./deviceClient.js");

var WaterFlowInfo = null;

var CommunicationToController = function () {
    var self = this;
    var main = global.main;
    // var setInfo = main.setInfo;

    var Salt = main.Salt;
    var DeviceInfoList = Salt.DeviceList();
    
    var IP = global.fixmeConfig.socketDeviceIP;
    var Port = global.fixmeConfig.socketDevicePort;
    
    
    self.ControllerClients = [];
    global.ControllerClients = self.ControllerClients;
    
    self.on("Start", function () {
        var server = net.createServer();
        server.on('listening', function () {
            BU.log('START : ', Port);
        });
        
        server.on('connection', function (socket) {
            //socket.setEncoding("utf8");
            self.ControllerClients.push(socket);
            BU.CLI(self.ControllerClients)
            
            socket.smBuffer = new _smBuffer.SmBuffer();
            socket.smBuffer.on("EndBuffer", function (Data) {
                socket.emit("ReadAll", Data);
            });
            socket.smBuffer.on("Error", function (Message) {
                socket.destroy();
            });
            
            socket.on("ReadAll", function (data) {
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
                }
            });
            
            socket.on("data", function (data) {
                BU.log("TCP 통합서버 data : " + data);
                //socket.smBuffer.emit("AddBuffer", data);
            });
            
            socket.on('close', function () {
                BU.log('client disconnected!');
                self.ControllerClients = _.filter(self.ControllerClients, function (s) {
                    if (s === socket)
                        return false;
                    else
                        return true;
                });
                socket.destroy();
            });
            
            socket.on("error", function (err) {
                //BU.log("Error : " + err.message);
                socket.destroy();
            });
            
        });
        
        server.on('close', function () {
            BU.log('Server is now closed');
        });
        server.on('error', function (err) {
            BU.log('Error occured:', err.message);
        });
        
        server.listen(Port);
		BU.log("소켓 데이터 생성 서버 시작 : " + Port)
    });
}
util.inherits(CommunicationToController, events.EventEmitter);
exports.CommunicationToController = CommunicationToController;

var Clients = [];

var UpdateWaterFlow = function (WaterFlow){
    var TimeOut = setTimeout(function () {
        WaterFlow.CheckData();
        UpdateWaterFlow(WaterFlow);
    }, 1000);
}


var SendToClients = function () {
    var TimeOut = setTimeout(function () {
        var data = CycleData();
        _.each(Clients, function (s) {
            s.write(data);
        });
        SendToClients();
    }, 1000);

}





var Monitoring_Server = function () {
    var self = this;
    var main = global.main;
    var setInfo = main.setInfo;
    var Salt = main.Salt;
    
    var socketIp = 'localhost';
    var socketPort = 12345;
    
    self.on("Start", function () {
        Clients = [];
        var server = net.createServer();
        
        var WaterFlow = new setWaterFlow();
        
        UpdateWaterFlow(WaterFlow);
        
        SendToClients();

        server.on('listening', function () {
            //BU.log('START : ', Port);
        });
        
        server.on('connection', function (socket) {
            //socket.setEncoding("utf8");
            // 초기 접속시 맵 데이터 전송
            socket.write(MapData());
            
            Clients.push(socket);
            
            socket.smBuffer = new _smBuffer.SmBuffer();
            socket.smBuffer.on("EndBuffer", function (Data) {
                socket.emit("ReadAll", Data);
            });
            socket.smBuffer.on("Error", function (Message) {
                socket.destroy();
            });
            
            socket.on("ReadAll", function (data) {
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
                
                var SendObj = {};
                SendObj["CMD"] = "";
                SendObj["IsError"] = 0;
                SendObj["Message"] = "";
                SendObj["Contents"] = {};
                
                // 장치 서버 종료
                if (DataObj["CMD"] == "CloseDevice") {
                    var Device_ID = DataObj["ID"];
                    var DeviceInfo = Salt.FindObj(Device_ID);
                    
                    SendObj["CMD"] = "CloseDeviceEnd";
                    SendObj["Contents"] = {};
                    
                    if (DeviceInfo === undefined || DeviceInfo == null) {
                        SendObj["IsError"] = -1;
                        SendObj["Message"] = "해당 ID를 가진 장치는 없습니다.";
                        
                        var SendDataToUser = BU.makeMessage(SendObj);
                        socket.write(SendDataToUser);
                        return;
                    }
                    
                    var IsDeviceServerRun = DeviceInfo.IsDeviceServerRun;
                    var IsDeviceClientRun = DeviceInfo.IsDeviceClientRun;
                    
                    if (IsDeviceServerRun == 1 && IsDeviceClientRun == 1) {
                        var client = new net.Socket();
                        client.connect(DeviceInfo["Port"], DeviceInfo["IP"], function () {
                            var SendData = BU.makeMessage(DataObj);
                            client.write(SendData);
                            DeviceInfo.IsDeviceClientRun = 0;
                        });
                        SendObj["IsError"] = 0;
                        SendObj["Message"] = "";
                    }
                    else {
                        SendObj["IsError"] = -1;
                        SendObj["Message"] = "이미 해당장치는 작동하지 않습니다.";
                    }
                    
                    var SendDataToUser = BU.makeMessage(SendObj);
                    DeviceInfo.emit("UpdateData", "0", "1", "CloseDevice");
                    //BU.CLIS(SendDataToUser, 10);
                    socket.write(SendDataToUser);
                }

                // 장치 서버 재가동
                else if (DataObj["CMD"] == "RunDevice") {
                    var Device_ID = DataObj["ID"];
                    var DeviceInfo = Salt.FindObj(Device_ID);
                    
                    SendObj["CMD"] = "RunDeviceEnd";
                    SendObj["Contents"] = {};
                    
                    if (DeviceInfo === undefined || DeviceInfo == null) {
                        SendObj["IsError"] = -1;
                        SendObj["Message"] = "해당 ID를 가진 장치는 없습니다.";
                        
                        var SendDataToUser = BU.makeMessage(SendObj);
                        socket.write(SendDataToUser);
                        return;
                    }
                    
                    var IsDeviceServerRun = DeviceInfo.IsDeviceServerRun;
                    var IsDeviceClientRun = DeviceInfo.IsDeviceClientRun;
                    
                    if (IsDeviceServerRun == 1 && IsDeviceClientRun == 1) {
                        SendObj["IsError"] = -1;
                        SendObj["Message"] = "해당 장치서버는 이미 동작하고있습니다.";
                    }
                    if (IsDeviceClientRun == 0) {
                        var Device_Client = new _deviceClient.Device_Client();
                        Device_Client.emit("AddDeviceClient", DeviceInfo);
                        SendObj["IsError"] = 0;
                        SendObj["Message"] = "";
                    }
                    if (IsDeviceServerRun == 0) {
                        var Device_Server = new _deviceServer.Device_Server();
                        Device_Server.emit("AddDeviceServer", DeviceInfo);
                        SendObj["IsError"] = 0;
                        SendObj["Message"] = "";
                    }
                    
                    DeviceInfo.emit("UpdateData", "0", "0", "RunDevice");
                    var SendDataToUser = BU.makeMessage(SendObj);
                    socket.write(SendDataToUser);
                }
                
                // 장비 데이터 요청
                else if (DataObj["CMD"] == "DeviceChange") {
                    var Device_ID = DataObj["ID"];
                    var DeviceInfo = Salt.FindObj(Device_ID);
                    //BU.CLIS(DeviceInfo);
                    if (DeviceInfo === null) {
                        BU.log("해당 ID를 가진 장치는 없습니다.");
                        
                        SendObj["CMD"] = "DeviceChangeEnd";
                        SendObj["IsError"] = 1;
                        SendObj["Message"] = "해당 ID를 가진 장치는 없습니다.";
                        
                        var SendData = BU.makeMessage(SendObj);
                        socket.write(SendData);
                        return;
                    }
                    

                    DeviceInfo.emit("UpdateData", DataObj["Value"], "0", "Device_IntegratedServer");
                   
                    //DeviceInfo.Value = DataObj["Value"];
                    //BU.log("DeviceInfo.Value : " + DeviceInfo.Value)
                    var SendObjContents = {};
                    SendObjContents["ID"] = DeviceInfo.ID;
                    SendObjContents["Name"] = DeviceInfo.Name;
                    SendObjContents["Value"] = DeviceInfo.Value;
                    
                    SendObj["CMD"] = "DeviceChangeEnd";
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = SendObjContents;
                    
                    var SendData = BU.makeMessage(SendObj);
                    
                    socket.write(SendData);
                }
         
                // 장비 데이터 요청
                else if (DataObj["CMD"] == "WeatherDeviceChange") {
                    var Key = DataObj["ID"];
                    var WeatherObj = {};
                    WeatherObj["RainRate"] = main.WeatherDeviceStatus.RainRate.toString();
                    WeatherObj["Temperature"] = main.WeatherDeviceStatus.Temperature.toString();
                    WeatherObj["Humidity"] = main.WeatherDeviceStatus.Humidity.toString();
                    WeatherObj["WindDirection"] = main.WeatherDeviceStatus.WindDirection.toString();
                    WeatherObj["WindSpeed"] = main.WeatherDeviceStatus.WindSpeed.toString();
                    WeatherObj["SolarRadiation"] = main.WeatherDeviceStatus.SolarRadiation.toString();
                    
                    switch (Key) {
                        case "RainRate":
                            WeatherObj.RainRate = DataObj["Value"];
                            break;
                        case "Temperature":
                            WeatherObj.Temperature = DataObj["Value"];
                            break;
                        case "Humidity":
                            WeatherObj.Humidity = DataObj["Value"];
                            break;
                        case "WindDirection":
                            WeatherObj.WindDirection = DataObj["Value"];
                            break;
                        case "WindSpeed":
                            WeatherObj.WindSpeed = DataObj["Value"];
                            break;
                        case "SolarRadiation":
                            WeatherObj.SolarRadiation = DataObj["Value"];
                            break;
                        default :
                            break;
                    }
                    BU.CLI(WeatherObj)
                    main.Weather.emit("ReceiveWeatherData", WeatherObj);

                    
                    SendObj["CMD"] = "WeatherDeviceChangeEnd";
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {
                        "ID" : DataObj["ID"],
                        "Name" : "",
                        "Value" : DataObj["Value"]
                    };
                    
                    var SendData = BU.makeMessage(SendObj);
                    socket.write(SendData);
                }

                else {
                    SendObj["IsError"] = -1;
                    SendObj["Message"] = "알수 없는 명령어 입니다.";
                    var SendData = BU.makeMessage(SendObj);
                    socket.write(SendData);
                    return;
                }
            });
            
            socket.on("data", function (data) {
                //BU.log("TCP 통합서버 data : " + data);
                socket.smBuffer.emit("AddBuffer", data);
            });
            
            socket.on('close', function () {
                BU.log('client disconnected');
                Clients = _.filter(Clients, function (s) {
                    if (s === socket)
                        return false;
                    else
                        return true;
                });
                socket.destroy();
            });
            
            socket.on("error", function (err) {
                BU.log("ErrorDevice : " + err.message + socketPort);
                socket.destroy();
            });
            
        });
        
        server.on('close', function () {
            BU.log('Server is now closed');
        });
        server.on('error', function (err) {
            BU.log('Error occured:', err.message);
        });
        
        server.listen(socketPort);
    });
}
util.inherits(Monitoring_Server, events.EventEmitter);
exports.Monitoring_Server = Monitoring_Server;


function MapData() {
    var SendObj = {};
    var SendObjContents = [];
    
    //var MAP = global.mapImg;
    //var SETINFO = global.mapSetInfo;
    //var mapRelation = mapRelation
    //var mapControl = mapControl
    
    var main = global.main;
    var mapObj = global.initSetter.mapInfo;

    var mapImg = mapObj.mapImg;
    var mapSetInfo = mapObj.mapSetInfo;
    var mapRelation = mapObj.mapRelation;
    var mapControl = mapObj.mapControl;

    
    SendObjContents = {
        "MAP": mapImg,
        "SETINFO": mapSetInfo,
        "mapRelation" : mapRelation,
        "mapControl" : mapControl
    };
    
    SendObj["CMD"] = "NowDeviceMap";
    SendObj["IsError"] = "0";
    SendObj["Message"] = "";
    SendObj["Contents"] = SendObjContents;
    
    var SendMessage = BU.makeMessage(SendObj);
    //BU.CLIS(SendMessage);
    return SendMessage;
}

function CycleData() {
    var main = global.main;
    var DeviceInfo = main.Salt.DeviceList();
    var StatusWaterDoorList = new Array();
    _.each(DeviceInfo["WaterDoorList"], function (WD) {
        StatusWaterDoorList.push(WD.GetDeviceStatus());
    });
    
    var StatusWaterLevelList = new Array();
    _.each(DeviceInfo["WaterLevelList"], function (WL) {
        StatusWaterLevelList.push(WL.GetDeviceStatus());
    });
    
    var StatusSalinityList = new Array();
    _.each(DeviceInfo["SalinityList"], function (S) {
        StatusSalinityList.push(S.GetDeviceStatus());
    });
    
    var StatusPumpList = new Array();
    _.each(DeviceInfo["PumpList"], function (P) {
        StatusPumpList.push(P.GetDeviceStatus());

    });
    
    var StatusValveList = new Array();
    _.each(DeviceInfo["ValveList"], function (V) {
        StatusValveList.push(V.GetDeviceStatus());
    });
    
    var StatusWeatherDeviceList = main.WeatherDeviceStatus;

    var SendObj = {};
    var SendObjContents = [];
    SendObjContents = {
        "WaterDoorList" : StatusWaterDoorList,
        "WaterLevelList" : StatusWaterLevelList,
        "SalinityList" : StatusSalinityList,
        "PumpList" : StatusPumpList,
        "ValveList" : StatusValveList,
        "WeatherDeviceList" : StatusWeatherDeviceList
    };
    //SendObjContents["WaterDoorList"] = DeviceInfo;
    
    SendObj["CMD"] = "NowDeviceStatus";
    SendObj["IsError"] = "0";
    SendObj["Message"] = "";
    SendObj["Contents"] = SendObjContents;
    
    var SendMessage = BU.makeMessage(SendObj);
    //BU.CLI(SendMessage);
    return SendMessage;
}

var setWaterFlow = function () {
    var self = this;
    var main = global.main;
    
    var mapObj = global.mapObj;
    var mapImg = mapObj.mapImg;
    var mapSetInfo = mapObj.mapSetInfo;
    var mapRelation = mapObj.mapRelation;
    var mapControl = mapObj.mapControl;

    var Salt = main.Salt;
    var DeviceInfo = Salt.DeviceList();
    //DeviceInfo["WaterDoorList"] = Salt.SaltData["WaterDoorList"];
    //DeviceInfo["WaterLevelList"] = Salt.SaltData["WaterLevelList"];
    //DeviceInfo["SalinityList"] = Salt.SaltData["SalinityList"];
    //DeviceInfo["ValveList"] = Salt.SaltData["ValveList"];
    //DeviceInfo["PumpList"] = Salt.SaltData["PumpList"];
    
    //Salt.DeviceList();
    
    var SP_Data = [];
    var WT_Data = [];
    
    var SP_relation = mapRelation.SaltPlateData;
    var WT_relation = mapRelation.WaterTankData;
    var WD_relation = [];
    
    var emulSpeed = 5;  //시뮬레이션의 속도 ~!@
    
    
    // 재구성 데이터 추가
    function Add_Data(id, list, isIncrease, target) {
        var type = id.substring(0, 2);
        var isPump = false;
        var saveType = "";
        
        if (isIncrease) {
            saveType = "Increase";
        }
        else {
            saveType = "Decrease";
        }
        
        if (list != undefined && list.length > 0) {
            _.each(list, function (ele) {
                if (ele.indexOf("P") != -1)
                    isPump = true;
            });
        }
        
        var obj = { "isPump": isPump, "List": list, "Target": target };
        
        if (type == "SP") {
            _.each(SP_Data, function (data) {
                if (data.ID == id) {
                    if (!isPump) {
                        var nList = [];
                        var mWDList = [];
                        
                        _.each(list, function (wdid) {
                            if (_.contains(data.WD, wdid)) {
                                mWDList.push(wdid);
                            } else {
                                nList.push(wdid);
                            }
                        });
                        
                        obj = { "isPump": false, "List": nList, "subWD": mWDList, "Target": target };
                    }
                    data[saveType].push(obj);
                }
            });
        }
        else if (type == "WT") {
            _.each(WT_Data, function (data) {
                if (data.ID == id) {
                    if (!isPump) {
                        var nList = [];
                        var mWDList = [];
                        
                        _.each(list, function (wdid) {
                            if (_.contains(data.WD, wdid)) {
                                mWDList.push(wdid);
                            } else {
                                nList.push(wdid);
                            }
                        });
                        
                        obj = { "isPump": false, "List": nList, "subWD": mWDList, "Target": target };
                    }
                    
                    data[saveType].push(obj);
                }
            });
        }
    }
    
    var EmitCheck = function (Model, Value, IsError){
        if (Value < 0)
            Value = 0;
        
        //if (Model.ID == "S7") {
        //    //BU.CLI(Model.Value)
        //    BU.log("EmitCheck : " + Value)
        //}
            

        //var FindObj = global.main.Salt.FindObj(Model.ID);
        if (global.fixmeConfig.isUsedSerial === "2") {
            return;
        }
        if (global.fixmeConfig.isUsedSerial === "1" && Model.DeviceType === "Serial") {
            return;
        }


        // 수위 일 경우
        if (Model.DeviceKey == "WL") {
            var findObj = main.Salt.FindParent(Model.ID, "WaterLevel");
            if (_.isEmpty(findObj))
                return;
            findObj = _.first(findObj);

            var socketValue = Value;
            //BU.log("socketValue", socketValue)
            //return;
            // 해주 일 경우
            if (findObj.Type == "WaterTank") {
                //BU.log("해주")
                if (Value < 20)
                    Value = 0;
                else if (Value < 40)
                    Value = 1;
                else if (Value < 60)
                    Value = 2;
                else if (Value < 80)
                    Value = 3;
                else
                    Value = 4;
            }
            // 증발지 일 경우
            else if (findObj.Type == "SaltPlate" && findObj.PlateType.indexOf("Evaporating") != -1) {
                //BU.log("@@@@증발지", Value )
                if (Value < 0.5)
                    Value = 0;
                else if (Value < 2)
                    Value = 1;
                else if (Value < 4)
                    Value = 2;
                else if (Value < 6)
                    Value = 3;
                else
                    Value = 4;
            }
                // 결정지 일 경우
            else if (findObj.Type == "SaltPlate" && findObj.PlateType.indexOf("Crystallizing") != -1) {
                //BU.log("@@@@증 결정지", Value)
                if (Value < 0.5)
                    Value = 0;
                else if (Value < 1.5)
                    Value = 1;
                else if (Value < 3)
                    Value = 2;
                else if (Value < 4.5)
                    Value = 3;
                else
                    Value = 4;
            }
            Model.emit("UpdateSocketData", socketValue);

            
        }

        //BU.log("Model", Model)
        //var battery = 10 * _.random(7, 12) * 0.1;
        //BU.log("battery", Model.ID, battery)
        // 실제값, 에러, 타입, 배터리
        Model.emit("UpdateData", Value, IsError, "EmitCheck");
    }
    

    // 5가지 타입 데이터 찾기
    function Find_Obj(id) {
        var deviceType = "";
        
        if (id.substring(0, 1) == "P") {
            deviceType = "PumpList";
        } else if (id.substring(0, 1) == "V") {
            deviceType = "ValveList";
        } else if (id.substring(0, 1) == "S") {
            deviceType = "SalinityList";
        } else if (id.substring(0, 2) == "WL") {
            deviceType = "WaterLevelList";
        } else if (id.substring(0, 2) == "WD") {
            deviceType = "WaterDoorList";
        }
        
        //BU.CLI(deviceType);
        //BU.CLI(DeviceInfo);
        var rObj = _.find(DeviceInfo[deviceType], function (device) {
            //BU.CLI(device);
            return device.ID == id;
        });
        
        return rObj;
    }
    // SP나 WT로 부터 WL, SA 값을 얻어온다.
    function Find_WLSA(target) {
        var tempList = SP_Data.concat(WT_Data);
        
        var f_Obj = _.find(tempList, function (data) {
            return data.ID == target;
        });
        
        if (f_Obj != undefined) {
            var rObj = {
                "ID": target, "WL_val": Find_Obj(f_Obj.WL[0]).socketValue,
                "SA_val": Find_Obj(f_Obj.SA[0]).Value
            };
            
            if (f_Obj.Depth != undefined)
                rObj.Depth = f_Obj.Depth;
        }
        else
            var rObj = { "ID": target, "WL_val": 100, "SA_val": 3 };
        
        return rObj;
    }
    // WD를 통행 SP와 연결된걸 확인
    function CheckLinkSP(fWD_ID, m_ID) {
        var f_WD = _.find(WD_relation, function (WD) {
            return WD.ID == fWD_ID;
        });
        
        if (f_WD.List.length < 2)
            return null;
        
        var other = _.find(f_WD.List, function (id) {
            return id != m_ID;
        });
        
        if (other.substring(0, 2) != "SP" && other.substring(0, 2) != "WT")
            return null;
        
        var rObj = Find_WLSA(other);
        
        return rObj;
    }
    // 소금 이동량 체크
    function getSalt(target, offset) {
        var rVal = 0;
        
        var t_sa = target.SA_val;
        var t_obj = target.t_Obj;
        
        rVal = offset * t_sa;
        
        return rVal;
    }
    // 수치 조정
    function setWaterLevel() {
        _.each(SP_Data, function (data) {
            var WL_Model = Find_Obj(data.WL[0]);
            //if (main.setInfo.isUsedSerial !== "0" && WL_Model.DeviceType === "Serial")
            //    return;
            var ChangeValue = Number(WL_Model.socketValue) + data.WaterOffset;
           
            //EmitCheck( WL_Model, ChangeValue.toFixed(3), "0");
            //WL_Model.Value = Number(WL_Model.Value) + data.WaterOffset;
            if (ChangeValue < 0) {
                ChangeValue = 0;
                //EmitCheck( WL_Model, 0, "0");
                //WL_Model.Value = 0;
            }
            //if (WL_Model.ID == "WL5")
            //    BU.log("!@#!@#")
            EmitCheck(WL_Model, ChangeValue.toFixed(3), "0");     
        });
        
        _.each(WT_Data, function (data) {
            var WL_Model = Find_Obj(data.WL[0]);
            //if (main.setInfo.isUsedSerial !== "0" && WL_Model.DeviceType === "Serial")
            //    return;
            
            var ChangeValue = Number(WL_Model.socketValue) + data.WaterOffset;
            //EmitCheck( WL_Model, ChangeValue.toFixed(3), "0");
            //WL_Model.Value = Number(WL_Model.Value) + data.WaterOffset;
            if (ChangeValue < 0)
                ChangeValue = 0;
                //WL_Model.Value = 0;
            //if (WL_Model.ID == "WL5")
            //    BU.log("ㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴㄴ")
            EmitCheck(WL_Model, ChangeValue.toFixed(3), "0");     
        });
    }
    // 물을 줄수 있는지 확인
    function CheckWaterMove(target) {
        var rVal = false;
        
        if (target.WL_val > 0) {
            rVal = true;
        }
        
        return rVal;
    }
    
    //SP와 WT의 릴레이션에서 필요한 데이터만 추출
    _.each(SP_relation, function (data) {
        var obj = {
            "ID": data.ID, "Increase": [], "Decrease": [], "WL": data.ListWaterLevel,
            "SA": data.ListSalinity, "WD": data.ListWaterDoor
        };
        
        var WL = Find_Obj(obj.WL[0]);
        var SA = Find_Obj(obj.SA[0]);
        
        if (data.Depth != undefined)
            obj.Depth = data.Depth;
        
        SP_Data.push(obj);
    });
    _.each(WT_relation, function (data) {
        var obj = {
            "ID": data.ID, "Increase": [], "Decrease": [], "WL": data.ListWaterLevel,
            "SA": data.ListSalinity, "WD": data.ListWaterDoor
        };
        
        var WL = Find_Obj(obj.WL[0]);
        var SA = Find_Obj(obj.SA[0]);
        
        WT_Data.push(obj);
    });
    
    // WD 관계를 구성 
    
    // SimpleMode를 통행 SP와 WT에 물을 넣고 빼는 조건을 계산
    _.each(mapControl.SimpleMode, function (cmdlist) {
        _.each(cmdlist.DesList, function (cmd) {
            
            if (cmd.Type != "Controller") {
                Add_Data(cmdlist.SrcID, cmd.True, false, cmd.DesID);
                Add_Data(cmd.DesID, cmd.True, true, cmdlist.SrcID);
            }
        });
    });
    
    _.each(DeviceInfo["WaterDoorList"], function (device) {
        var obj = { "ID": device.ID, "List": [] };
        var temp_relation = SP_Data.concat(WT_Data);
        
        // SP와 WT에서 WD
        _.each(temp_relation, function (data) {
            if (_.contains(data.WD, obj.ID)) {
                obj.List.push(data.ID);
            }
        });
        
        // WO에서 WD
        _.each(mapRelation.WaterOutData, function (data) {
            if (_.contains(data.ListWaterDoor, obj.ID)) {
                obj.List.push(data.ID);
            }
        });
        
        WD_relation.push(obj);
    });
    
    
    
    var evaporation = 0.00347 * emulSpeed; // 기본 증발량
    //var WL_pump = 0.03 * emulSpeed;  // 펌프로 이동하는 물의 양
    //var WL_wd = WL_pump * 0.2;   // 수문으로 이동하는 물 기본
    
    var WL_pump = 0.066667 * emulSpeed;  // 펌프로 이동하는 물의 양
    var WL_wd = 0.4 * emulSpeed;   // 수문으로 이동하는 물 기본
    
    self.CheckData = function () {
        _.each(SP_Data, function (SP) {
            var WL_Val = -evaporation;  // 물 증, 감 값
            var SA_Val = 0;  // 소금  증가량
            
            var WL_dec = 0;
            //BU.log("self.CheckData");
            //BU.CLI(SP)
            var WL_Model = Find_Obj(SP.WL[0]);
            WL_Model.socketValue = Number(WL_Model.socketValue);
            var SA_Model = Find_Obj(SP.SA[0]);
            SA_Model.Value = Number(SA_Model.Value);
            
            var Salinity = SA_Model.Value;
            
            var Salt = WL_Model.socketValue * Salinity;
            
            if (Salinity >= 100) {  // 염도 100퍼 센트면 증발은 없음.
                WL_Val = 0;
            }
            
            _.each(SP.Increase, function (inc) {
                if (inc.isPump) { // 펌프일 경우는 하나만 꺼져도 물이 안통함
                    var isClose = false;
                    
                    _.each(inc.List, function (id) {
                        if (!isClose) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                            }
                            else {
                                isClose = true;
                            }
                        }
                    });
                    
                    if (!isClose) {
                        
                        var t_obj = Find_WLSA(inc.Target);
                        if (CheckWaterMove(t_obj))
                            WL_Val += WL_pump;
                        SA_Val += getSalt(t_obj, WL_pump);
                    }
                }
                else {          // 수문이라면 하나만 열려도 조금씩 증,감 SP는 별도의 수문 로직.
                    _.each(inc.subWD, function (id) {
                        var f_obj = Find_Obj(id);
                        
                        if (f_obj.Value == 1) {
                            var linkSP = CheckLinkSP(id, SP.ID);
                            
                            if (linkSP != null) {
                                if (CheckWaterMove(linkSP)) {
                                    if (linkSP.Depth != undefined && linkSP.Depth == SP.Depth) {
                                        var m_WL_val = Find_Obj(SP.WL[0]).socketValue;
                                        var m_SA_val = Find_Obj(SP.SA[0]).Value;
                                        
                                        if (m_WL_val < linkSP.WL_val) {
                                            //if (linkSP.WL_val - m_WL_val <= WL_wd) {
                                            var half = (linkSP.WL_val - m_WL_val) / 2;
                                            if (half > WL_pump * 2)
                                                half = WL_pump * 2;
                                            
                                            WL_Val += half;
                                            
                                            SA_Val += getSalt(linkSP, half);
                                            //}
                                            //else {
                                            //    WL_Val += WL_wd;

                                            //    SA_Val += getSalt(linkSP, WL_wd);
                                            //}
                                        }
                                        else if (m_WL_val == linkSP.WL_val) {
                                            SA_Val += getSalt(linkSP, WL_wd / 4);
                                        }
                                    }
                                    else {
                                        WL_Val += WL_wd;
                                        
                                        SA_Val += getSalt(linkSP, WL_wd);
                                    }
                                }
                            }
                            else {
                                var t_obj = Find_WLSA(inc.Target);
                                if (CheckWaterMove(t_obj))
                                    WL_Val += WL_wd;
                                
                                SA_Val += getSalt(t_obj, WL_wd);
                            }
                        }
                    });
                }
            });
            
            // 물이 감소하는 경우에는 염도가 관계 없음.
            _.each(SP.Decrease, function (dec) {
                if (dec.isPump) { // 펌프일 경우는 하나만 꺼져도 물이 안통함
                    var isClose = false;
                    
                    _.each(dec.List, function (id) {
                        if (!isClose) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                            }
                            else {
                                isClose = true;
                            }
                        }
                    });
                    
                    if (!isClose) {
                        WL_dec -= WL_pump;
                    }
                }
                else {          // 수문이 하나라도 열리면 감소 ( 다른 SP와 수문을 통해 연결되었을때를 처리할 로직 필요 )
                    var isOpen = false; // 물 보낼 곳이 막히면 안보냄
                    
                    _.each(dec.List, function (id) {
                        var f_obj = Find_Obj(id);
                        
                        if (f_obj.Value == 1) {
                            
                            isOpen = true;
                        }
                    });
                    
                    if (dec.List.length < 1) {
                        isOpen = true;
                    }
                    
                    if (isOpen) {
                        _.each(dec.subWD, function (id) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                                var linkSP = CheckLinkSP(id, SP.ID);
                                
                                if (linkSP != null) {
                                    if (linkSP.Depth != undefined && linkSP.Depth == SP.Depth) {
                                        var m_WL_val = Find_Obj(SP.WL[0]).socketValue;
                                        var m_SA_val = Find_Obj(SP.SA[0]).Value;
                                        
                                        if (m_WL_val > linkSP.WL_val) {
                                            //if (m_WL_val - linkSP.WL_val <= WL_wd) {
                                            var half = (m_WL_val - linkSP.WL_val) / 2;
                                            
                                            if (half > WL_pump * 2)
                                                half = WL_pump * 2;
                                            
                                            WL_dec -= half;
                                            //BU.log(half);
                                            //SA_Val -= Salinity * (WL_wd - half);
                                            //} else {
                                            //    WL_dec -= WL_wd;
                                            //}
                                        }
                                        else if (m_WL_val == linkSP.WL_val) {
                                            SA_Val -= Salinity * WL_wd;
                                        }
                                    }
                                    else {
                                        WL_dec -= WL_wd;
                                    }
                                }
                                else {
                                    WL_dec -= WL_wd;
                                }
                            }
                        });
                    }
                }
            });
            
            Salt += (SA_Val + Salinity * WL_dec);
            
            SP.WaterOffset = WL_Val + WL_dec;
            
            var tempWater = WL_Model.socketValue + WL_Val + WL_dec;
            
            if (WL_Model.socketValue < 0) {
                EmitCheck( WL_Model, 0, "0");
                EmitCheck( SA_Model, 0, "0");
                //WL_Model.Value = 0;
                //SA_Model.Value = 0;
            }
            else {
                Salinity = Salt / tempWater;
                
                if (Salinity > 30) {
                    Salinity = 30;
                }
                else if (Salinity <= 0) {
                    Salinity = 0;
                }
                EmitCheck( SA_Model, Salinity.toFixed(3), "0");
                //SA_Model.Value = Salinity;
            }
        });
        
        _.each(WT_Data, function (WT) {
            var WL_Val = 0;  // 증, 감 값
            var SA_Val = 0;
            
            var WL_inc = 0;
            var WL_dec = 0;
            
            var WL_Model = Find_Obj(WT.WL[0]);
            WL_Model.socketValue = Number(WL_Model.socketValue);
            var SA_Model = Find_Obj(WT.SA[0]);
            SA_Model.Value = Number(SA_Model.Value);
            
            var Salinity = SA_Model.Value;
            
            var Salt = WL_Model.socketValue * Salinity;
            
            _.each(WT.Increase, function (inc) {
                
                if (inc.isPump) { // 펌프일 경우는 하나만 꺼져도 물이 안통함
                    var isClose = false;
                    
                    _.each(inc.List, function (id) {
                        if (!isClose) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                            }
                            else {
                                isClose = true;
                            }
                        }
                    });
                    
                    if (!isClose) {
                        var t_obj = Find_WLSA(inc.Target);
                        
                        if (CheckWaterMove(t_obj))
                            WL_Val += WL_pump;
                        
                        SA_Val += getSalt(t_obj, WL_pump);
                    }
                }
                else {          // 수문이라면 하나만 열려도 조금씩 증,감
                    var isSubOpne = false;
                    
                    _.each(inc.subWD, function (id) {
                        var f_obj = Find_Obj(id);
                        
                        if (f_obj.Value == 1) {
                            isSubOpne = true;

                        }
                    });
                    
                    if (isSubOpne) {  // 받아들이 워터 탱크의 수문이 열려 있어야 증가 가능
                        _.each(inc.List, function (id) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                                var t_obj = Find_WLSA(inc.Target);
                                
                                if (CheckWaterMove(t_obj))
                                    WL_Val += WL_wd;
                                
                                SA_Val += getSalt(t_obj, WL_wd);
                            }
                        });
                        
                        if (inc.List.length < 1) {
                            var t_obj = Find_WLSA(inc.Target);
                            
                            if (CheckWaterMove(t_obj))
                                WL_Val += WL_wd;
                            
                            SA_Val += getSalt(t_obj, WL_wd);
                        }
                    }
                }
            });
            
            _.each(WT.Decrease, function (dec) {
                if (dec.isPump) { // 펌프일 경우는 하나만 꺼져도 물이 안통함
                    var isClose = false;
                    
                    _.each(dec.List, function (id) {
                        if (!isClose) {
                            var f_obj = Find_Obj(id);
                            
                            if (f_obj.Value == 1) {
                            }
                            else {
                                isClose = true;
                            }
                        }
                    });
                    
                    if (!isClose) {
                        WL_dec -= WL_pump;
                    }
                }
                else {          // 수문이라면 하나만 열려도 조금씩 증,감
                    _.each(dec.subWD, function (id) {
                        var f_obj = Find_Obj(id);
                        
                        if (f_obj.Value == 1) {
                            WL_dec -= WL_wd;
                        }
                    });
                    
                    _.each(dec.List, function (id) {
                        var f_obj = Find_Obj(id);
                        
                        if (f_obj.Value == 1) {
                            WL_dec -= WL_wd;
                        }
                    });
                }
            });
            
            Salt += (SA_Val + Salinity * WL_dec);
            
            WT.WaterOffset = WL_Val + WL_dec;
            
            var tempWater = WL_Model.socketValue + WL_Val + WL_dec;
            
            if (WL_Model.socketValue <= 0) {
                EmitCheck( WL_Model, 0, "0");
                EmitCheck( SA_Model, 0, "0");
                //WL_Model.Value = 0;
                //SA_Model.Value = 0;
            }
            else {
                Salinity = Salt / tempWater;
                if (Salinity > 30)
                    Salinity = 30;
                
                EmitCheck( SA_Model, Salinity.toFixed(3), "0");
                //SA_Model.Value = Salinity;
            }
        });
        
        setWaterLevel();
    }
    
    self.CheckData();
    //BU.log(mapRelation);
    //BU.log(mapControl);
    //BU.log(DeviceInfo);
};