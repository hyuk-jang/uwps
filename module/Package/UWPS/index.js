const Control = require('./Control.js');
const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;

const eventToPromise = require('event-to-promise');
const Promise = require('bluebird')

const _ = require('underscore');

global.BU = BU;
global._ = _;

const bmjh = require('base-model-jh');
const BM = new bmjh.BM(config.current.dbInfo);

if (config.current.devOption.hasLoadSqlInverter) {
  inverterSetter()
    .then(inverterList => {
      config.current.inverterList = inverterList;

      BU.writeFile('./config.json', `${JSON.stringify(config)}`, 'w', (err, res) => {

      })
    });
} else {
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

}


async function inverterSetter() {
  let inverterList = await BM.getTable('inverter');

  BU.CLI(inverterList)

  let returnValue = [];

  return new Promise(resolve => {
    Promise.map(inverterList, inverter => {
      BU.CLI(inverter)
      return BM.db.single(`SELECT d_wh, c_wh FROM inverter_data WHERE ${inverter.inverter_seq} = inverter_seq ORDER BY inverter_data_seq DESC LIMIT 1 `);
    }).then(result => {
      let ivtDataList = _.flatten(result);
      inverterList.forEach((element, index) => {
        let addObj = {
          hasDev: true,
          ivtDummyData: {},
          ivtSavedInfo: element
        }

        addObj.ivtDummyData.dailyKwh = ivtDataList[index].d_wh / 10000;
        addObj.ivtDummyData.cpKwh = ivtDataList[index].c_wh / 10000;
        returnValue.push({ current: addObj });
      });
      // BU.CLI(returnValue)
      resolve(returnValue);
    })
  })
}




