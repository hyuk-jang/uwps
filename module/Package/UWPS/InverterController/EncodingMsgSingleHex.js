const Converter = require('./Converter.js');
const singleHexProtocolTable = require('./singleHexProtocolTable.js');

class EncodingMsgSingleHex extends Converter {
  constructor(dialing) {
    super();
    this.cmdList = {};
    this.protocolTable = singleHexProtocolTable.encodingProtocolTable(dialing);
  }

  makeMsg(cmd) {
    try {
      let bufMsg = this.makeAscii2Buffer(Object.values(this.protocolTable[cmd]));
      // BU.CLIS(this.ENQ, bufMsg,this.getBufferCheckSum(bufMsg), this.EOT)
      return Buffer.concat([this.ENQ, bufMsg, this.getBufferCheckSum(bufMsg), this.EOT])
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EncodingMsgSingleHex;