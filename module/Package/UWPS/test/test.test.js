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

// Step 테스트 유무(개발용 일경우 다수의 Socket Port가 열리고 Reload발생시 Socket Max Count 제한이 100이라서 중간에 정지될 수 있ㅇ므)
let hasStep1 = true;
let hasStep2 = false;
let hasInsertInverterSql = false;   // 실제 DB 삽입
let hasInsertConnectorSql = false;  // 실제 DB 삽입

describe('UPSAS Test', () => {
  let inverterData
  let connectorData
  let control = new Control(config);
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

        // 인버터: 단상, 개발 Ver Test
        // 접속반: 
        if (hasStep1) {
          describe('Step 1', () => {
            before('init - single dev', async() => {
              setInverterConfig(true, 'single', 'dev', 'socket')
              setConnectorConfig(true, 'dev', 'socket')

              control = new Control(config);
              console.time('UPSAS Init')
              await control.init();
              console.timeEnd('UPSAS Init')
            })

            // 인버터 계측 테스트
            it('measure Inverter(single, dev, socket)', async() => {
              // 인버터 리스트 계측 명령
              let result = await control.p_Scheduler._measureInverter(new Date(), control.model.inverterControllerList)
              inverterData = result;
              // BU.CLI(result)
              // 수신받은 데이터 갯수와 명령 요청한 리스트 갯수 비교
              expect(result.length).to.be.equal(control.model.inverterControllerList.length)
            })

            // 접속반 계측 테스트
            it('measure Connector(dev, socket)', async() => {
              // 접속반 리스트 계측 명령
              let moduleLength = 0;
              let result = connectorData = await control.p_Scheduler._measureConnector(new Date(), control.model.connectorControllerList)
              // BU.CLI(result)
              // 각각 접속반이 포함하는 모듈 총 갯수를 구함
              config.current.connectorList.forEach(element => {
                moduleLength += element.current.moduleList.length;
              })
              // 모듈 갯수 비교
              expect(result.length).to.be.equal(moduleLength)
            })
          })
        }


        if (hasStep2) {
          describe('Step 2', () => {
            before('init - single dev', async() => {
              setInverterConfig(true, 'single', 's_hex', 'socket')
              setConnectorConfig(true, 'dm_v2', 'socket')

              control = new Control(config);
              await control.init();
            })

            // 인버터 계측 테스트
            it('measure Inverter(single, s_hex, socket)', async() => {
              // 인버터 리스트 계측 명령
              let result = await control.p_Scheduler._measureInverter(new Date(), control.model.inverterControllerList)
              // BU.CLI(result)
              inverterData = result;
              // 수신받은 데이터 갯수와 명령 요청한 리스트 갯수 비교
              expect(result.length).to.be.equal(control.model.inverterControllerList.length)
            })

            // 접속반 계측 테스트
            it('measure Connector(single, dm_v2, socket)', async() => {
              // 접속반 리스트 계측 명령
              let result = connectorData = await control.p_Scheduler._measureConnector(new Date(), control.model.connectorControllerList)
              // BU.CLI(result)
              let moduleLength = 0;
              // 각각 접속반이 포함하는 모듈 총 갯수를 구함
              config.current.connectorList.forEach(element => {
                moduleLength += element.current.moduleList.length;
              })
              // 모듈 갯수 비교
              expect(result.length).to.be.equal(moduleLength)
            })
          })
        }
      })
    })
  })

  after(() => {
    describe('CheckModel', () => {
      let insertInverterData
      let insertConnectorData
      it('onInverterDataList', done => {
        // 데이터가 있어야 함
        expect(inverterData.length).to.not.equal(0)
        insertInverterData = control.model.onInverterDataList(new Date(), inverterData)
        // BU.CLI(insertInverterData)
        expect(insertInverterData).to.be.an('array')
        done();
      })
      it('onConnectorDataList', done => {
        // 데이터가 있어야 함
        expect(connectorData.length).to.not.equal(0)
        insertConnectorData = control.model.onConnectorDataList(new Date(), connectorData)
        // BU.CLI(insertConnectorData)
        expect(insertConnectorData).to.be.an('array');
        done();
      })

      if(hasInsertInverterSql){
        it('insertInverter', async() => {
          expect(insertInverterData.length).to.not.equal(0)
          control.model.hasInsertQuery = true;
          let result = await control.model.insertQuery('inverter_data', insertInverterData)
          BU.CLI(result)
          expect(result).to.not.deep.equal({});
        })
      }

      if(hasInsertConnectorSql){
        it('insertConnector', async() => {
          expect(insertConnectorData.length).to.not.equal(0)
          control.model.hasInsertQuery = true;
          let result = await control.model.insertQuery('module_data', insertConnectorData)
          BU.CLI(result)
          expect(result).to.not.deep.equal({});
        })
      }



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