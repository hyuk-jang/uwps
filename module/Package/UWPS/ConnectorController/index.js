const _ = require('underscore');

const Control = require('./Control.js');
const config = require('./config.js');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;



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

control.init()
.then(result => {
  BU.CLI(result)
  return control.measureConnector();
})
.then(connectorData => {
  BU.CLI(connectorData)
})
.catch(err => {
  BU.CLI(err)
});

// .then(result => {
//   return control.me measureInverter();
// })
// .then(result => {
//   BU.CLI(result)
// })
// .catch(error => {
//   BU.CLI(error)
// })


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