const Converter = require('../Converter.js');

const BU = require('../../module/baseUtil');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();
  }

  makeMsg(cmd){
    return BU.makeMessage({cmd});
  }
}

module.exports = EncodingMsgSocket;