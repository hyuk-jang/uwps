const Converter = require('./Converter.js');

const BU = require(process.cwd() + '/util/baseUtil.js');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();
  }

  makeMsg(cmd){
    return BU.makeMessage({cmd});
  }
}

module.exports = EncodingMsgSocket;