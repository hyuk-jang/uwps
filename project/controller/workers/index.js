const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("base-util-jh").baseUtil;
global.BU = BU;


let control = new Control(config);
control.init();


/*
  GetterWeather Event Emitter
*/
let getterWeather = control.getterWeather;

getterWeather.on('sendAllGcmMsg', (msg, msgStatus) => {
  BU.CLIS('sendAllGcmMsg', msg, msgStatus)
  // GCM Send
  control.sendAllGcmMsg(msg, msgStatus)
});


let getterWeatherCast = getterWeather.getterWeatherCast;
// 날씨 정보 업데이트
getterWeatherCast.on('updateWeatherCast', weatherCastObj => {
  BU.CLI('updateWeatherCast', weatherCastObj)
  // TODO: GCM
});



/*
  GetterWeatherDevice Event Emitter
*/
let getterWeatherDevice = getterWeather.getterWeatherDevice;
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
  getterWeather.sendGcmStartedRain(updateObj);

  // 모델 업데이트
  getterWeatherDevice.updateWeatherDevice();
});

// VantagePro2 변화가 생겼을 경우
getterVantagePro2.on('updateVantagePro2', (updateObj) => {
  BU.CLI('updateVantagePro2',updateObj)
  // 모델 업데이트
  getterWeatherDevice.updateWeatherDevice();
});




// // TEST: 기상청 날씨 가져오기
// setTimeout(function () {
//   let tPop = getterWeather.getterWeatherCast.getTomorrowPop();

//   getterWeather.sendGcmTomorrowPop(tPop);
//   BU.CLI(tPop);
// }, 3000);
