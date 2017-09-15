const Control = require('./Control.js');
const config = require("./config.js");
const BU = require(process.cwd() + '/util/baseUtil.js');

const _ =  require('lodash');

global.BU = BU;


// TEST : Inverter 객체 6개 생성
let ivtList = [];
let baseIvt = config.InverterController[0];


let comPort = 9;
for(cnt = 0; cnt < 2; cnt++){
  let cloneIvt = JSON.parse(JSON.stringify(baseIvt))  ;
  cloneIvt.current.deviceInfo.hasSocket = false;
  cloneIvt.current.deviceInfo.port = 'COM' + comPort++ ;
  cloneIvt.current.hasDev = false;

  ivtList.push(cloneIvt);
}

config.InverterController = ivtList;


let control = new Control(config);

control.createInverterController(ivtList)
// .then(result => {
//   // TODO
//   BU.CLI(result)
//   return result;
// })
// .catch(error => {
//   // TODO
//   BU.CLI(error)
//   return error; 
// });


control.on('', (err, res) => {
});