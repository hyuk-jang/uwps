'use strict';

const Control = require('./src/Control');

module.exports = Control;



// control.init()
// .then(result => {
//   BU.CLI('result')
//   return control.measureInverter();
// })
// .then(result => {
//   BU.CLI(result)
//   BU.CLI(control.model.inverterData)
//   BU.CLI(control.operationInfo)
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

// if __main process
if (require !== undefined && require.main === module) {
  const _ = require('underscore');
  const config = require('./src/config.js');
  const BU = require('base-util-jh').baseUtil;

  global._ = _;
  global.BU = BU;


  process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
  });


  let control = new Control(config);
  control.init()
    .then(result => {
      BU.CLI('result')
      return control.measureInverter();
    })
    .then(result => {
      BU.CLI(result)
      BU.CLI(control.model.inverterData)
      BU.CLI(control.operationInfo)
    })
    .catch(error => {
      BU.CLI(error)
    })

  setTimeout(() => {
    BU.CLI(control.model.inverterData)
  }, 1000);
}