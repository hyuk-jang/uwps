const BU = require('base-util-jh').baseUtil;


const Converter = require('../Converter.js');
const s5500kProtocol = require('./s5500kProtocol.js');

class Encoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = s5500kProtocol.encodingProtocolTable(dialing);
  }


  getCheckSum(buf) {
    return Buffer.from(this.getSumBuffer(buf), 'hex');
  }

  makeMsg(cmd) {
    try {
      let msg = this.protocolTable[cmd];
      if(msg === undefined || BU.isEmpty(msg)){
        return '';
      }
      let body = this.makeMsg2Buffer(Object.values(msg));
      let returnValue = [
        Buffer.from([0x0a, 0x96]),
        body,
        Buffer.from([0x05]),
        this.getCheckSum(body)
      ];

      return Buffer.concat(returnValue)
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;