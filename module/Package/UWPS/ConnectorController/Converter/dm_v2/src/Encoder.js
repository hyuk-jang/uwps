const crc = require('crc')
const BU = require('base-util-jh').baseUtil;

const {Converter} = require('base-class-jh');
const protocol = require('./protocol');

class Encoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = protocol.encodingProtocolTable(dialing);
  }

  getBaseValue() {
    return {
      amp: null, // Ampere
      vol: null, // voltage
    }
  }


  generateMsg(obj) {
    let body = this.makeMsg2Buffer(Object.values(obj));

    let bufferStorage = Buffer.concat([
      this.STX,
      body,
      this.ETX
    ]);

    let crcValue = crc.crc16xmodem(bufferStorage.toString())

    let returnValue = [
      bufferStorage,
      this.convertNum2Hx2Buffer(crcValue, 2),
      this.EOT
    ]

    return Buffer.concat(returnValue)
  }

  makeSingleMsg(cmd) {
    try {
      let msg = this.protocolTable[cmd];
      // BU.CLI(msg)
      if (msg === undefined || BU.isEmpty(msg)) {
        return {};
      }
      return this.generateMsg(Object.values(this.protocolTable[key]))
    } catch (error) {
      throw error;
    }
  }

  makeMsg() {
    try {
      let returnValue = [];
      for (let key in this.protocolTable) {
        returnValue.push(this.generateMsg(Object.values(this.protocolTable[key])));
      }
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;