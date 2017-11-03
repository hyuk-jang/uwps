var net = require("net");
const EventEmitter = require('events');
var _ = require("underscore");


class CmdServer extends EventEmitter {
  constructor(controllerInfo, mapObj) {
    super();
    this.controllerInfo = controllerInfo;
    this.mapObj = mapObj;

  }


  createServer() {
    // Socket Server 생성. 최상단 this를 가리키기 위하여 => 함수 사용
    var socketServer = net.createServer((socket) => {
      // BU.CLI("New CMD Client Try Connect");

      // 접속한 Socket에 Buffer 처리 붙임.
      socket.smbuffer = require("../util/sm-buffer")();

      // 소캣
      socket.smbuffer.on("endBuffer", (resBufferData) => {
        this._handlingSocketData(resBufferData, function (err, result) {
          socket.emit("resData", result, true);
        });
      });

      socket.smbuffer.on("error", function (Message) {
        socket.emit("close");
      });

      // Client에 응답
      socket.on("resData", function (sendObj, isDestroy) {
        var resObj = BU.makeMessage(sendObj);
        socket.write(resObj, "utf-8", function () {
          if (isDestroy) {
            socket.emit("close");
          }
        });
      });

      socket.on("data", function (data) {
        // BU.CLI("CMD Server in Data : " + data.toString());
        socket.smbuffer.emit("addBuffer", data);
      });

      socket.on("close", function (msg) {
        // BU.CLIS("PushServer.js : 소켓 연결이 끊어졌습니다.", msg)
        socket.destroy();
      });

      socket.on("error", function (err) {
        BU.CLI("CMD : 소켓에러가 발생했습니다.", err);
        socket.emit("close");
      });
    });
    socketServer.listen(this.controllerInfo.cmd_port);
    BU.log("CmdServer.js : 소켓서버를 실행 했습니다. port : ", this.controllerInfo.cmd_port)
  }

