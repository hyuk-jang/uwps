const _ = require('underscore');

const {
  expect
} = require('chai');

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

let hasTestModel = false;

let hasSocketS_hex = true;
let s_hex_initTest = false;
let hasSocketDev = true;


describe('Inverter Controller Test', () => {
  if(hasTestModel){
    describe('Model Test', () => {
      let control = new Control(config);

      // 에러 계산되는지 체크
      it('error Test', done => {
        let result = {};
        let resFindWhere = null;
        result = control.model.onSystemError('Disconnected', true);
        // BU.CLI(result);
        resFindWhere = _.where(result, {code: 'Disconnected'});
        expect(resFindWhere.length).to.be.equal(1);
        expect(resFindWhere[0].occur_date instanceof Date).to.be.equal(true);
        result = control.model.onSystemError('Disconnected', true);
        resFindWhere = _.where(result, {code: 'Disconnected'});
        expect(resFindWhere.length).to.be.equal(1);
        result = control.model.onSystemError('Disconnected', false);
        resFindWhere = _.where(result, {code: 'Disconnected'});
        expect(resFindWhere.length).to.be.equal(0);
        result = control.model.onSystemError('Disconnected', false);
        resFindWhere = _.where(result, {code: 'Disconnected'});
        expect(resFindWhere.length).to.be.equal(0);
        result = control.model.onSystemError('Disconnected', true);
        result = control.model.onSystemError('Timeout Error', true);
        result = control.model.onSystemError('Protocol Error', true);
        expect(result.length).to.be.equal(3);
        BU.CLI(result);
        resFindWhere = _.where(result, {code: 'Disconnected'});
        expect(resFindWhere.length).to.be.equal(1);
        BU.CLI(result);
        // expect(result.obj.occur_date).to.be.equal(null);
        done();
      });
    });
  }

  // 접속방법 Socket 
  describe('ConnectType: Socket', () => {
    before(() => {
      config.current.deviceSavedInfo.connect_type = 'socket';
    });

    // 헥스 파워 단상 테스트
    if (hasSocketS_hex) {
      describe('Category: s_hex', () => {
        BU.CLI(config.current.deviceSavedInfo);
        config.current.deviceSavedInfo.target_category = 's_hex';
        const control = new Control(config);

        if (s_hex_initTest) {
          it('Category: s_hex', async() => {
            await control.init();
            control.on('completeSend2Msg', res => {
              BU.CLI(res);
            });
            control.on('errorSend2Msg', err => {
              BU.CLI(err);
            });


            let result = await control.measureDevice();
            BU.CLI(control.model.deviceData);
            expect(result).to.not.deep.equal({});
          });
        }

      });
    }

    // SM Dev 테스트
    if (hasSocketDev) {
      it('Category: dev', async() => {
        config.current.deviceSavedInfo.target_category = 'dev';
        const control = new Control(config);
        let obj = await control.init();
        control.on('completeSend2Msg', res => {
          BU.CLI(res);
        });
        control.on('errorSend2Msg', err => {
          BU.CLI(err);
        });

        let result = await control.measureDevice();


        BU.CLI(result);
        expect(result).to.not.deep.equal({});
      });
    }
  });

});