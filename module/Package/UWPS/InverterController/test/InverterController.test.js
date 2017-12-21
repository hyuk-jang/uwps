const {expect} = require('chai')
const Decoder = require('../src/Control')

const BU = require('base-util-jh').baseUtil;

const Control = require('../src/Control.js');
const config = require('../src/config.js');

describe('Inverter Controller Test', () => {
  let control

  before(() => {
    control = new Control(config)
  })

  it('normal course', done => {
    control.init()
    .then(result => {
      BU.CLI('result')
      return control.measureInverter();
    })
    .then(result => {
      done();
    })
    .catch(error => {
      BU.CLI(error)
    })
  })

  after(() => {

    

    it('get Data', done => {
      for (let ele in control.cmdList) {
        setTimeout(() => {
          control.send2Cmd(control.cmdList[ele])
          .then()
          .catch(error => {
            setTimeout(() => {
              control.send2Cmd(control.cmdList[ele])
            }, 1000);
          });
        }, 1000)
      }
    })
  
  })




})