var BU = require("./baseUtil.js"); //기본모듈
var net = require("net");
var _ = require("underscore");
var events = require('events');
var util = require('util');
var _Smbuffer = require("./SmBuffer.js");

CMDServer = function (main) {
    events.EventEmitter.call(this);
    var self = this;
    self.Clients = new Array();
    self.main = global.main; //메인 프로그램
    self.IsUserCMD = false;


    this.on("Start", function () {
        BU.LogFile("CMDServer.js : 연결을 닫는 소켓 서버를 실행하고 있습니다.");
        var Server = net.createServer(function (socket) {
            BU.LogFile("CMDServer.js : 소켓 연결이 연결되었습니다.")
            
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
                }
                catch (ex) {
                    DataObj = null;
                }

                if(DataObj == null){
                    return;
                }
                BU.LogFile("클라이언트로 받은 메세지")
                BU.LogFile(JSON.stringify(DataObj));


                var SendObj = {};
                SendObj["IsError"] = 0;
                SendObj["Message"] = "";

                if(DataObj["SessionID"] ==  undefined){
                    //BU.LogFile("세션이 만료 되었습니다.");
                    console.log("세션 언디파인드");
                    SendObj["IsError"] = -1;
                    SendObj["Message"] = "잘못된 접근입니다.";
                    var SendData = BU.MakeMessage(SendObj);
                    socket.write(SendData);
                    socket.destroy();
                    return;

                }
                else {
                    console.log("여기 ㄴ아닌ㄹ텐데 @@!$!@ㄲ!@#$!@")
                    var PushServerClients = self.main.PushServer["Clients"];
                    var _Clients = _.where(PushServerClients, { "SessionID" : DataObj["SessionID"] });
                    if(_Clients.length == 0){
                        SendObj["IsError"] = -2;
                        SendObj["Message"] = "세션이 만료 되었습니다.";
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    }
                }


                //GetMap  맵 데이터 요청 
                if (DataObj["CMD"] == "GetMap") {
                    //BU.CLIS(DataObj);
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = DataObj["CMD_Key"];
                    SendObj["Map_Version"] = global.mapFileName;
                    SendObj["Contents"] = global.mapImg;
                    //BU.LogFile(SendObj);
                    var SendData = BU.MakeMessage(SendObj);
                    socket.write(SendData);
                    socket.destroy();
                    return;
                }

                
                //차일드 관계 정보 요청
                else if(DataObj["CMD"]  == "GetRelation"){
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    SendObj["Map_Version"] = global.mapFileName;

                    SendObj["Contents"] = {
                        "ListReservoir" : global.mapRelation["ReservoirData"],
                        "ListSaltPlate" : global.mapRelation["SaltPlateData"],
                        "ListWaterTank" : global.mapRelation["WaterTankData"],
                        "ListWaterOut" : global.mapRelation["WaterOutData"],
                        "ListWaterWay" : global.mapRelation["WaterWayData"],
                        "ListValveRank" : global.mapRelation["ValveRankData"]
                        //"ListWaterPath" : global.mapRelation["WaterPathData"],
                    };
                    
                    //console.log(JSON.stringify(SendObj) );

                    var SendData = BU.MakeMessage(SendObj);
                    // 관계정보 로그생성
                    BU.LogFile(JSON.stringify(SendObj));

                    socket.write(SendData);
                    socket.destroy();
                    return;
                }


                //염판과 해주간 연결정보
                else if (DataObj["CMD"] == "GetControl") {
                    var SimpleControlList = self.main.ShortListSimple;
                    var ShortListAutomation = self.main.ShortListAutomation;

                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    SendObj["Map_Version"] = global.mapFileName;
                    
                    SendObj["Contents"] = {
                        "SimpleControlList" : SimpleControlList,
                        "ShortListAutomation" : ShortListAutomation
                    };

                    var SendData = BU.MakeMessage(SendObj);
                    socket.write(SendData);
                    socket.destroy();
                    return;
                }

                
                //날씨 정보 요청
                else if (DataObj["CMD"] == "GetWeatherDevice") {
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;

                    var WeatherDeviceStatus = self.main.WeatherDeviceStatus;
                    if(BU.isEmpty(WeatherDeviceStatus)){
                        SendObj["IsError"] = 1;
                        SendObj["Message"] = "기상관측장비가 등록되지 않았습니다.";
                        SendObj["Contents"] = "";
                        
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    }
                    else {
                        SendObj["IsError"] = 0;
                        SendObj["Message"] = "";
                        SendObj["Contents"] = WeatherDeviceStatus;
                        
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    }
                }

                //모든 상태 조회
                else if (DataObj["CMD"] == "GetAllStats") {
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    
                    var ControlType = self.main.Control.ControlType;
                    var WaterDoorList = self.main.Salt.SaltData["WaterDoorList"];
                    var WaterLevelList = self.main.Salt.SaltData["WaterLevelList"];
                    var PumpList = self.main.Salt.SaltData["PumpList"];
                    var SalinityList = self.main.Salt.SaltData["SalinityList"];
                    var ValveList = self.main.Salt.SaltData["ValveList"];
                    var WeatherDeviceStatus = self.main.WeatherDeviceStatus;


                    var StatusWaterDoorList = new Array();
                    _.each(WaterDoorList, function (WD) {
                        StatusWaterDoorList.push(WD.GetStatus());
                    });

                    var StatusWaterLevelList = new Array();
                    _.each(WaterLevelList, function (WL) {
                        StatusWaterLevelList.push(WL.GetStatus());
                    });
                    
                    var StatusSalinityList = new Array();
                    _.each(SalinityList, function (S) {
                        StatusSalinityList.push(S.GetStatus());
                    });

                    var StatusPumpList = new Array();
                    _.each(PumpList,function(P) {
                        StatusPumpList.push(P.GetStatus());

                    });
                    
                    var StatusValveList = new Array();
                    _.each(ValveList, function (V) {
                        StatusValveList.push(V.GetStatus());

                    });


                    SendObj["Contents"] = {
                        "ControlStatus" : ControlType,
                        "WaterDoorList" : StatusWaterDoorList,
                        "WaterLevelList" : StatusWaterLevelList,
                        "SalinityList" : StatusSalinityList,
                        "PumpList" : StatusPumpList,
                        "ValveList" : StatusValveList,
                        "WeatherDeviceStatus" : WeatherDeviceStatus
                    };
                    //console.log(JSON.stringify(SendObj));
                    //BU.LogFile("SendObj : " + JSON.stringify(SendObj));
                    var SendData = BU.MakeMessage(SendObj);
                    
                    //console.log(SendData);

                    socket.write(SendData);

                    //BU.LogFile("GetAllStats : " + SendData);
                    //BU.LogFile(JSON.stringify(SendObj));
                    // 관계정보 로그생성
                   
                    socket.destroy();
                    return;

                }

                              
                else if ( DataObj["CMD"] == "PumpOn" ) {
                    BU.LogFile( "펌프실행됨 Excute" );
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    //사용자 명령어가 실행중이라면

                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    IsForce = true;
                    
                    var Salt = self.main.Salt;
                    var Pump = Salt.FindObj( DataObj["ID"] );
                    Pump.SetOn( DataObj["IsOn"], function ( err, Door ) {
                        BU.LogFile("응답이 왔습니다.*****************");
                        if ( err ) {
                            SendObj["IsError"] = err["IsError"];
                            SendObj["Message"] = err["Message"];
                            var SendData = BU.MakeMessage( SendObj );
                            socket.write( SendData );
                            socket.destroy();
                            return;
                        }

                        var SendData = BU.MakeMessage( SendObj );
                        socket.write( SendData );
                        socket.destroy();
                        return;
                    });
                }



                else if ( DataObj["CMD"] == "DoorOpen" ) {
                    BU.LogFile("DoorOpen Excute");

                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    //사용자 명령어가 실행중이라면
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    
                    IsForce = true;

                    //var DoorOpen = { "ID" : DataObj["ID"], "IsOpen" : DataObj["IsOpen"] };
                    //var DoorOpen = DataObj["DoorOpen"];//{ "ID": "D1", "IsOpen": true }
                    
                    var Salt = self.main.Salt;

                    var WaterDoor = Salt.FindObj(DataObj["ID"]);
                    WaterDoor.SetOpen(DataObj["IsOpen"],function(err,Door){
                        BU.LogFile("응답이 왔습니다.*****************");

                        if ( err ) {
                            SendObj["IsError"] = err["IsError"];
                            SendObj["Message"] = err["Message"];

                            var SendData = BU.MakeMessage( SendObj );
                            socket.write( SendData );
                            socket.destroy();
                            return;
                        }

                        var SendData = BU.MakeMessage( SendObj );
                        socket.write( SendData );
                        socket.destroy();
                        return;
                    });
                }

                else if (DataObj["CMD"] == "ValveOpen") {
                    BU.LogFile("ValveOpen Excute");
                    
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    
                    IsForce = true;
                    
                    //var ValveOpen = { "ID" : DataObj["ID"], "IsOpen" : DataObj["IsOpen"] };
                    //var ValveOpen = DataObj["ValveOpen"];//{ "ID": "D1", "IsOpen": true }
                    
                    var Salt = self.main.Salt;
                    
                    var Valve = Salt.FindObj(DataObj["ID"]);
                    
                    Valve.SetOpen(DataObj["IsOpen"], function (err, Valve) {
                        BU.LogFile("응답이 왔습니다.*****************");
                        
                        if (err) {
                            SendObj["IsError"] = err["IsError"];
                            SendObj["Message"] = err["Message"];
                            
                            var SendData = BU.MakeMessage(SendObj);
                            console.log(SendData);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        
                        var SendData = BU.MakeMessage(SendObj);
                        console.log(SendData);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    });
                }

                else if (DataObj["CMD"] == "ChangeControlMode") {
                    //BU.CLIS(DataObj, 10);
                    
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = CMD_Key;
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                   
                    var ControlType = DataObj["ControlType"];
                    
                    self.main.Control.emit("ChangeControlMode", ControlType, function (err, Result) {
                        if (err) {
                            SendObj["IsError"] = err.IsError;
                            SendObj["Message"] = err.Message;
                            var SendData = BU.MakeMessage(SendObj);
                            console.log(SendData);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        SendObj["Message"] = Result;
                        console.log("자동/수동 모드 변경 완료");
                        
                        SendObj["IsError"] = 0;
                        SendObj["Message"] = "";
                        
                        var SendData = BU.MakeMessage(SendObj);
                        console.log(SendData);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    });
                }

                else if (DataObj["CMD"] == "PredictWaterLevel") {
                    console.log("PredictWaterLevel");
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = DataObj["CMD_Key"];
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    
                    var SP_ID = DataObj["SP_ID"];
                    var WT_ID = DataObj["WT_ID"];
                    var Time = DataObj["SetTime"];
                    
                    console.log("Time : " + Time);
                    
                    self.main.PredictSalt.emit("PredictSalt", "WaterLevel", SP_ID, WT_ID, Time, function (err, result) {
                        if (err) {
                            console.log("에러도착");
                            console.log(err);
                            SendObj["IsError"] = err["Code"];
                            SendObj["Message"] = err["Meg"];
                            var SendData = BU.MakeMessage(SendObj);
                            BU.CLI(err);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        BU.CLI(result);
                        var Result = result;
                        
                        var SimpleCMD = {};
                        SimpleCMD["Src"] = WT_ID;
                        SimpleCMD["Des"] = SP_ID;
                        SimpleCMD["SetWaterLevel"] = Result["Now_Myheight"];
                        SimpleCMD["ControlType"] = "SimpleCMD";
                        
                        self.main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
                            if (err) {
                                console.log("OrderControl 에러도착");
                                console.log(err);
                                SendObj["IsError"] = err["IsError"];
                                SendObj["Message"] = err["Message"];
                                
                                var SendData = BU.MakeMessage(SendObj);
                                console.log(SendData);
                                socket.write(SendData);
                                socket.destroy();
                                return;
                            }
                            
                            console.log("!@!%!@$");
                            
                            var ResultObj = {};
                            ResultObj["Src"] = result["Src"];
                            ResultObj["Des"] = result["Des"];
                            ResultObj["WaterLevel"] = Result["Now_Myheight"];
                            ResultObj["Salinity"] = Result["Mix_WaterRate_Result"];
                            ResultObj["TargetDate"] = Result["set_target_Date"];
                            
                            SendObj["Contents"] = ResultObj;
                            
                            console.log("!!!!!!!!!!!!!");
                            BU.CLI(SendObj);
                            var SendData = BU.MakeMessage(SendObj);
                            console.log(SendData);
                            socket.write(SendData);
                            socket.destroy();
                            return;

                        });

                    });
                }

                else if (DataObj["CMD"] == "PredictTime") {
                    var CMD_Key = DataObj["CMD_Key"];
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = DataObj["CMD_Key"];
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    
                    var SP_ID = DataObj["SP_ID"];
                    var WT_ID = DataObj["WT_ID"];
                    var WaterLevel = DataObj["SetWaterLevel"];
                    
                    console.log(" PredictTime PredictTime " + WaterLevel);
                    
                    self.main.PredictSalt.emit("PredictSalt", "Time", SP_ID, WT_ID, WaterLevel, function (err, result) {
                        if (err) {
                            //console.log("에러도착 11111111");
                            //console.log(err);
                            SendObj["IsError"] = err["Code"];
                            SendObj["Message"] = err["Meg"];
                            var SendData = BU.MakeMessage(SendObj);
                            BU.CLI(err);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        
                        var PredictTimeResult = result;

                        console.log("기상값 제대로 도착 11111111");
                        //BU.CLI(result);
                        //var PredictResult = PredictResult;
                        //console.log("console.log(Result)");
                        //console.log(Result);
                        var SimpleCMD = {};
                        SimpleCMD["Src"] = WT_ID;
                        SimpleCMD["Des"] = SP_ID;
                        SimpleCMD["SetWaterLevel"] = WaterLevel;
                        SimpleCMD["ControlType"] = "SimpleCMD";
                        
                        self.main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
                            if (err) {
                                console.log("OrderControl 에러도착");
                                console.log(err);
                                SendObj["IsError"] = err["IsError"];
                                SendObj["Message"] = err["Message"];
                                
                                var SendData = BU.MakeMessage(SendObj);
                                console.log(SendData);
                                socket.write(SendData);
                                socket.destroy();
                                return;
                            }
                            
                            //BU.CLI(Result);
                            
                            console.log("SimpleCMD[" + SimpleCMD["SetWaterLevel"]);

                            var ResultObj = {};
                            ResultObj["Src"] = result["Src"];
                            ResultObj["Des"] = result["Des"];
                            ResultObj["WaterLevel"] = SimpleCMD["SetWaterLevel"];
                            ResultObj["Salinity"] = PredictTimeResult["Mix_WaterRate_Result"];
                            ResultObj["TargetDate"] = PredictTimeResult["set_target_Date"];
                            
                            SendObj["Contents"] = ResultObj;
                            
                            var SendData = BU.MakeMessage(SendObj);
                            console.log(SendData);
                            socket.write(SendData);
                            socket.destroy();
                            return;

                        });

                    });
                }

                else if (DataObj["CMD"] == "OrderControl") {
                    SendObj["CMD"] = DataObj["CMD"];
                    SendObj["CMD_Key"] = DataObj["CMD_Key"];
                    SendObj["IsError"] = 0;
                    SendObj["Message"] = "";
                    SendObj["Contents"] = {};
                    
                    var SimpleCMD = {};
                    SimpleCMD["Src"] = DataObj["Src"];
                    SimpleCMD["Des"] = DataObj["Des"];
                    SimpleCMD["SetWaterLevel"] = DataObj["SetWaterLevel"];
                    SimpleCMD["ControlType"] = "SimpleCMD";
                    
                    self.main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
                        if (err) {
                            console.log("OrderControl 에러도착");
                            console.log(err);
                            SendObj["IsError"] = err["IsError"];
                            SendObj["Message"] = err["Message"];
                            
                            var SendData = BU.MakeMessage(SendObj);
                            console.log(SendData);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        
                        var ResultObj = {};
                        ResultObj["Src"] = result["Src"];
                        ResultObj["Des"] = result["Des"];
                        SendObj["Contents"] = ResultObj;
                       
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    });
                }



                //수문 자동제어
                else if (DataObj["CMD"] == "WaterGo") {
                    //사용자 명령어가 실행중이라면
                    if (self.IsUserCMD) {
                        SendObj["IsError"] = 1;
                        SendObj["Message"] = "사용자 명령어가 실행 중 입니다.";
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    }

                    //사용자 명령이 실행을 한다고 모두에게 알려줌
                    self.IsUserCMD = true;
                    var PushServer = self.main.PushServer;
                    
                    //모든 사용자에게 메세지를 보내서 나 지금 바쁘다고 말해줌
                    var UserCMDIsBusy = {};
                    UserCMDIsBusy["CMD"] = "UseDevice";
                    UserCMDIsBusy["UserCMDIsBusy"] = true;
                    var PushServer = self.main.PushServer;
                    PushServer.emit("SendAllClient", UserCMDIsBusy);

                    var SaltPlate = DataObj["SaltPlate"];
                    var Des = DataObj["Des"];

                    var IsForce = DataObj["IsForce"];


                    var Salt = self.main.Salt;

                    BU.LogFile("WaterGoExecute");

                    Salt.WaterGo(SaltPlate, Des, IsForce, function (err) {
                        //모든 사용자에게 나 지금 끝났다라고 알려줌
                        self.IsUserCMD = false;
                        var UserCMDIsBusy = {};
                        UserCMDIsBusy["CMD"] = "UseDevice";
                        UserCMDIsBusy["UserCMDIsBusy"] = false;
                        var PushServer = self.main.PushServer;
                        PushServer.emit("SendAllClient", UserCMDIsBusy);

                        if (err) {
                            SendObj["IsError"] = err["IsError"];
                            SendObj["Message"] = err["Message"];
                            SendObj["ErrorObj"] = err["ErrorObj"];
                            var SendData = BU.MakeMessage(SendObj);
                            socket.write(SendData);
                            socket.destroy();
                            return;
                        }
                        var SendData = BU.MakeMessage(SendObj);
                        socket.write(SendData);
                        socket.destroy();
                        return;
                    });
                }




                else
                {
                    SendObj["IsError"] = -1;
                    SendObj["Message"] = "알수 없는 명령어 입니다.";
                    var SendData = BU.MakeMessage(SendObj);
                    socket.write(SendData);
                    socket.destroy();
                    return;
                }


            });
            socket.on("data", function (data) {
                
                socket.Smbuffer.emit("AddBuffer", data);
                
            });
            socket.on("close", function (data) {
                BU.LogFile("CMDServer.js : 소켓 연결이 끊어졌습니다.")
                this.destroy();
                //LogFile("외부에서 접속을 끊였습니다.");

            });
            socket.on("error", function (data) {

                //만약에 보낼 메세지가 


                BU.LogFile("CMDServer.js : 소켓에러가 발생했습니다.");
                this.destroy();
            });


        });
        Server.listen(global.ProgramInfo.CMDPort);
        BU.LogFile("CMDServer.js : 소켓서버를 실행 했습니다. port : "+ global.ProgramInfo.CMDPort +"");
    });

    this.on("CMD_Test", function (sendObj, isNotGCM) {
        //console.log(sendObj);

    });

}
util.inherits(CMDServer, events.EventEmitter);
exports.CMDServer = CMDServer;
