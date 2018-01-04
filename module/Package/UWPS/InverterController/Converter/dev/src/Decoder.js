'use strict'

const BU = require('base-util-jh').baseUtil;

const bcjh = require('base-class-jh');

class DecoderForDev extends bcjh.Converter {
  constructor(controller) {
    super();
    this.controller = controller;

  }

  _receiveData(buffer) {
    let bufferBody = bcjh.classModule.resolveResponseMsgForTransfer(buffer);
    let result = JSON.parse(bufferBody.toString());

    return result;
  }
}

module.exports = DecoderForDev;