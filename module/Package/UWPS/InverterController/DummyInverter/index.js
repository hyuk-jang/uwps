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
      // result = control.p_GenerateData.dummyRangeDataMaker();
      return control.p_SocketServer.cmdProcessor('weather');
    }
  })
  .then(result => {
    // result = control.cmdProcessor('pv');

    // BU.CLIS(result)
    return control.p_SocketServer.cmdProcessor('grid');
  }).catch(err => {
    BU.CLI(err)
  })
  .then(r => {
    // BU.CLI(r)
  });



// let control2 = new Control(config);
// control2.init((err, port) => {
//   BU.CLI(err, port)
// });

// BU.CLI(control)