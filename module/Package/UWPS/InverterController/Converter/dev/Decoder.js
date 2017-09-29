const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Converter = require('../Converter.js');

class DecodingMsgSocket extends Converter {
  constructor(controller) {
    super();
    this.controller = controller;

  }
  
  fault(resObj) {
    let storage = [];
    if(_.isArray(resObj.contents)){
      storage = resObj.contents;
    } else {
      storage.push(resObj.contents);
    }

    let returnValue = {
      cmd: resObj.cmd,
      contents: storage
    }

    return returnValue;
  }

  pv(resObj) {
    let returnValue = {
      cmd: resObj.cmd,
      contents: this.applyObjCalculateScale(resObj.contents, 1)
    }

    return returnValue;
  }

  grid(resObj) {
    let returnValue = {
      cmd: resObj.cmd,
      contents: this.applyObjCalculateScale(resObj.contents, 1)
    }

    return returnValue;
  }

  power(resObj) {
    let returnValue = {
      cmd: resObj.cmd,
      contents: this.applyObjCalculateScale(resObj.contents, 1, 4)
    }

    return returnValue;
  }

  sysInfo(resObj) {
    let returnValue = {
      cmd: resObj.cmd,
      contents: resObj.contents
    }
    return returnValue;
  }

  weather(resObj) {
    let returnValue = {
      cmd: resObj.cmd,
      contents: this.applyObjCalculateScale(resObj.contents, 1)
    }

    return returnValue;
  }

  _receiveData(socketData) {
    socketData = typeof socketData === 'string' ? JSON.parse(socketData) : socketData;
    return this[socketData.cmd](socketData);
  }
}

module.exports = DecodingMsgSocket;