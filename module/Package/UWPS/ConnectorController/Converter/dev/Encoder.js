const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Converter = require('../Converter.js');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();

    this.cmdList = {
      getOperation: 'operation',
      getPv: 'vol',
      getGrid: 'ampList',
      // getWeather: 'weather'
    }
  }

  makeMsg(){
    let returnValue = [];
    for(let ele in this.cmdList){
      let cmd = this.cmdList[ele];
      returnValue.push(BU.makeMessage({cmd}));
    }

    BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncodingMsgSocket;