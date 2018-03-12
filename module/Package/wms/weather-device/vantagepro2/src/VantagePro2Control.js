'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');

const SmInfraredModel = require('./SmInfraredModel');

let si_config = require('./config');

class SmInfraredControl extends AbstDeviceClient {
  /** @param {Object} */
  constructor(config) {
    super();
    
    /** @type {si_config} */
    this.config = config;

    // this.setDeviceClient(this.config.current.deviceInfo);

    this.model = new SmInfraredModel(this);
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
      this.executeCommand();
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
    BU.CLI(data.toString());
    const resultData = this.model.onData(data);

    // 현재 내리는 비가 변화가 생긴다면 이벤트 발생
    if(!_.isEmpty(resultData)){
      this.emit('updateSmRainSensor', resultData);
    }
  }
}
module.exports = SmInfraredControl;