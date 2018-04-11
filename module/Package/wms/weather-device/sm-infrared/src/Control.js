'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    this.config = config.current;

    // this.setDeviceClient(this.config.deviceInfo);

    this.model = new Model(this);
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init(){
    if(!this.config.hasDev){
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      require('./dummy')(this);
    }
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {{id: string, config: Object, data: {smRain: number}, systemErrorList: Array, troubleList: Array}} 
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      // systemErrorList: this.systemErrorList,
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
    // BU.CLI(data.toString());
    const resultData = this.model.onData(data);

    // BU.CLI(this.getDeviceOperationInfo().data); 

    // 현재 내리는 비가 변화가 생긴다면 이벤트 발생
    if(!_.isEmpty(resultData)){
      BU.CLI('이벤트 발생', resultData);
      this.emit('updateSmRainSensor', resultData);
    }

    // BU.CLI(this.getDeviceOperationInfo());
  }
}
module.exports = Control;