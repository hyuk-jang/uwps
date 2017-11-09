const BU = require('base-util-jh').baseUtil;


const Converter = require('../Converter.js');

class DecodingMsgSocket extends Converter {
  constructor(controller) {
    super();
    this.controller = controller;

  }
  
  _receiveData(socketData) {
    return JSON.parse(socketData);
  }
}

module.exports = DecodingMsgSocket;