const _ = require('underscore');

const {expect} = require('chai')

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

global._ = _;
global.BU = BU;

describe('Inverter Controller Test', () => {
  describe('ConnectType: Socket', () => {
    before(() => {
      config.current.ivtSavedInfo.connect_type = 'socket'
    })
    it('Category: s_hex', done => {
      config.current.ivtSavedInfo.target_category = 's_hex'
      const control = new Control(config)
      control.init()
        .then(result => {
          return control.measureInverter();
        })
        .then(result => {
          BU.CLI(result)
          done();
        })
        .catch(error => {
          done(error)
        })
    })

    it('Category: dev', done => {
      config.current.ivtSavedInfo.target_category = 'dev'
      const control = new Control(config)
      control.init()
        .then(result => {
          return control.measureInverter();
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

})