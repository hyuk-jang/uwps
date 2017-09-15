const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;


let control = new Control(config);

// BU.CLI(control)
control.init();


// 날씨 정보 업데이트
control.on('updateWeatherCast', weatherCastObj => {
  // BU.CLI(weatherCastObj)
});

