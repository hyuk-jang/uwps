const _ = require('underscore');
const Control = require('./Control.js');
const config = require('./config.js');
const BU = require(process.cwd() + '/util/baseUtil.js');
global.BU = BU;


let control = new Control(config);
let result = 0;
let test = control.init()
  .then(hasRun => {
    if (hasRun) {
      BU.CLI('hasRun', hasRun)
      result = control.cmdProcessor('pv');
      return control.cmdProcessor('pv');
    }
  })
  .then(result => {
    // result = control.cmdProcessor('pv');

    BU.CLIS(control.model.scaleGrid, control.model.scalePower, control.model.refineInverterData)
    return control.cmdProcessor('pv');
  });



// let control2 = new Control(config);
// control2.init((err, port) => {
//   BU.CLI(err, port)
// });

// BU.CLI(control)