const Control = require('./Control.js');
const config = require("./config.js");
const BU = require('base-util-jh').baseUtil;
global.BU = BU;


let control = new Control(config);
control.init();

// 날씨 변화
control.on('updateWeatherDevice', weatherDeviceData => {

});


// Rain Level 변화가 생겼을 경우
control.getterSmRainSensor.on('updateSmRainSensor', (updateObj) => {
  BU.CLI('updateSmRainSensor',updateObj)
  // TODO: GCM 전송

  // 모델 업데이트
  control.updateWeatherDevice();
});

control.getterVantagePro2.on('updateVantagePro2', (updateObj) => {
  BU.CLI('updateVantagePro2',updateObj)
  control.updateWeatherDevice();
});


module.exports = control;