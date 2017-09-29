const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Converter = require('../Converter.js');
const singleHexProtocolTable = require('./singleHexProtocolTable.js');

class EncodingMsgSingleHex extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = singleHexProtocolTable.encodingProtocolTable(dialing);
  }

  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));

    return Buffer.from(this.getSumBuffer(buf), 'hex');
  }

  makeMsg(cmd) {
    try {
      let msg = this.protocolTable[cmd];
      if(msg === undefined || BU.isEmpty(msg)){
        return '';
      }
      let body = this.makeAsciiChr2Buffer(Object.values(msg));
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

module.exports = EncodingMsgSingleHex;