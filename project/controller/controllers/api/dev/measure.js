const _ = require('underscore');

module.exports = function (app) {
  var router = require("express").Router();


  // router.use(function (req, res, next) {
  //   console.log('#######')
  //   // req.locals.main = global.main;
  //   // req.locals.resObj = {
  //   //   CMD: '',
  //   //   CMD_Key: '',
  //   //   IsError: 0,
  //   //   Message: '',
  //   //   Contents: ''
  //   // }


  //   next();
  // });

  router.get('/', (req, res) => {
    // BU.CLI('@@')
    res.send(req.originalUrl)
  })

  router.get("/getAllData", function (req, res) {
      let main = global.main;

      var returnObj = {};
      returnObj["CMD"] = "GetAllStats";
      returnObj["CMD_Key"] = "";
      returnObj["IsError"] = 0;
      returnObj["Message"] = "";
      returnObj["Contents"] = ""

      var ControlStatus = main.Control.ControlType;
      var WaterDoorList = main.Salt.SaltData["WaterDoorList"];
      var WaterLevelList = main.Salt.SaltData["WaterLevelList"];
      var PumpList = main.Salt.SaltData["PumpList"];
      var SalinityList = main.Salt.SaltData["SalinityList"];
      var ValveList = main.Salt.SaltData["ValveList"];

      // var WeatherDeviceStatus = main.WeatherDeviceStatus;
      var WeatherDeviceStatus = {
      "RainRate": "0.0", // 1시간 예상 강우량 
      "Temperature": "23.8", // 섭씨
      "Humidity": "43",
      "WindDirection": "1",
      "WindSpeed": 0, // 지난 10분간 평균 풍속
      "SolarRadiation": "0", // 일사량 
      "UpdateDate": "2015-12-24 17:43:06" // 최종 기상장비 업데이트 된 시간
    }



    //var WeatherCastStatus = main.WeatherCastStatus;

    //BU.CLI(WeatherDeviceStatus);
    var ControlList = main.Control.AutomationMode.GetControlList();
    //ControlList["ProgressCMD"] = main.Control.AutomationMode.ControlProgressList;
    //ControlList["CompleteCMD"] = main.Control.AutomationMode.ControlCompleteList;
    //ControlList["DeletingCMD"] = main.Control.AutomationMode.DeletingCMD;



    var StatusWaterDoorList = new Array(); _.each(WaterDoorList, function (WD) {
      StatusWaterDoorList.push(WD.GetStatus());
    });

    var StatusWaterLevelList = new Array(); _.each(WaterLevelList, function (WL) {
      StatusWaterLevelList.push(WL.GetStatus());
    });

    var StatusSalinityList = new Array(); _.each(SalinityList, function (S) {
      StatusSalinityList.push(S.GetStatus());
    });

    var StatusPumpList = new Array(); _.each(PumpList, function (P) {
      StatusPumpList.push(P.GetStatus());

    });

    var StatusValveList = new Array(); _.each(ValveList, function (V) {
      StatusValveList.push(V.GetStatus());

    });

    returnObj["Contents"] = {
      "ControlStatus": ControlStatus,
      "WaterDoorList": StatusWaterDoorList,
      "WaterLevelList": StatusWaterLevelList,
      "SalinityList": StatusSalinityList,
      "PumpList": StatusPumpList,
      "ValveList": StatusValveList,
      "WeatherDeviceStatus": WeatherDeviceStatus,
      "ControlList": ControlList
      //"WeatherCastStatus" : WeatherCastStatus
    };

    res.send(returnObj);


  });

return router;


}