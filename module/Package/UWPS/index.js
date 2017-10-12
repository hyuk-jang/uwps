const Control = require('./Control.js');
const config = require("./config.js");
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;


const _ =  require('underscore');

global.BU = BU;
global._ = _;

// TEST : Inverter 객체 6개 생성
let ivtList = [];
let baseIvt = config.InverterController[0];

let comPort = 9;
let ivtSeq = 5;
for(cnt = 1; cnt <= 2; cnt++){
  
  let cloneIvt = JSON.parse(JSON.stringify(baseIvt))  ;

  let test = cloneIvt.current.ivtSavedInfo.dialing;
  let buf = Buffer.from(test);
  cloneIvt.current.ivtSavedInfo.inverter_seq = ivtSeq++;
  cloneIvt.current.ivtSavedInfo.target_id = 'IVT' + cnt;
  cloneIvt.current.ivtSavedInfo.target_name = '인버터 ' + cnt;
  cloneIvt.current.ivtSavedInfo.connect_type = 'socket';
  cloneIvt.current.ivtSavedInfo.ip = 'localhost';
  cloneIvt.current.ivtSavedInfo.port = 'COM' + comPort++ ;
  cloneIvt.current.hasDev = true;
  BU.log(cloneIvt.current.ivtSavedInfo.target_id)
  ivtList.push(cloneIvt);
}

config.InverterController = ivtList;
// BU.CLI(ivtList)
// return;

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