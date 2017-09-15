var _ = require('underscore');
// var BU = require("../util/baseUtil.js");

//페이지 설정 하는 곳입니다.
exports.setAddr = function (app, routes) {
    var keys = _.keys(routes);
    //BU.log(keys)
    _.each(keys, function (key) {
        app.all(key, [routes[key]]);
        BU.log("Router Url:" + key);
    });
}


///********* 페이지 라우터 ****/
////페이지 셋팅
//app.all('/', routes["/"]);
////GCM 등록
//app.all('/RegGCM', routes["/RegGCM"]);
////GCM 삭제
//app.all('/DelGCM', routes["/DelGCM"]);
//app.all('/Login', routes["/Login"]);
//app.all('/OpenDoor', routes["/OpenDoor"]);
//app.all('/GetAllData', routes["/GetAllData"]);
//app.all('/GetMapData', routes["/GetMapData"]);
//app.all('/SaveMapData', routes["/SaveMapData"]);

//app.all('/MakeControlList', routes["/MakeControlList"]);
//app.all('/RecordSaltHarvest', routes["/RecordSaltHarvest"]);
//app.all('/RecordView', routes["/RecordView"]);

///************** Temp Get Information ********************/
//app.all('/GetWeatherDevice', routes["/GetWeatherDevice"]);
//app.all('/GetWeatherCast', routes["/GetWeatherCast"]);
//app.all('/GetRelation', routes["/GetRelation"]);
//app.all('/GetMap', routes["/GetMap"]);
//app.all('/GetControl', routes["/GetControl"]);
//app.all('/MapView', routes["/MapView"]);
//app.all('/PredictWaterLevel', routes["/PredictWaterLevel"]);
//app.all('/PredictTime', routes["/PredictTime"]);
//app.all('/GetTomorrowPOP', routes["/GetTomorrowPOP"]);
//app.all('/ChangeControlMode', routes["/ChangeControlMode"]);

//app.all('/OperationView', routes["/OperationView"]);

//app.all('/CodeTest', routes["/CodeTest"]);

//app.all('/OrderControl', routes["/OrderControl"]);
//app.all('/WeatherDeviceChange', routes["/WeatherDeviceChange"]);
//app.all('/RainControl', routes["/RainControl"]);
/************** Temp Get Information ********************/

