const {expect} = require('chai')
const Encoder = require('../src/Encoder')

const BU = require('base-util-jh').baseUtil;
const _ = require('underscore');

describe('Encoder Test', () => {
  const cmdList = [
    'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
  ]
  it('make Dev Encoder Msg', done => {
    const result = [];
    cmdList.forEach(ele => {
      let cmd = cmdList[ele];
      result.push(BU.makeMessage({cmd}));
    })
    expect(result).to.be.ok;
    done();
  })
})