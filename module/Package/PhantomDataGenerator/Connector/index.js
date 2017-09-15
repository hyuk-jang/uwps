const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;

let control = new Control(config);
control.init();


control.on('', (err, res) => {
});