const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

global.BU = BU;
global._ = _;

const Control = require('./Control.js');
const config = require('./config.js');


let control = new Control(config);
control.init()
.then(result => {
  BU.CLI(result)
})
.catch(err => {
  console.error(err);
});


control.on('', (err, res) => {
});

process.on('unhandledRejection', r => console.log(BU.CLI(r)));