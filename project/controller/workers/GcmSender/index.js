const Control = require('./Control.js');
const config = require("./config.js");
const BU = require('base-util-jh').baseUtil;
global.BU = BU;


let control = new Control(config);
// control.init();

control.sendMsgAll('hi', 'rain');


/*
  GetterWeatherCast Event Emitter
*/