  _handlingSocketData(socketData, callback) {
    // BU.CLI("_handlingSocketData", socketData)
    var receiveObj = {};

    var responseObj = {
      CMD: "none",
      IsError: 0,
      Message: ""
    };

    try {
      // BU.CLI(socketData)
      receiveObj = JSON.parse(socketData);

      // if (receiveObj.SessionID == null) {
      //   responseObj.IsError = 1;
      //   responseObj.Message = "잘못된 접근입니다.";
      //   return callback(null, responseObj);
      // } else {
      //   var pushServerClients = global.pushServer.clients;
      //   BU.CLI(pushServerClients)
      //   var findClients = _.where(pushServerClients, {
      //     "sessionId": receiveObj.SessionID
      //   });
      //   BU.CLI(findClients)
      //   //&& setInfo.isWifiHotSpotMode == false
      //   if (findClients.length == 0) {
      //     responseObj.IsError = 401;
      //     responseObj.Message = "세션이 만료 되었습니다.";
      //     BU.CLI('@@@@@@')
      //     return callback(null, responseObj);
      //     // return callback(null, responseObj);
      //   }
      // }
    } catch (ex) {
      responseObj.IsError = 1;
      responseObj.Message = ex;
      return callback(null, responseObj);
    }

    //GetMap  맵 데이터 요청 
    if (receiveObj.CMD == "GetMap") {
      // BU.CLI('@!#!@#####@')
      // console.log(mapObj)
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.Map_Version = mapObj.mapFileName;
      responseObj.Contents = mapObj.mapImg;
      // BU.CLI(mapObj)
      // BU.CLI(responseObj)

      return callback(null, responseObj);
    }


    //차일드 관계 정보 요청
    else if (receiveObj.CMD == "GetRelation") {
      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      responseObj.Map_Version = mapObj.mapFileName;

      responseObj.Contents = {
        "ListReservoir": mapObj.mapRelation.ReservoirData,
        "ListSaltPlate": mapObj.mapRelation.SaltPlateData,
        "ListWaterTank": mapObj.mapRelation.WaterTankData,
        "ListWaterOut": mapObj.mapRelation.WaterOutData,
        "ListWaterWay": mapObj.mapRelation.WaterWayData,
        "ListValveRank": mapObj.mapRelation.ValveRankData
        //"ListWaterPath" : mapObj.mapRelation.WaterPathData,
      };

      //zlog(JSON.stringify(responseObj) );
      BU.CLI(responseObj)
      return callback(null, responseObj);
    }


    //염판과 해주간 연결정보
    else if (receiveObj.CMD == "GetControl") {
      var SimpleControlList = main.ShortListSimple;
      var ShortListAutomation = main.ShortListAutomation;

      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      responseObj.Map_Version = mapObj.mapFileName;

      responseObj.Contents = {
        "SimpleControlList": SimpleControlList,
        "ShortListAutomation": ShortListAutomation
      };
      BU.CLI(responseObj)
      return callback(null, responseObj);
    }


    ////날씨 정보 요청
    //else if (receiveObj.CMD == "GetWeatherDevice") {
    //    responseObj.CMD = receiveObj.CMD;
    //    responseObj.CMD_Key = CMD_Key;

    //    var WeatherDeviceStatus = main.WeatherDeviceStatus;
    //    if(BU.isEmpty(WeatherDeviceStatus)){
    //        responseObj.IsError = 1;
    //        responseObj.Message = "기상관측장비가 등록되지 않았습니다.";
    //        responseObj.Contents = "";

    //        var SendData = BU.makeMessage(responseObj);
    //        socket.write(SendData);
    //        socket.destroy();
    //        return;
    //    }
    //    else {
    //        responseObj.IsError = 0;
    //        responseObj.Message = "";
    //        responseObj.Contents = WeatherDeviceStatus;

    //        var SendData = BU.makeMessage(responseObj);
    //        socket.write(SendData);
    //        socket.destroy();
    //        return;
    //    }
    //}

    //모든 상태 조회
    else if (receiveObj.CMD == "GetAllStats") {
      // BU.CLI("GetAllStats")
      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;

      var ControlType = main.Control.ControlType;
      var WaterDoorList = main.Salt.SaltData.WaterDoorList;
      var WaterLevelList = main.Salt.SaltData.WaterLevelList;
      var PumpList = main.Salt.SaltData.PumpList;
      var SalinityList = main.Salt.SaltData.SalinityList;
      var ValveList = main.Salt.SaltData.ValveList;
      // BU.CLI(main.measureWeather.getterWeatherDevice.weatherDeviceData)
      // var WeatherDeviceStatus = global.index.worker.measureWeather.getterWeatherDevice.weatherDeviceData;
      var WeatherDeviceStatus = {
        "RainRate": "0.0", // 1시간 예상 강우량 
        "Temperature": "23.8", // 섭씨
        "Humidity": "43",
        "WindDirection": "1",
        "WindSpeed": 0, // 지난 10분간 평균 풍속
        "SolarRadiation": "0", // 일사량 
        "UpdateDate": "2015-12-24 17:43:06" // 최종 기상장비 업데이트 된 시간
      }



      var ControlList = main.Control.AutomationMode.GetControlList();


      var StatusWaterDoorList = [];
      _.each(WaterDoorList, function (WD) {
        StatusWaterDoorList.push(WD.GetStatus());
      });

      var StatusWaterLevelList = [];
      _.each(WaterLevelList, function (WL) {
        StatusWaterLevelList.push(WL.GetStatus());
      });

      var StatusSalinityList = [];
      _.each(SalinityList, function (S) {
        StatusSalinityList.push(S.GetStatus());
      });

      var StatusPumpList = [];
      _.each(PumpList, function (P) {
        StatusPumpList.push(P.GetStatus());

      });

      var StatusValveList = [];
      _.each(ValveList, function (V) {
        StatusValveList.push(V.GetStatus());

      });


      responseObj.Contents = {
        "ControlStatus": ControlType,
        "WaterDoorList": StatusWaterDoorList,
        "WaterLevelList": StatusWaterLevelList,
        "SalinityList": StatusSalinityList,
        "PumpList": StatusPumpList,
        "ValveList": StatusValveList,
        "WeatherDeviceStatus": WeatherDeviceStatus,
        "ControlList": ControlList
      };
      // BU.CLI(responseObj)
      //var SendData = BU.makeMessage(SendObj);
      //socket.write(SendData);
      //socket.destroy();
      BU.CLI(responseObj)
      return callback(null, responseObj);

    } else if (receiveObj.CMD == "PumpOn") {
      //BU.logFile( "펌프실행됨 Excute" );
      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      //사용자 명령어가 실행중이라면

      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      if (main.Control.IsSettingControl == "0") {
        responseObj.IsError = 1;
        responseObj.Message = "장치 상태검색이 완료되지 않았습니다.\n잠시 후 다시 시도해 주십시오.";
        return callback(null, responseObj);
      }

      var Salt = main.Salt;
      var Pump = Salt.FindObj(receiveObj.ID);
      Pump.SetOn(receiveObj.IsOn, function (err, Door) {
        //BU.logFile("응답이 왔습니다.*****************");
        if (err) {
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;
          return callback(null, responseObj);
        }

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "DoorOpen") {
      //BU.logFile("DoorOpen Excute");

      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      //사용자 명령어가 실행중이라면
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      if (main.Control.IsSettingControl == "0") {
        responseObj.IsError = 1;
        responseObj.Message = "장치 상태검색이 완료되지 않았습니다.\n잠시 후 다시 시도해 주십시오.";
        return callback(null, responseObj);
      }

      //var DoorOpen = { "ID" : receiveObj.ID, "IsOpen" : receiveObj.IsOpen };
      //var DoorOpen = receiveObj.DoorOpen;//{ "ID": "D1", "IsOpen": true }

      var Salt = main.Salt;

      var WaterDoor = Salt.FindObj(receiveObj.ID);
      WaterDoor.SetOpen(receiveObj.IsOpen, function (err, Door) {
        //BU.logFile("응답이 왔습니다.*****************");
        if (err) {
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;

          return callback(null, responseObj);
        }

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "ValveOpen") {
      //BU.logFile("ValveOpen Excute");

      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      if (main.Control.IsSettingControl == "0") {
        responseObj.IsError = 1;
        responseObj.Message = "장치 상태검색이 완료되지 않았습니다.\n잠시 후 다시 시도해 주십시오.";
        return callback(null, responseObj);
      }

      //var ValveOpen = { "ID" : receiveObj.ID, "IsOpen" : receiveObj.IsOpen };
      //var ValveOpen = receiveObj.ValveOpen;//{ "ID": "D1", "IsOpen": true }

      var Salt = main.Salt;

      var Valve = Salt.FindObj(receiveObj.ID);

      Valve.SetOpen(receiveObj.IsOpen, function (err, Valve) {
        //BU.logFile("응답이 왔습니다.*****************");

        if (err) {
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;

          return callback(null, responseObj);
        }

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "ChangeControlMode") {
      BU.log("ChangeControlMode");
      //BU.CLIS(receiveObj);

      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      var ControlType = receiveObj.ControlType;

      main.Control.emit("ChangeControlMode", ControlType, function (err, Result) {
        if (err) {
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;
          return callback(null, responseObj);
        }
        responseObj.Message = Result;
        //BU.log("자동/수동 모드 변경 완료");

        responseObj.IsError = 0;
        responseObj.Message = "";

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "PredictWaterLevel") {
      //BU.log("PredictWaterLevel");
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      var SP_ID = receiveObj.SP_ID;
      var WT_ID = receiveObj.WT_ID;
      var Time = receiveObj.SetTime;

      //BU.log("Time : " + Time);

      main.PredictSalt.emit("PredictSalt", "WaterLevel", SP_ID, WT_ID, Time, function (err, PredictResult) {
        if (err) {
          BU.log("에러도착 ㅁㄴㅇㄴㅁㅇ");
          BU.log(err);
          BU.log(PredictResult);
          responseObj.IsError = err.Code;
          responseObj.Message = err.Meg;
          return callback(null, responseObj);
        }
        //BU.log("PredictSalt PredictSalt");
        //BU.CLI(PredictResult);
        var PredictWaterResult = PredictResult;

        var SimpleCMD = {};
        SimpleCMD.Src = WT_ID;
        SimpleCMD.Des = SP_ID;
        SimpleCMD.SetWaterLevel = PredictWaterResult.Now_Myheight.toFixed(1);
        SimpleCMD.ControlType = "SimpleCMD";

        main.Control.emit("OrderControl", SimpleCMD, function (err, OrderResult) {
          if (err) {
            BU.log("OrderControl 에러도착");
            //BU.log(err);
            responseObj.IsError = err.IsError;
            responseObj.Message = err.Message;

            return callback(null, responseObj);
          }

          //BU.log("2차 기상 제어 값 도착")
          //BU.CLI(OrderResult);

          //BU.log("!@!%!@$");

          var ResultObj = {};
          ResultObj.Src = WT_ID;
          ResultObj.Des = SP_ID;
          ResultObj.WaterLevel = PredictWaterResult.Now_Myheight.toFixed(1);
          ResultObj.Salinity = PredictWaterResult.Mix_WaterRate_Result.toFixed(1);
          ResultObj.TargetDate = PredictWaterResult.set_target_Date;

          responseObj.Contents = ResultObj;

          //BU.log("!!!!!!!!!!!!!");
          //BU.CLI(responseObj);
          return callback(null, responseObj);

        });

      });
    } else if (receiveObj.CMD == "PredictTime") {
      var CMD_Key = receiveObj.CMD_Key;
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      var SP_ID = receiveObj.SP_ID;
      var WT_ID = receiveObj.WT_ID;
      var WaterLevel = receiveObj.SetWaterLevel;

      //BU.log(" PredictTime PredictTime " + WaterLevel);

      main.PredictSalt.emit("PredictSalt", "Time", SP_ID, WT_ID, WaterLevel, function (err, PredictResult) {
        if (err) {
          //BU.log("에러도착 11111111");
          //BU.log(err);
          responseObj.IsError = err.Code;
          responseObj.Message = err.Meg;
          return callback(null, responseObj);
        }

        var PredictTimeResult = PredictResult;

        //BU.log("기상값 제대로 도착 11111111");
        //BU.CLI(PredictResult);
        //var PredictResult = PredictResult;
        //BU.log("BU.log(Result)");
        //BU.log(Result);
        var SimpleCMD = {};
        SimpleCMD.Src = WT_ID;
        SimpleCMD.Des = SP_ID;
        SimpleCMD.SetWaterLevel = WaterLevel;
        SimpleCMD.ControlType = "SimpleCMD";

        main.Control.emit("OrderControl", SimpleCMD, function (err, OrderResult) {
          if (err) {
            BU.log("OrderControl 에러도착");
            BU.log(err);
            responseObj.IsError = err.IsError;
            responseObj.Message = err.Message;

            return callback(null, responseObj);
          }

          //BU.log("2차 기상 제어 값 도착")
          //BU.CLI(OrderResult);

          BU.log("SimpleCMD." + SimpleCMD.SetWaterLevel);

          var ResultObj = {};
          ResultObj.Src = WT_ID;
          ResultObj.Des = SP_ID;
          ResultObj.WaterLevel = WaterLevel;
          ResultObj.Salinity = PredictTimeResult.Mix_WaterRate_Result;
          ResultObj.TargetDate = PredictTimeResult.set_target_Date;

          responseObj.Contents = ResultObj;

          return callback(null, responseObj);

        });

      });
    } else if (receiveObj.CMD == "OrderControl") {
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      var SimpleCMD = {};
      SimpleCMD.Src = receiveObj.Src;
      SimpleCMD.Des = receiveObj.Des;
      SimpleCMD.SetWaterLevel = receiveObj.SetWaterLevel;
      SimpleCMD.ControlType = "SimpleCMD";

      main.Control.emit("OrderControl", SimpleCMD, function (err, result) {
        if (err) {
          BU.log("OrderControl 에러도착");
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;

          return callback(null, responseObj);
        }

        //var SpliteProgressID = result.ID.split("→");
        //var Src = SpliteProgressID[0];
        //var Des = SpliteProgressID[1];


        var ResultObj = {};
        ResultObj.Src = SimpleCMD.Src;
        ResultObj.Des = SimpleCMD.Des;
        responseObj.Contents = ResultObj;

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "CancelControl") {
      BU.log("CancelControl")
      BU.CLI(receiveObj);
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};

      var SimpleCMD = {};
      SimpleCMD.Src = receiveObj.Src;
      SimpleCMD.Des = receiveObj.Des;
      SimpleCMD.ControlType = "SimpleCMD";

      main.Control.emit("CancelControl", SimpleCMD, function (err, result) {
        if (err) {
          BU.log("OrderControl 에러도착");
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;

          return callback(null, responseObj);
        }

        var ResultObj = {};
        ResultObj.Src = SimpleCMD.Src;
        ResultObj.Des = SimpleCMD.Des;
        responseObj.Contents = ResultObj;

        return callback(null, responseObj);
      });
    } else if (receiveObj.CMD == "RecordSaltHarvest") {
      BU.log("RecordSaltHarvest")
      BU.CLI(receiveObj);
      responseObj.CMD = receiveObj.CMD;
      responseObj.CMD_Key = receiveObj.CMD_Key;
      responseObj.IsError = 0;
      responseObj.Message = "";
      responseObj.Contents = {};



      var RecordType = receiveObj.RecordType; // Take : 채염, Storage : 보관, Release : 출고
      var SaltPondID = receiveObj.SaltPondID;
      var WriteDate = receiveObj.WriteDate;

      if (RecordType === "") {
        responseObj.IsError = 1;
        responseObj.Message = "기록 형식을 선택하세요.";
        return callback(null, responseObj);
      }

      if (!(RecordType === "Take" || RecordType === "Storage" || RecordType === "Release")) {
        responseObj.IsError = 1;
        responseObj.Message = "기록 형식 형식이 다릅니다.\n확인 후 재시도 해주세요.";
        return callback(null, responseObj);;
      }

      if (SaltPondID === "" || WriteDate === "") {
        responseObj.IsError = 1;
        responseObj.Message = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";

        return callback(null, responseObj);
      }

      var FindObj = main.Salt.FindObj(SaltPondID);
      if (BU.isEmpty(FindObj)) {
        responseObj.IsError = 1;
        responseObj.Message = "해당 염판의 데이터를 찾을 수 없습니다.";
        return callback(null, responseObj);
      }

      if (FindObj.PlateType.indexOf("Crystallizing") === -1) {
        responseObj.IsError = 1;
        responseObj.Message = "해당 염판 ID는 결정지가 아닙니다.";
        return callback(null, responseObj);
      }

      WriteDate = BU.convertDateFormat(WriteDate);

      if (WriteDate === "") {
        responseObj.IsError = 1;
        responseObj.Message = "날짜 형식이 다릅니다.";
        BU.log(responseObj);
        return callback(null, responseObj);
      }



      if (RecordType === "Take") {
        main.BI.GetSaltHarvest(SaltPondID, function (error, result) {
          if (error) {
            BU.log("데이터를 로드하지 못했습니다.");
            responseObj.IsError = 1;
            responseObj.Message = "데이터를 로드하지 못했습니다.";
            return callback(null, responseObj);
          }
          var LastedDate = result[0];
          var PrevDate = new Date(LastedDate.writedate);
          var NextDate = new Date(WriteDate);
          if (PrevDate.getTime() >= NextDate.getTime()) {
            responseObj.IsError = 1;
            responseObj.Message = "해당 결정지의 이전 채염기록보다 느립니다.\n이전기록 : " + BU.convertDateToText(LastedDate.writedate);
            return callback(null, responseObj);
          }

          main.BI.InsertSaltHarvest(FindObj.ID, WriteDate, function (error, result) {
            if (error) {
              BU.log("신규 데이터를 입력하는데 실패하였습니다.");
              responseObj.IsError = 1;
              responseObj.Message = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";
              return callback(null, responseObj);
            }
            responseObj.Message = "입력 완료";

            return callback(null, responseObj);
          });
        });
      } else {
        main.BI.InsertSaltHarvestDetail(RecordType, FindObj.ID, WriteDate, function (error, result) {
          if (error) {
            BU.log("InsertSaltHarvestDetail 신규 데이터를 입력하는데 실패하였습니다.");
            responseObj.IsError = 1;
            responseObj.Message = "데이터 입력 형식이 다릅니다.\n확인 후 재시도 해주세요.";
            return callback(null, responseObj);
          }
          responseObj.Message = "입력 완료";

          return callback(null, responseObj);
        });
      }
    }

    //수문 자동제어
    else if (receiveObj.CMD == "WaterGo") {
      //사용자 명령어가 실행중이라면
      if (self.IsUserCMD) {
        responseObj.IsError = 1;
        responseObj.Message = "사용자 명령어가 실행 중 입니다.";
        return callback(null, responseObj);
      }

      //사용자 명령이 실행을 한다고 모두에게 알려줌
      self.IsUserCMD = true;
      var PushServer = main.PushServer;

      //모든 사용자에게 메세지를 보내서 나 지금 바쁘다고 말해줌
      var UserCMDIsBusy = {};
      UserCMDIsBusy.CMD = "UseDevice";
      UserCMDIsBusy.UserCMDIsBusy = true;
      var PushServer = main.PushServer;
      PushServer.emit("sendAllClient", UserCMDIsBusy);

      var SaltPlate = receiveObj.SaltPlate;
      var Des = receiveObj.Des;

      var IsForce = receiveObj.IsForce;


      var Salt = main.Salt;

      //BU.logFile("WaterGoExecute");

      Salt.WaterGo(SaltPlate, Des, IsForce, function (err) {
        //모든 사용자에게 나 지금 끝났다라고 알려줌
        self.IsUserCMD = false;
        var UserCMDIsBusy = {};
        UserCMDIsBusy.CMD = "UseDevice";
        UserCMDIsBusy.UserCMDIsBusy = false;
        var PushServer = main.PushServer;
        PushServer.emit("sendAllClient", UserCMDIsBusy);

        if (err) {
          responseObj.IsError = err.IsError;
          responseObj.Message = err.Message;
          responseObj.ErrorObj = err.ErrorObj;
          return callback(null, responseObj);
        }
        return callback(null, responseObj);
      });
    } else {
      responseObj.IsError = -1;
      responseObj.Message = "알수 없는 명령어 입니다.";
      return callback(null, responseObj);
    }

  }


}


module.exports = function (controllerInfo, mapObj) {
  var cmdServer = new CmdServer(controllerInfo, mapObj);
  // cmdServer.createServer();

  return cmdServer;
}