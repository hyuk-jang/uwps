const {
  expect
} = require('chai');
const _ = require('underscore');
const Promise = require('bluebird');
const eventToPromise = require('event-to-promise');

const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

const setInverterConfig = (hasDev, target_type, target_category, connect_type) => {
  config.current.inverterList.forEach(element => {
    element.current.hasDev = hasDev;
    element.current.deviceSavedInfo.target_type = target_type;
    element.current.deviceSavedInfo.target_category = target_category;
    element.current.deviceSavedInfo.connect_type = connect_type;
  });
};

describe('UPSAS Inverter Controller Test', () => {
  describe('category: single dev', () => {
    describe('connect Type: socket', () => {
      let control = new Control(config);
      let upsasDataGroup;
      let model;
      // let dbTroubleList;
      // let inverterData;
      // Create Inverter Controller
      if (true) {
        it('createContoller', async () => {
          // setInverterConfig(true, 'single', 's_hex', 'serial');
          BU.CLI(config);
          control = new Control(config);
          control.eventHandler();
          console.time('init - single dev');
          let result = await Promise.all([
            control.createInverterController(config.current.inverterList),
          ]);
          console.timeEnd('init - single dev');


          expect(result).to.not.be.deep.equal([]);
        });
      }

      // measure Inverter(single, dev, socket)
      if (false) {
        it('measure Inverter(single, dev, socket)', async () => {
          model = control.model;
          // 인버터 리스트 계측 명령
          console.time('_measureInverter');
          let measureDataList = await control.p_Scheduler._measureInverter(new Date(), control.model.getUpsasControllerGrouping('inverter'));
          console.timeEnd('_measureInverter');
          // measureDataList;
          measureDataList.forEach(ele => {
            expect(ele.data).to.not.deep.equal({});
          });

          // 해당 Device Type으로 초기화한 데이터와 잘 들어가는지 확인.
          upsasDataGroup = model.onMeasureDeviceList(new Date(), measureDataList, 'inverter');
          // BU.CLI(upsasDataGroup);
          expect(upsasDataGroup).to.not.be.deep.equal({});

          expect(true).be.ok;
        });
      }

      // inverter System Error Test
      if (false) {
        it('inverter System Error Test', done => {
          let testDbTroubleList = [{
            inverter_trouble_data_seq: 11,
            inverter_seq: 1,
            is_error: 1,
            code: 'Disconnected',
            msg: 'DisConnected !!!',
            occur_date: new Date(),
            fix_date: null
          }, {
            inverter_trouble_data_seq: 13,
            inverter_seq: 3,
            is_error: 1,
            code: 'Disconnected',
            msg: 'DisConnected !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            inverter_trouble_data_seq: 4,
            inverter_seq: 1,
            is_error: 1,
            code: 'remainError',
            msg: 'remainError !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            inverter_trouble_data_seq: 2,
            inverter_seq: 2,
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
              msg: '인버터 장치 접속 끊김',
              occur_date: new Date()
            }, {
              code: 'Timeout Error',
              msg: '탐 아웃',
              occur_date: new Date()
            }];
            // BU.CLI(testSystemErrorList);
            // 시스템 에러가 있다면 
            if (testSystemErrorList.length) {
              const resultProcessSystemError = model.processDeviceErrorList(testSystemErrorList, testDbTroubleList, dataObj, true, 'inverter');
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

      // inverter trouble Test
      if (false) {
        it('inverter trouble Test', done => {
          let testDbTroubleList = [{
            inverter_trouble_data_seq: 11,
            inverter_seq: 1,
            is_error: 0,
            code: 'Line failure fault',
            msg: 'Line failure fault !!!',
            occur_date: new Date(),
            fix_date: null
          }, {
            inverter_trouble_data_seq: 13,
            inverter_seq: 3,
            is_error: 0,
            code: 'Inverter O.C. overtime fault',
            msg: 'Inverter O.C. overtime fault !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            inverter_trouble_data_seq: 4,
            inverter_seq: 1,
            is_error: 0,
            code: 'Inverter O.C. overtime fault',
            msg: 'Line failure fault !!!',
            occur_date: new Date(),
            fix_date: null
          },
          {
            inverter_trouble_data_seq: 2,
            inverter_seq: 2,
            is_error: 0,
            code: 'Inverter O.C. overtime fault',
            msg: '태양전지 저전압 (변압기 type Only) !!!',
            occur_date: new Date(),
            fix_date: null
          }, {
            inverter_trouble_data_seq: 8,
            inverter_seq: 1,
            is_error: 1,
            code: 'remainError',
            msg: 'remainError !!!',
            occur_date: new Date(),
            fix_date: null
          },
          ];
          let count = 0;
          upsasDataGroup.storage.forEach(dataObj => {
            count += 1;
            // BU.CLI(dataObj);
            let testTroubleList = [{
              code: 'Line failure fault',
              msg: 'Line failure fault',
            }, {
              code: 'inverter over temperature fault',
              msg: 'inverter over temperature fault',
            }];
            // BU.CLI(testSystemErrorList);
            // 시스템 에러가 있다면 
            if (testTroubleList.length) {
              const resultProcessErrorList = model.processDeviceErrorList(testTroubleList, testDbTroubleList, dataObj, false, 'inverter');
              testDbTroubleList = resultProcessErrorList.dbTroubleList;
              // BU.CLIS(resultProcessErrorList, testDbTroubleList, count);
              // insert 1(신규), update 2, DB reject 3
              if (count === 1) {
                expect(resultProcessErrorList.insertTroubleList.length).to.be.equal(1);
                expect(resultProcessErrorList.updateTroubleList.length).to.be.equal(2);
                expect(resultProcessErrorList.dbTroubleList.length).to.be.equal(2);
              }
              // insert 2, update 1, DB reject 1
              else if (count === 2) {
                expect(resultProcessErrorList.insertTroubleList.length).to.be.equal(2);
                expect(resultProcessErrorList.updateTroubleList.length).to.be.equal(1);
                expect(resultProcessErrorList.dbTroubleList.length).to.be.equal(1);
              }
            }
          });
          done();
        });


        if (true) {
          it('inverter processMeasureData Test', async () => {
            model = control.model;
            let upsasDataGroup = await model.processMeasureData('inverter');
            // BU.CLI(upsasDataGroup);

            // insert, update 결과 확인
            let applyUpsasDataGroup = await model.applyingMeasureDataToDb(upsasDataGroup);
            // BU.CLI(applyUpsasDataGroup);

            expect(upsasDataGroup).to.not.deep.equal({});
          });
        }
      }

      // normal course
      if (false) {
        it('normal course', async () => {
          setInverterConfig(true, 'single', 's_hex', 'socket');
          // BU.CLI(config);
          control = new Control(config);
          control.eventHandler();
          console.time('init - single dev');
          let controllerList = await Promise.all([
            control.createInverterController(config.current.inverterList),
          ]);
          console.timeEnd('init - single dev');
          BU.CLI(controllerList.length);
          controllerList = control.model.getUpsasControllerGrouping('inverter');
          BU.CLI(controllerList.length);
          control.p_Scheduler._measureInverter(new Date(), controllerList);

          let result = await eventToPromise(control, 'completeProcessInverterData');
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