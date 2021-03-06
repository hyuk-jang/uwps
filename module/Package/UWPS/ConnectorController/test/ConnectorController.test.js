const _ = require('underscore');

const {expect} = require('chai');

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

let hasTestModel = true;
let hasTestSocket = true;
let hasTestSerial = false;

describe('Connector Controller Test', () => {
  if(hasTestModel){
    describe('Model Test', () => {
      let control = new Control(config);
      // Model에서 모듈 seq 찾아 가는지 테스트
      it('parsing Data', done => {
        let connectorDataList = [{
          ch: 1,
          amp: 3.3,
          vol: 214.3
        },{
          ch: 2,
          amp: 3.2,
          vol: 226.3
        },{
          ch: 4,
          amp: 3.6,
          vol: 215.8
        },{
          ch: 3,
          amp: 3.1,
          vol: 212.9
        },{
          ch: 5,
          amp: 3.5,
          vol: 212.9
        },{
          ch: 6,
          amp: 3.6,
          vol: 212.9
        }];
        let result = control.model.onData(connectorDataList);
        
        BU.CLI(result);
        expect(result.length).to.be.equal(config.current.moduleList.length);
        // BU.CLI(control.refineConnectorData)
  
        done();
      });

      // 에러 계산되는지 체크
      it('error Test', done => {
        let result = {};
        result = control.model.onTroubleData('Disconnected Connector', true);
        BU.CLI(result);
        expect(result.obj.fix_date).to.be.equal(null);
        result = control.model.onTroubleData('Disconnected Connector', true);
        result = control.model.onTroubleData('Disconnected Connector', false);
        result = control.model.onTroubleData('Disconnected Connector', false);
        result = control.model.onTroubleData('Disconnected Connector', true);
        expect(result.obj.fix_date).to.be.equal(null);
        done();
      });
    });
  }

  if(hasTestSocket){
    describe('ConnectType: Socket', () => {
      before(() => {
        config.current.deviceSavedInfo.connect_type = 'socket';
      });
      it('Category: dm_v2', done => {
        config.current.deviceSavedInfo.target_category = 'dm_v2';
        BU.CLI(config);
        const control = new Control(config);
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result);
            done();
          })
          .catch(error => {
            BU.CLI(error);
            done(error);
          });
      });
  
      it('Category: dev', done => {
        config.current.deviceSavedInfo.target_category = 'dev';
        const control = new Control(config);
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result);
            done();
          })
          .catch(error => {
            done(error);
          });
      });
    });
  }

  if(hasTestSerial){
    describe('ConnectType: Serial', () => {
      before(() => {
        config.current.deviceSavedInfo.connect_type = 'serial';
      });
  
      it('Category: (dm_v2, serial)', done => {
        config.current.deviceSavedInfo.target_category = 'dm_v2';
        config.current.deviceSavedInfo.port = 'COM11';
        const control = new Control(config);
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result);
            done();
          })
          .catch(error => {
            BU.CLI(error);
            done(error);
          });
      });
  
    });
  }



});