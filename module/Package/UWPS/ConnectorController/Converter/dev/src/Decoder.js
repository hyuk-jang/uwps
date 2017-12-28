const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');


const {Converter} = bcjh;

class DecodingMsgSocket extends Converter {
  constructor(controller) {
    super();
    this.controller = controller;

  }

  /**
   * 
   * @param {Buffer} bufferData 
   * @return {Json} Json Object 
   */
  _receiveData(bufferData) {
    // BU.CLI(bufferData)
    let resBody = bcjh.classModule.resolveResponseMsgForTransfer(bufferData)
    // BU.CLI(resBody)
    let resObj = JSON.parse(resBody.toString());
    if(resObj.isError == '1'){
      return new Error('데이터 이상')
    }
    return resObj.contents;
  }
}

module.exports = DecodingMsgSocket;