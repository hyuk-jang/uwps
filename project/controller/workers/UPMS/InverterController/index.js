const _ = require('underscore');

const Control = require('./Control.js');
const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;




global._ = _;
global.BU = BU;

// process.on('unhandledRejection', (reason) => {
//   BU.debugConsole();
//   console.log('Reason: ' + reason);
// });

process.on('unhandledRejection', function (reason, p) {
  console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
  // application specific logging here
});


let control = new Control(config);


// let hasReady = control.init();
let keys = _.keys(control.cmdList);
let index = 0;


control.init()
.then(result => {
  BU.CLI('result')
  return control.measureInverter();
})
.then(result => {
  BU.CLI(result)
  BU.CLI(control.model.inverterData)
})
.catch(error => {
  BU.CLI(error)
})


// for (let ele in control.cmdList) {
//   setTimeout(() => {
//     control.send2Cmd(control.cmdList[ele])
//     .then()
//     .catch(error => {
//       setTimeout(() => {
//         control.send2Cmd(control.cmdList[ele])
//       }, 1000);
//     });
//   }, 1000)
// }

// // Get Model Data Test
// setTimeout(() => {
//   for (let ele in control.cmdList) {
//     setTimeout(() => {
//       let result = control.getScaleInverterData(control.cmdList[ele]);
//       BU.CLI(result)
//     }, 1000)
//   }
// }, 5000);