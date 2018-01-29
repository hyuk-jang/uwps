const {
  expect
} = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');
const eventToPromise = require('event-to-promise');

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

const setConnectorConfig = (hasDev, target_category, connect_type) => {
  config.current.connectorList.forEach(element => {
    element.current.hasDev = hasDev;
    element.current.deviceSavedInfo.target_category = target_category;
    element.current.deviceSavedInfo.connect_type = connect_type;
  });
};

describe('UPSAS Connector Controller Test', () => {
  describe('category: single dev', () => {
    describe('connect Type: socket', () => {
      let control = new Control(config);
      let upsasDataGroup;
      let dbTroubleList;
      let model;
      // Create Inverter Controller
      if (false) {
        it('createContoller', async () => {
          setConnectorConfig(true, 'dev', 'socket');
          BU.CLI(config);
          control = new Control(config);
          control.eventHandler();
          console.time('init - single dev');
          let result = await Promise.all([
            control.createConnectorController(config.current.connectorList),
          ]);
          console.timeEnd('init - single dev');


          expect(result).to.not.be.deep.equal([]);
        });
      }

      // measure Connector(single, dev, socket)
      if (false) {
        it('measure Connector(single, dev, socket)', async () => {
          model = control.model;
          // 장치 리스트 계측 명령
          console.time('_measureConnector');
          let measureDataList = await control.p_Scheduler._measureConnector(new Date(), control.model.getUpsasControllerGrouping('connector'));
          console.timeEnd('_measureConnector');
          BU.CLI(measureDataList);
          measureDataList.forEach(ele => {
            expect(ele.data).to.not.deep.equal({});
          });

          // 해당 Device Type으로 초기화한 데이터와 잘 들어가는지 확인.
          upsasDataGroup = model.onMeasureDeviceList(new Date(), measureDataList, 'connector');
          BU.CLI(upsasDataGroup);
          expect(upsasDataGroup).to.not.be.deep.equal({});

          expect(true).be.ok;
        });
      }

      // device System Error Test
      if (false) {
        it('connector System Error Test', done => {
          let testDbTroubleList = [{
            connector_trouble_data_seq: 11,
            connector_seq: 1,
            is_error: 1,
            code: 'Disconnected',
            msg: 'DisConnected !!!',
            occur_date: new Date(),
            fix_date: null
          }, {
            connector_trouble_data_seq: 13,
            connector_seq: 3,
            is_error: 1,
            code: 'Disconnected',
            msg: 'DisConnected !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            connector_trouble_data_seq: 4,
            connector_seq: 1,
            is_error: 1,
            code: 'remainError',
            msg: 'remainError !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            connector_trouble_data_seq: 2,
            connector_seq: 2,
            is_error: 0,
            code: 'Inverter O.C. overtime fault',
            msg: '태양전지 저전압 (변압기 type Only) !!!',
            occur_date: new Date(),
            fix_date: null
          }
          ];
          let count = 0;
          upsasDataGroup.storage.forEach(dataObj => {
            count += 1;
            // BU.CLI(dataObj);
            let testSystemErrorList = [{
              code: 'Disconnected',
              msg: '접속반 장치 접속 끊김',
              occur_date: new Date()
            }, {
              code: 'Timeout Error',
              msg: '탐 아웃',
              occur_date: new Date()
            }];
            // BU.CLI(testSystemErrorList);
            // 시스템 에러가 있다면 
            if (testSystemErrorList.length) {
              const resultProcessSystemError = model.processDeviceErrorList(testSystemErrorList, testDbTroubleList, dataObj, true, 'connector');
              testDbTroubleList = resultProcessSystemError.dbTroubleList;
              BU.CLIS(resultProcessSystemError, testDbTroubleList, count);
              // insert 1(신규), update 1, DB reject 2
              if (count === 1) {
                expect(resultProcessSystemError.insertTroubleList.length).to.be.equal(1);
                expect(resultProcessSystemError.updateTroubleList.length).to.be.equal(1);
                expect(resultProcessSystemError.dbTroubleList.length).to.be.equal(2);
              }
              // insert 2, update 0, DB reject 0
              else if (count === 2) {
                expect(resultProcessSystemError.insertTroubleList.length).to.be.equal(2);
                expect(resultProcessSystemError.updateTroubleList.length).to.be.equal(0);
                expect(resultProcessSystemError.dbTroubleList.length).to.be.equal(2);
              }
            }
          });
          done();
        });
      }

      // normal course
      if (true) {
        it('normal course', async () => {
          setConnectorConfig(true, 'dev', 'socket');
          BU.CLI(config);
          control = new Control(config);
          control.eventHandler();
          console.time('init - single dev');
          let controllerList = await Promise.all([
            control.createConnectorController(config.current.connectorList),
          ]);
          console.timeEnd('init - single dev');
          controllerList = control.model.getUpsasControllerGrouping('connector');
          BU.CLI(controllerList.length);
          control.p_Scheduler._measureConnector(new Date(), controllerList);

          let result = await eventToPromise(control, 'completeProcessConnectorData');
          BU.CLI(result);

          expect(result).to.not.be.deep.equal([]);
        });

      }
    });

    describe('connect Type: serial', () => {
      // it('error code', done => {

      // });
    });


  });

});