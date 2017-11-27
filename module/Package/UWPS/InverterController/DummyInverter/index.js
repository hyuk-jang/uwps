const Promise = require('bluebird');
const _ = require('underscore');
const Control = require('./Control.js');
const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

global.BU = BU;


// let control = new Control({
//   dailyKwh: 0,
//   cpKwh: 0
// });
// let result = 0;
// let test = control.init()
//   .then(hasRun => {
//     BU.CLI('hasRun', hasRun)
//     // return control.p_GenerateData.dummyRangeDataMaker('2017-11-11', '2017-11-12');
//     return control.p_SocketServer.cmdProcessor('weather');
//   })
//   .then(result => {
//     // result = control.cmdProcessor('pv');
//     BU.CLIS(result, control.model.power)
//     return control.p_SocketServer.cmdProcessor('power');
//   }).catch(err => {
//     BU.CLI(err)
//   })
//   .then(r => {
//     BU.CLI(r)
//   });





 /**
  * Inverter Data Dabasebase INserter
  */
return false;
let inverterList = [1, 2, 3, 4, 5, 6];
let dummyInverterList = insertDummyInverterData2Db(inverterList);
let finalDummyDataList = _.flatten(dummyInverterList);

insertDb(finalDummyDataList)
.then(res => {
  return BU.CLI(res);
})
.catch(e => {
  console.log(e.message)
  // BU.CLI(e)
})

// BU.CLI(dummyList)

// 가상 데이터 리스트 생성
function insertDummyInverterData2Db(inverterSeqList){
  // Dummy Data Inverter  
  let allDummyDataList = [];
  inverterSeqList.forEach(inverter_seq => {
    let control = new Control({
      dailyKwh: 0,
      cpKwh: 0
    });
  
    let dummyData = control.dummyRangeDataMaker('2017-08-12', '2017-11-27 15:00:00', 30, inverter_seq)
    allDummyDataList.push(dummyData);
  })
  return allDummyDataList;
}

async function insertDb(insertList) {
  let dbInfo = {
    host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
    user: 'upsas',
    password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
    database: 'upsas'
  }

  let BM = new bmjh.BM(dbInfo);

  return await BM.setTables('inverter_data', insertList);
}
