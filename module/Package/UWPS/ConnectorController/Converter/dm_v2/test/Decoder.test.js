const {expect} = require('chai');
const Decoder = require('../src/Decoder');

const BU = require('base-util-jh').baseUtil;

describe('Decoder Test', () => {
  let decoder;
  let receiveMsg;
  before(() => {
    const {Converter} = require('base-class-jh');
    const converter = new Converter();
    const crc = require('crc');

    let dummyMsg = 'R001,04,00440043004300436464642265016545,00420043004300436414654065396430,00440043004300436418648464416441,00430042004100426620657465296521';

    let msgBuffer = Buffer.concat([
      Buffer.from([0x02]),
      Buffer.from(dummyMsg),
      Buffer.from([0x03])
    ]);

    let crcValue = crc.crc16xmodem(msgBuffer.toString()); 
    // BU.CLI(crcValue.toString(16))
    receiveMsg = Buffer.concat([
      msgBuffer,
      converter.convertNum2Hx2Buffer(crcValue, 2),
      Buffer.from([0x04])
    ]);

    BU.CLI('receiveMsg', receiveMsg.toString());
  });
  
  it('Dummy Data Decoding Test', done => {
    console.log('Decoder ReceiveData');
    decoder = new Decoder();
    let result = decoder._receiveData(receiveMsg);

    expect(result).to.be.ok;
    console.log('result', result);
    done();
  });
});
