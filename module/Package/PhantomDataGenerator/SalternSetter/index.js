const _ = require('underscore');
const BU = require('./baseUtil.js');

global.BU = BU;
global._ = _;

const Control = require('./Control.js');
const config = require('./config.js');


let control = new Control(config);
control.init();


control.on('', (err, res) => {
});