var events = require('events');
var util = require('util');
var _ = require("underscore");

var _PredictAlgorithm = require("./predictAlgorithm.js");

var PredictSalt = function (main) {
    events.EventEmitter.call(this);
    var self = this;
    self.Clients = new Array();
    
    self.PredictAlgorithm = new _PredictAlgorithm.Algorithm();
 
    self.on("PredictSalt", function (TypeCode, SP_ID, WT_ID, Value, CallBack) {
        //BU.log("PredictSalt");
        var Salt = main.Salt;
        var SP_Obj = Salt.FindObj(SP_ID);
        var WT_Obj = Salt.FindObj(WT_ID);
        var WeatherDevice = main.WeatherDeviceStatus;
        var WeatherCast = main.WeatherCastStatus;
        //BU.CLI(WeatherCast);
        var err = {};

        if (BU.isEmpty(SP_Obj) || BU.isEmpty(WT_Obj)) {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "해당 ID에 해당하는 곳은 없습니다.";
            CallBack(err);
            return;
        }
        else if (BU.isEmpty(WeatherDevice)) {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "기상관측 데이터가 없습니다.";
            CallBack(err);
            return;
        }
        else if (BU.isEmpty(WeatherCast)) {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "기상예보 데이터가 없습니다.";
            CallBack(err);
            return;
        }

        var SP_Status = SP_Obj.GetStatus();
        var WT_Status = WT_Obj.GetStatus();

        if (SP_Status["WaterLevel"] === "" || SP_Status["Salinity"] === "") {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "해당 염전에 대한 데이터가 없습니다.";
            CallBack(err);
            //CallBack("해당 염전에 대한 데이터가 없습니다.", "");
            return;
        }
        else if (WT_Status["WaterLevel"] === null || WT_Status["Salinity"] === "") {
            err = {};
            err["Code"] = "1";
            err["Meg"] = "해당 해주에 대한 데이터가 없습니다.";
            CallBack(err);
            //CallBack("해당 해주에 대한 데이터가 없습니다.", "");
            return;
        }
        
        
        var SaltpondInfo = {
            "ID" : SP_Status["ID"],
            "NowSalinity" : SP_Status["Salinity"],
            "NowWaterLevel" : SP_Status["WaterLevel"],
            "MaxWaterLevel" : SP_Status["MaxWaterLevel"]
        }
        
        var UserInfo = {
            "SetSalinity" : WT_Status["Salinity"],
            // "SetTime" : "2015-08-09 18:30:00",
            "SetTime" : Value,
            "SetWaterLevel" : Value
        }

        
        if (TypeCode == "Time") {
            BU.log("PredictAlgorithm.PredictTime");
            self.PredictAlgorithm.PredictTime(SaltpondInfo, UserInfo, WeatherDevice, WeatherCast, CallBack);
        }

        else if (TypeCode == "WaterLevel") {
            BU.log("PredictAlgorithm.PredictWaterLevel");
            self.PredictAlgorithm.PredictWaterLevel(SaltpondInfo, UserInfo, WeatherDevice, WeatherCast, CallBack);
        }

    });


    var GetDateByText = function (DateData) {
        var strDate = DateData.toString();
        //BU.log("strDate : " + strDate);
        var years = strDate.substring(0, 4);
        var month = strDate.substring(4, 6);
        var day = strDate.substring(6, 8);
        var hours = strDate.substring(8, 10);
        var min = strDate.substring(10, 12);
        
        var date = new Date(years, month - 1, day, hours, min, 0);
        
        return date;
    }
    
    var GetTextByDate = function (DateData) {
        var now = DateData;
        
        var year = "" + now.getFullYear();
        var month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        var day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        var hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        var minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        
        return year + "" + month + "" + day + "" + hour + "" + minute;
    }


}
util.inherits(PredictSalt, events.EventEmitter);
exports.PredictSalt = PredictSalt;