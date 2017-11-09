const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;
class Model {
  constructor(controller) {
    this.controller = controller;

    this.config = controller.config;
    this.socketServerPort = 0;

    this.ampList = [];
    this.vol = 0;

    this.connectorData = {
      ampList: [],
      vol: null,
      // Operation Info
      isRun: null, // 접속반 동작 유무
      isError: null,  // 접속반 에러 발생 유무
      temperature: null,  // 접속반 온도
      errorList: null, // 에러 리스트 Array
      warningList: null // 경고 리스트 Array
    }

    this.operationInfo = {
      isRun: 0, // 인버터 동작 유무
      isError: 0, // 인버터 에러 발생 유무
      temperature: 0, // 인버터 온도
      errorList: [], // 에러 리스트 Array
      warningList: [] // 경고 리스트 Array
    }

    this.init();
  }

  init(){
    let count = 0;
    this.vol = this.config.pvData.vol;
    this.ampList = [];
    while(count++ < this.config.count){
      this.ampList.push(this.config.pvData.amp);
    }
  }
}

module.exports = Model;