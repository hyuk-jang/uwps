const _ = require('underscore');
const Control = require('./Control.js');
const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;

global.BU = BU;


let control = new Control(config);
let result = 0;
let test = control.init()
  .then(hasRun => {
    if (hasRun) {
      BU.CLI('hasRun', hasRun)
      return control.p_SocketServer.cmdProcessor('operation');
      // return control.p_SocketServer.cmdProcessor('weather');
    }
  })
  .then(result => {
    // result = control.cmdProcessor('pv');

    BU.CLIS(result)
    return control.p_SocketServer.cmdProcessor('ampList');
  }).catch(err => {
    BU.CLI(err)
  })
  .then(result => {
    BU.CLI(result)
  });



// let control2 = new Control(config);
// control2.init((err, port) => {
//   BU.CLI(err, port)
// });

// BU.CLI(control)