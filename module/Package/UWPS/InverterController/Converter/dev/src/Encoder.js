'use strict';

const BU = require('base-util-jh').baseUtil;
const {Converter} = require('base-class-jh');

class EncoderForDev extends Converter {
  constructor() {
    super();

    this.cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ]
  }

  makeMsg(){
    let returnValue = [];
    this.cmdList.forEach(cmd => {
      returnValue.push(BU.makeMessage({cmd}));
    })
    // BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncoderForDev;