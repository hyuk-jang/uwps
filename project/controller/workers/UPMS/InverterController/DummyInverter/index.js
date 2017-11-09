const _ = require('underscore');
const Control = require('./Control.js');
const BU = require('base-util-jh').baseUtil;

global.BU = BU;


let control = new Control();
let result = 0;
let test = control.init()
  .then(hasRun => {
    BU.CLI('hasRun', hasRun)
    return control.p_GenerateData.dummyRangeDataMaker();
    // return control.p_SocketServer.cmdProcessor('weather');
  })
  .then(result => {
    // result = control.cmdProcessor('pv');
    BU.CLIS(result, control.model.power)
    return control.p_SocketServer.cmdProcessor('power');
  }).catch(err => {
    BU.CLI(err)
  })
  .then(r => {
    BU.CLI(r)
  });



// let control2 = new Control(config);
// control2.init((err, port) => {
//   BU.CLI(err, port)
// });

// BU.CLI(control)