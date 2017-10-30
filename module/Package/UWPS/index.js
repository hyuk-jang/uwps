const Control = require('./Control.js');
const config = require('./config.js');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;
const eventToPromise = require('event-to-promise');
const Promise = require('bluebird')

const _ = require('underscore');

global.BU = BU;
global._ = _;

// TEST : Inverter 객체 6개 생성
// let ivtList = [];
// let baseIvt = config.InverterController[0];

// let comPort = 9;
// let ivtSeq = 5;
// for (let cnt = 1; cnt <= 3; cnt++) {
//   let cloneIvt = JSON.parse(JSON.stringify(baseIvt));

//   let test = cloneIvt.current.ivtSavedInfo.dialing;
//   let buf = Buffer.from(test);
//   cloneIvt.current.ivtSavedInfo.inverter_seq = ivtSeq++;
//   cloneIvt.current.ivtSavedInfo.target_id = 'IVT' + cnt;
//   cloneIvt.current.ivtSavedInfo.target_name = '인버터 ' + cnt;
//   cloneIvt.current.ivtSavedInfo.connect_type = 'socket';
//   cloneIvt.current.ivtSavedInfo.ip = 'localhost';
//   cloneIvt.current.ivtSavedInfo.port = 'COM' + comPort++;
//   cloneIvt.current.hasDev = true;
//   BU.log(cloneIvt.current.ivtSavedInfo.target_id)
//   ivtList.push(cloneIvt);
// }

// config.current.inverterList = ivtList;
// BU.CLI(config)
// return;
let control = new Control(config);

console.time('Uwps Init')
control.init()
  .then(result => {
    // TODO
    console.timeEnd('Uwps Init')
    // BU.CLI('UWPS INIT Result', result)
    return control.hasOperationInverter('IVT1');
  })
  .then(result => {
    // TODO
    BU.CLI('hasOperationInverter IVT1', result)
  })
  .delay(1000)
  .then(() => {
    return control.getInverterData('IVT1');
  })
  .then((r) => {
    BU.CLI(r)
    return control.getConnectorData('CNT1');
  })
  .then(r => {
    BU.CLI(r)
  })
  .catch(error => {
    // TODO
    BU.CLI(error)
    return error;
  });




control.on('completeMeasureInverter', (err, res) => {
  BU.CLI('completeMeasureInverter', res.length)
});

control.on('completeMeasureConnector', (err, res) => {
  BU.CLI('completeMeasureConnector', res.length)
});