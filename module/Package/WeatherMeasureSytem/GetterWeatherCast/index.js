const Control = require('./Control.js');
const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;
global.BU = BU;


let control = new Control(config);

// BU.CLI(control)
control.init();


// 날씨 정보 업데이트
control.on('updateWeatherCast', (err, weatherCastObj) => {
  BU.CLI(err, weatherCastObj)
});


if (require !== undefined && require.main === module) {

}