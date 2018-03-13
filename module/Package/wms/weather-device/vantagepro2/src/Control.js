'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

const {AbstConverter, weathercastProtocolFormat} = require('device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    
    this.config = config.current;

    this.model = new Model(this);

    this.converter = new AbstConverter(this.config.deviceInfo);

    this.executeCommandInterval = null;
  }


  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {{id: string, data: weathercastProtocolFormat, systemErrorList: Array, troubleList: Array}} 
   */
  getDeviceStatus() {
    return {
      id: this.config.deviceInfo.target_id,
      data: this.model.deviceData,
      systemErrorList: this.systemErrorList,
      troubleList: []
    };
  }



  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {string} eventName 'dcConnect', 'dcClose', 'dcError'
   * @param {*=} eventMsg 
   */
  updateDcEvent(eventName, eventMsg) {
    BU.log('updateDcEvent\t', eventName, eventMsg);
    switch (eventName) {
    case 'dcConnect':
      this.executeCommandInterval ? clearInterval(this.executeCommandInterval) : null;
      var cmdList = this.converter.generationCommand();
      this.executeCommand(cmdList);
      this.executeCommandInterval = setInterval(() => {
        this.executeCommand(cmdList);
        this.requestNextCommand();
      }, 1000 * 60);
      break;
    default:
      break;
    }
  }




  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Buffer} data 명령 수행 결과 데이터
   */
  updateDcData(processItem, data){
    BU.CLI('data');
    const resultParsing = this.converter.parsingUpdateData(processItem.cmdList[processItem.currCmdIndex], data);
    if(resultParsing.eventCode === 'done'){
      this.requestTakeAction('wait');
    }
    this.model.onData(resultParsing.data);

    BU.CLIN(this.getDeviceStatus());
  }
}
module.exports = Control;