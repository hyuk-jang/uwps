const {
  expect
} = require('chai');
const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');

const Encoder = require('../src/Encoder');
const Decoder = require('../src/Decoder');

global.BU = BU;

describe('dummy Connector Test', () => {
  let encoder = new Encoder();
  let decoder = new Decoder();

  it('Encoding Test', done => {
    // 보내는  msg는 'pv' 하나만
    let result = encoder.makeMsg();
    console.trace(result);
    result = encoder.makeSingleMsg('pv');
    console.trace(result);
    expect(result).to.be.ok;
    done();
  });

  it('Decoding Test', done => {
    const sendObj = {
      cmd: 'none',
      isError: 0,
      contents: ''
    };
    const gridList = [];
    // ch 숫자에 맞춰서 TEST 데이터 생성
    for (let cnt = 1; cnt <= 4; cnt++) {
      gridList.push({
        amp: 15.3,
        vol: 223.3,
        ch: cnt
      });
    }

    sendObj.cmd = 'pv';
    sendObj.contents = gridList;

    let bufferMsg = bcjh.classModule.makeRequestMsgForTransfer(sendObj);
    BU.CLI(bufferMsg);

    let result = decoder._receiveData(bufferMsg);
    BU.CLI(result);

    done();
  });


});