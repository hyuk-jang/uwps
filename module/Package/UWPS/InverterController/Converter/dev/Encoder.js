const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Converter = require('../Converter.js');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();
  }

  makeMsg(cmd){
    return BU.makeMessage({cmd});
  }
}

module.exports = EncodingMsgSocket;