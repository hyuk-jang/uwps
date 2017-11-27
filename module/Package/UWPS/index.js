const Control = require('./Control.js');
const config = require('./config.js');
const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

const eventToPromise = require('event-to-promise');
const Promise = require('bluebird')

const _ = require('underscore');

global.BU = BU;
global._ = _;

const BM = new bmjh.BM(config.current.dbInfo);

/**
 * Init Config Setting
 */

 async function getTables(){

  let inverter = await BM.getTable('inverter');
  let connector = await BM.db.single(`SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt`);
  return {
    inverter, connector
  }
 }

 






 let control = {};


setter()
.then(res => {
  console.time('Uwps Init')
  control = new Control(config);
  control.on('completeMeasureInverter', (err, res) => {
    BU.CLI('completeMeasureInverter', res.length)
  });
  
  control.on('completeMeasureConnector', (err, res) => {
    BU.CLI('completeMeasureConnector', res.length)
  });
  
  return control.init();
})
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
// .delay(1000)
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




async function setter() {
  BU.CLI('setter')
  if (config.current.devOption.hasLoadSqlInverter) {
    config.current.inverterList = await inverterSetter();
  }

  if (config.current.devOption.hasLoadSqlConnector) {
    config.current.connectorList = await connectorSetter();
  }

  if (config.current.devOption.hasSaveConnectorConfig || config.current.devOption.hasSaveInverterConfig) {
    BU.writeFile('./config.json', `${JSON.stringify(config)}`, 'w', (err, res) => {
      BU.CLI(err, res)
      process.exit();
    })
  }

  return true;
}

async function inverterSetter() {
  BU.CLI('inverterSetter')
  let inverterList = await BM.getTable('inverter');

  let returnValue = [];

  let recentInverterDataList = await Promise.map(inverterList, inverter => {
    return BM.db.single(`SELECT d_wh, c_wh FROM inverter_data WHERE ${inverter.inverter_seq} = inverter_seq ORDER BY inverter_data_seq DESC LIMIT 1 `);
  })

  let ivtDataList = _.flatten(recentInverterDataList);

  inverterList.forEach((element, index) => {
    let addObj = {
      hasDev: true,
      ivtDummyData: {},
      ivtSavedInfo: element
    }

    addObj.ivtDummyData.dailyKwh = ivtDataList[index].d_wh / 10000;
    addObj.ivtDummyData.cpKwh = ivtDataList[index].c_wh / 10000;
    returnValue.push({
      current: addObj
    });
  });
  BU.CLI(returnValue)

  return returnValue;
}

async function connectorSetter() {
  let connectorList = await BM.db.single(`SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt`);

  let returnValue = [];
  let basePort = 5555;
  connectorList.forEach((element, index) => {
    let addObj = {
      hasDev: true,
      devPort: basePort + index,
      cntSavedInfo: element
    }
    returnValue.push({
      current: addObj
    });
  });

  BU.CLI(returnValue)
  return returnValue;
}