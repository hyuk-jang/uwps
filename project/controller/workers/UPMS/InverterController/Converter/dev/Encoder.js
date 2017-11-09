const BU = require('base-util-jh').baseUtil;


const Converter = require('../Converter.js');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();

    this.cmdList = {
      getOperation: 'operation',
      getPv: 'pv',
      getGrid: 'grid',
      getPower: 'power',
      getSystem: 'system',
      // getWeather: 'weather'
    }
  }

  makeMsg(){
    let returnValue = [];
    for(let ele in this.cmdList){
      let cmd = this.cmdList[ele];
      returnValue.push(BU.makeMessage({cmd}));
    }

    // BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncodingMsgSocket;