'use strict';

const bcjh = require('base-class-jh');
/** Class Dcoding 개발용 */
class DecoderForDev extends bcjh.Converter {
  constructor() {
    super();
  }

  /**
   * 개발용 Decoder. SM 기본 프로토콜을 사용하여 Parsing 후 contents 반환
   * @param {buffer} bufferData 
   * @return {Object[]} object[] -> baseFormat, 아니라면 throw Error
   */
  _receiveData(buffer) {
    let bufferBody = bcjh.classModule.resolveResponseMsgForTransfer(buffer);
    let result = JSON.parse(bufferBody.toString());

    return result.contents;
  }
}

module.exports = DecoderForDev;