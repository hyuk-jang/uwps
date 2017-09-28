const _ = require('underscore');
const Control = require('./Control.js');
const config = require('./config.js');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;
global.BU = BU;


let control = new Control(config);
let result = 0;
let test = control.init()
  .then(hasRun => {
    if (hasRun) {
      BU.CLI('hasRun', hasRun)
      result = control.p_SocketServer.cmdProcessor('pv');
      return control.p_SocketServer.cmdProcessor('pv');
    }
  })
  .then(result => {
    // result = control.cmdProcessor('pv');

    BU.CLIS(control.model.scaleGrid, control.model.scalePower, control.model.refineInverterData)
    return control.p_SocketServer.cmdProcessor('pv');
  }).catch(err => {
    BU.CLI(err)
  });



// let control2 = new Control(config);
// control2.init((err, port) => {
//   BU.CLI(err, port)
// });

// BU.CLI(control)