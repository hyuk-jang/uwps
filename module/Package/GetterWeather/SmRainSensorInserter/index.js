const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;

let control = new Control(config);
control.init();


control.getterNewSmRainSensor_1.on('onSmRainData', res => {
  control.bi.insertTable('data_logger', {
    name: control.getterNewSmRainSensor_1.config.deviceInfo.deviceName,
    value: res
  }, () => {})
  BU.CLI('New', res)
});

control.getterOldSmRainSensor_2.on('onSmRainData', res => {
  BU.CLI(res,control.getterOldSmRainSensor_2.config.deviceInfo.deviceName)
  control.bi.insertTable('data_logger', {
    name: control.getterOldSmRainSensor_2.config.deviceInfo.deviceName,
    value: res
  }, () => {})
  BU.CLI('Old', res)
});