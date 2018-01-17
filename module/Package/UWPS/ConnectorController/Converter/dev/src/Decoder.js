const bcjh = require('base-class-jh');

const {Converter} = bcjh;

class DecodingMsgSocket extends Converter {
  constructor() {
    super();
  }

  /**
   * 개발용 Decoder. SM 기본 프로토콜을 사용하여 Parsing 후 contents 반환
   * @param {Buffer} bufferData 
   * @return {Array.<{ch:number, amp:number, vol:number},>} object 아니라면 throw Error
   */
  _receiveData(bufferData) {
    // BU.CLI(bufferData)
    let resBody = bcjh.classModule.resolveResponseMsgForTransfer(bufferData);
    // BU.CLI(resBody)
    let resObj = JSON.parse(resBody.toString());
    if(resObj.isError == '1'){
      return new Error('데이터 이상');
    }
    return resObj.contents;
  }
}

module.exports = DecodingMsgSocket;