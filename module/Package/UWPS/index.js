'use strict';

const Control = require('./src/Control');

module.exports = Control;

// if __main process
const config = require('./src/config.js');
const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');
const BM = new bmjh.BM(config.current.dbInfo);
const Promise = require('bluebird');
const _ = require('underscore');
if (require !== undefined && require.main === module) {
  process.env.NODE_ENV = 'production';


  global._ = _;
  global.BU = BU;

  process.on('unhandledRejection', function (reason, p) {
    // console.trace('Possibly Unhandled Rejection at: Promise ', p);
    // console.trace(' reason: ', reason)
    // application specific logging here
  });



  /**
   * Init Config Setting
   */
  startIndex()
    .then(res => {
      BU.CLI(res);
    })
    .catch(err => {
      BU.CLI(err);
    });

}


async function startIndex() {
  await setter();

  BU.CLI(config);
  const control = new Control(config);

  console.time('Uwps Init');
  await control.init();
  console.timeEnd('Uwps Init');

  // control.operationScheduler();

  return true;
}






async function setter() {
  BU.CLI('setter');
  if (config.current.devOption.hasReloadInverterConfig) {
    config.current.inverterList = await inverterSetter();
  }

  if (config.current.devOption.hasReloadConnectorConfig) {
    config.current.connectorList = await connectorSetter();
  }

  if (config.current.devOption.hasSaveConfig) {
    BU.writeFile('./config.json', `${JSON.stringify(config)}`, 'w', (err, res) => {
      BU.CLI(err, res);
      process.exit();
    });
  }

  return true;
}

async function inverterSetter() {
  BU.CLI('inverterSetter');
  let inverterList = await BM.getTable('inverter');

  let returnValue = [];

  let recentInverterDataList = await Promise.map(inverterList, inverter => {
    return BM.db.single(`SELECT d_wh, c_wh FROM inverter_data WHERE ${inverter.inverter_seq} = inverter_seq ORDER BY inverter_data_seq DESC LIMIT 1 `);
  });

  let ivtDataList = _.flatten(recentInverterDataList);

  inverterList.forEach((element, index) => {
    let addObj = {
      hasDev: process.env.NODE_ENV === 'production' ? false : true,
      ivtDummyData: {},
      deviceSavedInfo: element
    };
    BU.CLI(element);
    addObj.ivtDummyData.dailyKwh = ivtDataList[index] ? ivtDataList[index].d_wh / 10000 : 0;
    addObj.ivtDummyData.cpKwh = ivtDataList[index] ? ivtDataList[index].c_wh / 10000 : 0;
    returnValue.push({
      current: addObj
    });
  });
  // BU.CLI(returnValue)

  return returnValue;
}

async function connectorSetter() {
  BU.CLI('connectorSetter');
  let connectorList = await BM.db.single('SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt');
  let relation_upms = await BM.getTable('relation_upms');

  let returnValue = [];
  // let moduleList = [];
  connectorList.forEach((element) => {
    let addObj = {
      hasDev: process.env.NODE_ENV === 'production' ? false : true,
      deviceSavedInfo: element,
      moduleList: _.where(relation_upms, {
        connector_seq: element.connector_seq
      })
    };
    returnValue.push({
      current: addObj
    });
  });

  // BU.CLI(returnValue)
  return returnValue;
}
