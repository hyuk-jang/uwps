'use strict';

const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');

class EncoderForDev extends bcjh.Converter {
  constructor() {
    super();

    this.cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ]
  }

  makeMsg(){
    let returnValue = [];
    this.cmdList.forEach(cmd => {
      let bufferMsg = bcjh.classModule.makeRequestMsgForTransfer(cmd)
      returnValue.push(bufferMsg);
    })
    // BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncoderForDev;