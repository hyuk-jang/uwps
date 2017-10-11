const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Converter = require('../Converter.js');
const s_hexProtocol = require('./s_hexProtocol');

class Encoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = s_hexProtocol.encodingProtocolTable(dialing);
  }

  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));

    // return Buffer.from(this.getSumBuffer(buf), 'hex');
  }

  makeMsg(cmd) {
    try {
      let msg = this.protocolTable[cmd];
      // BU.CLI(msg)
      if(msg === undefined || BU.isEmpty(msg)){
        return '';
      }
      let body = this.makeMsg2Buffer(Object.values(msg));
      let returnValue = [
        this.ENQ,
        body,
        this.getCheckSum(body), 
        this.EOT
      ];

      return Buffer.concat(returnValue)
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;