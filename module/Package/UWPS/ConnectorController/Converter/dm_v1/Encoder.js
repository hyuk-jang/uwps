const node_modbus = require('node-modbus');

const BU = require('base-util-jh').baseUtil;


const Converter = require('../Converter.js');
const protocol = require('./protocol');

class Encoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = protocol.encodingProtocolTable(dialing);
  }

  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));
  }

  makeSingleMsg(cmd) {
    try {
      let msg = this.protocolTable[cmd];
      // BU.CLI(msg)
      if(msg === undefined || BU.isEmpty(msg)){
        return {};
      }
      let body = this.makeMsg2Buffer(Object.values(msg));
      let returnValue = [
        this.STX,
        body,
        this.getCheckSum(body), 
        this.EOT
      ];

      return Buffer.concat(returnValue)
    } catch (error) {
      throw error;
    }
  }

  makeMsg() {
    try {
      let returnValue = [];
      BU.CLI(this.protocolTable)
      for(let key in this.protocolTable){
        let body = this.makeMsg2Buffer(Object.values(this.protocolTable[key])) ;
        let msg = [
          body,
          this.getCheckSum(body), 
        ];
        returnValue.push(Buffer.concat(msg));
      }
      // BU.CLI(returnValue)
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;