'use strict';

const BU = require('base-util-jh').baseUtil;


const {Converter} = require('base-class-jh');

class EncodingMsgSocket extends Converter {
  constructor() {
    super();

    this.cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ]
  }

  makeMsg(){
    let returnValue = [];
    this.cmdList.forEach(ele => {
      let cmd = this.cmdList[ele];
      returnValue.push(BU.makeMessage({cmd}));
    })
    // BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncodingMsgSocket;