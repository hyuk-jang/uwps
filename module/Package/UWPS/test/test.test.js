const {
  expect
} = require('chai')
const _ = require('underscore');
const Promise = require('bluebird')

const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

describe('UPSAS Test', () => {
  describe('Setter', () => {
    const BM = new bmjh.BM(config.current.dbInfo);
    // 인버터 데이터 DB 갱신 처리
    it('inverterSetter', async() => {
      // 인버터 정보 DB에서 불러오지 않을 경우 
      if (!config.current.devOption.hasLoadSqlInverter) {
        BU.CLI('인버터 config DB 갱신 X ')
        return true;
      }

      let returnValue = [];

      let inverterList = await BM.getTable('inverter');
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

      config.current.inverterList = returnValue;
      BU.CLI(returnValue)

      expect(returnValue).to.not.deep.equal([]);
    })
    // 접속반 데이터 DB 갱신 처리
    it('connectorSetter', async() => {
      // 접속반 정보 DB에서 불러오지 않을 경우 
      if (!config.current.devOption.hasLoadSqlConnector) {
        BU.CLI('접속반 config DB 갱신 X ')
        return true;
      }
      let returnValue = [];
      let connectorList = await BM.db.single(`SELECT *,(SELECT COUNT(*) FROM relation_upms WHERE cnt.connector_seq = relation_upms.connector_seq  ) AS ch_number FROM connector cnt`);
      let relation_upms = await BM.getTable('relation_upms');

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

      config.current.connectorList = returnValue;
      BU.CLI(returnValue)

      expect(returnValue).to.not.deep.equal([]);

    })

    // Json File 생성 유무. --> json 생성 시 해당 File에서 inverterList, connectorList 갱신 후 json File 삭제 요망
    it('make config File', async() => {
      if (!config.current.devOption.hasSaveConfig) {
        BU.CLI('File 생성하지 않음')
        return true;
      }

      let wf = Promise.promisify(BU.writeFile);

      let result = await wf('./src/config.json', `${JSON.stringify(config)}`, 'w')
      BU.CLI(result)

      expect(result).to.equal(undefined);
    })

    // config 갱신 처리가 완료 되었다면
    after(() => {
      // Device 접속 방법 --> Socket Test
      describe('ConnectType: Socket', () => {
        let control = new Control(config);
        // 인버터: 단상, 개발 Ver Test
        // 접속반: 
        before('init - single_ivt dev', async() => {
          setInverterConfig(true, 'single_ivt', 'dev', 'socket')
          setConnectorConfig(true, 'dev', 'socket')

          control = new Control(config);
          console.time('UPSAS Init')
          await control.init();
          console.timeEnd('UPSAS Init')
        })

        it('measure Inverter', async() => {
          let result = await control.p_Scheduler._measureInverter(new Date(), control.model.inverterControllerList)
          BU.CLI(result)
          expect(result.length).to.be.equal(control.model.inverterControllerList.length)
        })

        it('measure Connector', async() => {
          let result = await control.p_Scheduler._measureConnector(new Date(), control.model.connectorControllerList)
          
          BU.CLI(result)
          let moduleLength = 0;
          let measureLength = 0;

          config.current.connectorList.forEach(element => {
            moduleLength += element.current.moduleList.length;
          })

          result.forEach(element => {
            measureLength += element.length;
          })

          expect(measureLength).to.be.equal(moduleLength)
        })
      })
    })
  })
})


function setInverterConfig(hasDev, target_type, target_category, connect_type) {
  config.current.inverterList.forEach(element => {
    element.current.hasDev = hasDev;
    element.current.ivtSavedInfo.target_type = target_type;
    element.current.ivtSavedInfo.target_category = target_category;
    element.current.ivtSavedInfo.connect_type = connect_type;
  });
}

function setConnectorConfig(hasDev, target_category, connect_type) {
  config.current.connectorList.forEach(element => {
    element.current.hasDev = hasDev;
    element.current.cntSavedInfo.target_category = target_category;
    element.current.cntSavedInfo.connect_type = connect_type;
  });
}