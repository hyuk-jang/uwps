const Control = require('./Control.js');
const config = require("./config.js");
const BU = require('base-util-jh').baseUtil;
global.BU = BU;


let control = new Control(config);
control.init()
.then(res => {
  BU.CLI(res.length);
})
.catch(err => {
  BU.CLI(err);
})
;

// 날씨 변화
control.on('updateWeatherDevice', weatherDeviceData => {
  BU.CLI(weatherDeviceData)
});


// Rain Level 변화가 생겼을 경우
control.getterSmRainSensor.on('updateSmRainSensor', (err, updateObj) => {
  BU.CLI('updateSmRainSensor',updateObj)
  // TODO: GCM 전송

  // 모델 업데이트
  // control.updateWeatherDevice();
});

control.getterSmRainSensor.p_SerialClient.on('receiveData', (err, res) => {
  BU.CLI(err, res);
})

control.getterVantagePro2.on('updateVantagePro2', (err, updateObj) => {
  BU.CLI('updateVantagePro2',updateObj)
  // control.updateWeatherDevice();
});

control.getterVantagePro2.p_SerialClient.on('receiveData', (err, res) => {
  BU.CLI(err, res);
})


module.exports = control;