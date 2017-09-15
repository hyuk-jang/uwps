const _ = require('underscore');
const Control = require('./Control.js');
const config = require('./config.js');
const BU = require(process.cwd() + '/util/baseUtil.js');
global.BU = BU;


// let control = new Control(config);
// control.makerQuery();
// control.on('completeMakerQuery', result => {
//   BU.CLI(result)
// });

for (let cnt = 0; cnt <= 31; cnt++) {
  // 날씨가 안좋은 날씨에 대한 가중치 부여
  // 16분의 1로 비가 옴.
  let hasRain = _.random(0, 15) === 0 ? true : false;
  let dayScale = hasRain ? _.random(0, 50) : _.random(80, 100);

  config.current.dbmsManager.dailyScale.push(dayScale / 100);
}

// let ivtList = ['IVT1', 'IVT2'];
let ivtList = ['IVT1', 'IVT2', 'IVT3', 'IVT4', 'IVT5', 'IVT6'];
// let ivtList = ['IVT1', 'IVT2', 'IVT3', 'IVT4', 'IVT5', 'IVT6', 'IVT7', 'IVT8', 'IVT9', 'IVT10'];
let ciriticalList = [2, 2.5, 2.2, 2.4, 2.6, 2.4];
let controlList = [];
let inverterDataList = [];

// ivtList.forEach((ivt, index) => {
//   // const config = require('./config.js');
//   const cConfig = JSON.parse(JSON.stringify(config));
//   cConfig.current.dbmsManager.inverterId = ivtList[index];
//   cConfig.current.dummyValue.pv.baseAmp = cConfig.current.dummyValue.pv.baseAmp * _.random(80, 100) / 100;
//   cConfig.current.dummyValue.pv.ampCritical = ciriticalList[index];

//   let control = new Control(cConfig);

//   controlList.push(control);

//   control.makerQuery(insertConnector);
//   control.on('completeMakerQuery', result => {
//   }); 
// });

let count = 0;


let connectData = [];
let chList = [];

function insertConnector(err, ch, insertData) {
  if (err) {
    BU.CLI('Error Occur',err)
    process.exit();
  }
  count++;
  inverterDataList.push(insertData);
  chList.push(ch);

  // 모든 자료가 모일 경우
  if (count === ivtList.length) {
    BU.CLI('모든 자료 모임')
    _.each(inverterDataList, (inverterData, index) => {
      // BU.CLI(inverterData)
      let objCount = 0;
      _.each(inverterData, dataObj => {
        objCount++;
        if (index === 0) {
          let addObj = {
            connector_seq: 1,
            v: 0,
            writedate: ''
          };
          addObj.v = dataObj.in_v;
          addObj[chList[index]] = dataObj.in_a;
          addObj.writedate = dataObj.writedate;

          connectData.push(addObj);
        } else {
          let findObj = _.findWhere(connectData, {
            writedate: dataObj.writedate
          });
          findObj[chList[index]] = dataObj.in_a;
        }

        if (index + 1 === inverterDataList.length){
          if(Object.keys(inverterData).length === objCount){
            BU.CLI('모든 자료 처리')
            const Bi = require('./Bi.js');
            let bi = new Bi(config.current.dbInfo);

            BU.CLI(connectData)
  
            bi.insertTableList('connector_data', connectData, (err, result) => {
              BU.CLI(err, result);
            });
          }
        }
      })
    })
  }
}







// control.init();



// BU.CLI(control)


// BU.CLI(control.model.invInfo)
// BU.CLI(control.model.pvData)
// BU.CLI(control.model.singleGridData)
// BU.CLI(control.model.ThirdGridData)
// BU.CLI(control.model.solarPowerData)


// control.on('', (err, res) => {
// });