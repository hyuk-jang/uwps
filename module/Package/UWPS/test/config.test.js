const {
  expect
} = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');

const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

const config = require('../src/config.js');

global._ = _;
global.BU = BU;

const getTroubleList = deviceType => {
  let sql = `
    SELECT o.*
      FROM ${deviceType}_trouble_data o                    
        LEFT JOIN ${deviceType}_trouble_data b             
            ON o.${deviceType}_seq = b.${deviceType}_seq AND o.code = b.code AND o.${deviceType}_trouble_data_seq < b.${deviceType}_trouble_data_seq
      WHERE b.${deviceType}_trouble_data_seq is NULL
      ORDER BY o.${deviceType}_trouble_data_seq ASC
  `;
  return sql;
};

let hasReloadInverterConfig = true;
let hasReloadConnectorConfig = true;
let hasSaveConfig = true;
describe('Config Setter Test', () => {
  const BM = new bmjh.BM(config.current.dbInfo);
  // 인버터 데이터 DB 갱신 처리
  it('inverterSetter', async () => {
    // 인버터 정보 DB에서 불러오지 않을 경우 
    if (!hasReloadInverterConfig) {
      BU.CLI('인버터 config DB 갱신 X ');
      return true;
    }

    let returnValue = [];

    let inverterList = await BM.getTable('inverter');
    let recentInverterDataList = await Promise.map(inverterList, inverter => {
      return BM.db.single(`SELECT d_wh, c_wh FROM inverter_data WHERE ${inverter.inverter_seq} = inverter_seq ORDER BY inverter_data_seq DESC LIMIT 1 `);
    });

    let ivtDataList = _.flatten(recentInverterDataList);

    inverterList.forEach((element, index) => {
      let addObj = {
        hasDev: true,
        ivtDummyData: {},
        deviceSavedInfo: element
      };

      try {
        addObj.ivtDummyData.dailyKwh = ivtDataList[index].d_wh / 10000;
        addObj.ivtDummyData.cpKwh = ivtDataList[index].c_wh / 10000;
      } catch (error) {
        addObj.ivtDummyData.dailyKwh = 0;
        addObj.ivtDummyData.cpKwh = 0;
      }
      returnValue.push({
        current: addObj
      });
    });

    config.current.inverterList = returnValue;
    BU.CLI(returnValue);

    expect(returnValue).to.not.deep.equal([]);
  });

  // 접속반 데이터 DB 갱신 처리
  it('connectorSetter', async () => {
    // 접속반 정보 DB에서 불러오지 않을 경우 
    if (!hasReloadConnectorConfig) {
      BU.CLI('접속반 config DB 갱신 X ');
      return true;
    }
    let returnValue = [];
    let connectorList = await BM.db.single('SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt');
    let relation_upms = await BM.getTable('relation_upms');

    connectorList.forEach((element) => {
      let addObj = {
        hasDev: true,
        // devPort: basePort + index,
        deviceSavedInfo: element,
        moduleList: _.where(relation_upms, {
          connector_seq: element.connector_seq
        })
      };
      returnValue.push({
        current: addObj
      });
    });

    config.current.connectorList = returnValue;
    BU.CLI(returnValue);

    expect(returnValue).to.not.deep.equal([]);

  });

  // Json File 생성 유무. --> json 생성 시 해당 File에서 inverterList, connectorList 갱신 후 json File 삭제 요망
  it('make config File', async () => {
    if (!hasSaveConfig) {
      BU.CLI('File 생성하지 않음');
      return true;
    }

    let wf = Promise.promisify(BU.writeFile);

    BU.CLI(config);
    let result = await wf('./out/config.json', `${JSON.stringify(config)}`, 'w');
    BU.CLI(result);
    expect(result).to.equal(undefined);

    // 인버터 이상 데이터 생성
    let inverterDbTroubleList = await BM.db.single(getTroubleList('inverter'));
    result = await wf('./out/inverterDbTroubleList.json', `${JSON.stringify(inverterDbTroubleList)}`, 'w');

    expect(result).to.equal(undefined);
  });
});