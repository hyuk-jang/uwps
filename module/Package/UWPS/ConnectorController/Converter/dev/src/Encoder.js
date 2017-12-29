const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');
const {Converter} = bcjh;

class EncodingMsgSocket extends Converter {
  constructor() {
    super();

  }

  /**
   * @return {Buffer}
   */
  makeMsg(){
    let returnValue = bcjh.classModule.makeRequestMsgForTransfer('pv')
    return [returnValue];
  }
}

module.exports = EncodingMsgSocket;