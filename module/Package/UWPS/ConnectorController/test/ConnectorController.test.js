const _ = require('underscore');

const {expect} = require('chai')

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

let hasTestModel = false;
let hasTestSocket = false;
let hasTestSerial = true;

describe('Connector Controller Test', () => {
  if(hasTestModel){
    describe('Model Test', () => {
      let control = new Control(config)
      // before(() => {
      //   control = new Control(config)
      // })
  
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
        }]
        let result = control.model.onData(connectorDataList);
        
        BU.CLI(result)
        expect(result.length).to.be.equal(config.current.moduleList.length)
        // BU.CLI(control.refineConnectorData)
  
        done()
      })
    })
  }

  if(hasTestSocket){
    describe('ConnectType: Socket', () => {
      before(() => {
        config.current.cntSavedInfo.connect_type = 'socket'
      })
      it('Category: dm_v2', done => {
        config.current.cntSavedInfo.target_category = 'dm_v2'
        const control = new Control(config)
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result)
            done();
          })
          .catch(error => {
            BU.CLI(error)
            done(error)
          })
      })
  
      it('Category: dev', done => {
        config.current.cntSavedInfo.target_category = 'dev'
        const control = new Control(config)
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result)
            done();
          })
          .catch(error => {
            done(error)
          })
      })
    })
  }

  if(hasTestSerial){
    describe('ConnectType: Serial', () => {
      before(() => {
        config.current.cntSavedInfo.connect_type = 'serial'
      })
  
      it('Category: (dm_v2, serial)', done => {
        config.current.cntSavedInfo.target_category = 'dm_v2'
        config.current.cntSavedInfo.port = 'COM11'
        const control = new Control(config)
        control.init()
          .then(result => {
            return control.measureDevice();
          })
          .then(result => {
            BU.CLI(result)
            done();
          })
          .catch(error => {
            BU.CLI(error)
            done(error)
          })
      })
  
    })
  }



})