const {expect} = require('chai')
const Encoder = require('../src/Encoder')

const BU = require('base-util-jh').baseUtil;
const _ = require('underscore');

describe('Encoder Test', () => {
  let encoder
  let cmdList
  
  before(() => {
    encoder = new Encoder(Buffer.from([0x30, 0x31]));
    cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ]
  })

  it('makeMsg Test', done => {
    let result = encoder.makeMsg()
    console.trace(result)
    expect(result).to.be.ok
    done()
  })

  it('makeMsg single Test', done => {
    BU.CLI(cmdList)
    cmdList.forEach(ele => {
      let result = encoder.makeSingleMsg(ele);
      BU.CLI(ele, result)
      expect(result).to.be.ok
    })
    done()
  })
})