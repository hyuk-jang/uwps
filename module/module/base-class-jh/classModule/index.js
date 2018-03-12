const crc = require('crc')
const Converter = require('../Converter');

module.exports = {
  /**
   * STX + Buffer(msg) + ETX + CRC(4Byte) + EOT 
   * @param {String} msg 전송 Body
   * @return {Buffer} 
   */
  makeRequestMsgForTransfer: (msg) => {
    const converter = new Converter();
    try {
      if (msg == null) {
        return new SyntaxError;
      }
      let body = converter.makeMsg2Buffer(msg);

      let bufferStorage = Buffer.concat([
        converter.STX,
        body,
        converter.ETX
      ]);

      let crcValue = crc.crc16xmodem(bufferStorage.toString())

      let returnValue = [
        bufferStorage,
        converter.convertNum2Hx2Buffer(crcValue, 2),
        converter.EOT
      ]

      return Buffer.concat(returnValue)
    } catch (error) {
      throw error;
    }
  },
  /**
   * Buffer 분석하여 데이터 돌려줌
   * @param {Buffer} buf
   * @return {Buffer}
   */
  resolveResponseMsgForTransfer: (buf) => {
    // BU.CLI(buf)
    const converter = new Converter();

    let indexSTX = buf.indexOf(0x02)
    let indexETX = buf.indexOf(0x03)
    let indexEOT = buf.indexOf(0x04)
    let crcValue = buf.slice(indexETX + 1, indexEOT)
    let bufBody = buf.slice(0, indexETX + 1)
    // BU.CLI(bufBody)
    
    let baseCrcValue = crc.crc16xmodem(bufBody.toString())
    // BU.CLI(baseCrcValue)

    if (crcValue.toString() === baseCrcValue.toString(16)) {
      return buf.slice(indexSTX + 1, indexETX)
    } else {
      throw 'Crc Error'
    }
  }
}