const {expect} = require('chai')
const Encoder = require('../src/Encoder')

const BU = require('base-util-jh').baseUtil;
const NU = require('base-util-jh').newUtil;
const _ = require('underscore');

describe('Encoder Test', () => {
  let encoder
  before(() => {
    encoder = new Encoder(Buffer.from([0x30, 0x30, 0x32]));
  })

  it('makeMsg Test', done => {
    let result = encoder.makeMsg()
    // console.trace(result)
    expect(result).to.be.ok
    done()
  })
})