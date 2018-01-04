'use strict';

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  process.env.NODE_ENV = 'production'

  const _ = require('underscore');
  const config = require('./src/config.js');
  const BU = require('base-util-jh').baseUtil;

  global._ = _;
  global.BU = BU;


  process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
  });


}

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


startIndex()
  .then(res => {
    BU.CLI(res)
  })
  .catch(err => {
    BU.CLI(err);
  })

async function startIndex() {
  await setter();

  const control = new Control(config);
  let result = {};
  
  control.on('completeMeasureInverter', (err, res) => {
    BU.CLI('completeMeasureInverter', res.length)
  });
  
  control.on('completeMeasureConnector', (err, res) => {
    BU.CLI('completeMeasureConnector', res.length)
  });
  
  console.time('Uwps Init')
  await control.init();
  console.timeEnd('Uwps Init')

  // TODO
  result = control.hasOperationInverter('IVT1');
  BU.CLI('hasOperationInverter IVT1', result)
  result = control.getInverterData('IVT1');
  BU.CLI('getInverterData IVT1', result)
  result = control.getConnectorData('CNT1');
  BU.CLI('getConnectorData CNT1', result)

  return true;
}






async function setter() {
  BU.CLI('setter')
  if (config.current.devOption.hasLoadSqlInverter) {
    config.current.inverterList = await inverterSetter();
  }

  if (config.current.devOption.hasLoadSqlConnector) {
    config.current.connectorList = await connectorSetter();
  }

  if (config.current.devOption.hasSaveConfig) {
    BU.writeFile('./config.json', `${JSON.stringify(config)}`, 'w', (err, res) => {
      BU.CLI(err, res)
      process.exit();
    })
  }

  return true;
}

async function inverterSetter() {
  // BU.CLI('inverterSetter')
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
  // BU.CLI(returnValue)

  return returnValue;
}

async function connectorSetter() {
  let connectorList = await BM.db.single(`SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt`);
  let relation_upms = await BM.getTable('relation_upms');

  let returnValue = [];
  // let moduleList = [];
  let basePort = 5555;
  connectorList.forEach((element, index) => {
    let addObj = {
      hasDev: true,
      // devPort: basePort + index,
      cntSavedInfo: element,
      moduleList: _.where(relation_upms, {
        connector_seq: element.connector_seq
      })
    }
    returnValue.push({
      current: addObj
    });
  });

  // BU.CLI(returnValue)
  return returnValue;
}