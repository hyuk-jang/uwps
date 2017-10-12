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
let keys = _.keys(control.cmdList);
let index = 0;


control.init()
.then(result => {
  return control.measureInverter();
})

  // .then((result) => {
  //   BU.CLI('One')
  //   return control.send2Cmd(control.cmdList[keys[index++]]);
  // })
  // .then((result) => {
  //   // setTimeout(() => {
  //   BU.CLI('Two', result);
  //   return control.send2Cmd(control.cmdList[keys[index++]]);
  //   // }, 1000);
  // })
  // .then((result) => {
  //   BU.CLI('Three', result)

  //   BU.CLI(control.model.scaleGrid)
    
  //   return control.send2Cmd(control.cmdList[keys[index++]]);
  // })
  // .catch(error => {

  //   return BU.CLI(error)
  // })

// .catch(error => {

//   return BU.CLI(error)
// })
// .then((result) => {
//   BU.CLI('Four', result)
//   return control.send2Cmd(control.cmdList[keys[index++]]);
// })
// .catch(error => {
//   BU.CLI(error)
// })
// .then((result) => {
//   BU.CLI('Five', result)
//   return control.send2Cmd(control.cmdList[keys[index++]]);
// })
// .catch(error => {
//   BU.CLI(error)
// })
// .then((result) => {
//   BU.CLI('Six', result)
// })
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