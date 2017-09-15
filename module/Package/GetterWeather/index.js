const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;


let control = new Control(config);
control.init();

/*
  GetterWeather Event Emitter
*/
control.on('sendAllGcmMsg', (msg, msgStatus) => {
  BU.CLIS('sendAllGcmMsg', msg, msgStatus)
});

/*
  GetterWeatherCast Event Emitter
*/
let getterWeatherCast = control.getterWeatherCast;
// 날씨 정보 업데이트
getterWeatherCast.on('updateWeatherCast', weatherCastObj => {
  // BU.CLI('updateWeatherCast', weatherCastObj)
  // TODO: GCM
});



/*
  GetterWeatherDevice Event Emitter
*/
let getterWeatherDevice = control.getterWeatherDevice;
let getterSmRainSensor = getterWeatherDevice.getterSmRainSensor;
let getterVantagePro2 = getterWeatherDevice.getterVantagePro2;

// 날씨 변화
getterWeatherDevice.on('updateWeatherDevice', weatherDeviceData => {
  // TODO: Push Msg 전송
});

// Rain Level 변화가 생겼을 경우
getterSmRainSensor.on('updateSmRainSensor', (updateObj) => {
  BU.CLI('updateSmRainSensor',updateObj)
  // GCM 전송
  control.sendGcmStartedRain(updateObj);

  // 모델 업데이트
  getterWeatherDevice.updateWeatherDevice();
});

// VantagePro2 변화가 생겼을 경우
getterVantagePro2.on('updateVantagePro2', (updateObj) => {
  BU.CLI('updateVantagePro2',updateObj)
  // 모델 업데이트
  getterWeatherDevice.updateWeatherDevice();
});




// TEST: 기상청 날씨 가져오기
setTimeout(function () {
  let tPop = control.getterWeatherCast.getTomorrowPop();

  control.sendGcmTomorrowPop(tPop);
  BU.CLI(tPop);
}, 3000);
