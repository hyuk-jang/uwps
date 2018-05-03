'use strict';
const _ = require('lodash');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');
// const AbstDeviceClient = require('../../../module/device-client-controller-jh');
const {AbstConverter, operationController} = require('device-protocol-converter-jh');
// const {AbstConverter, operationController} = require('../../../module/device-protocol-converter-jh');
const Model = require('./Model');

let config = require('./config');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    this.config = config.current;

    // BU.CLI(this.config);
    this.model = new Model(this);

    this.converter = new AbstConverter(this.config.deviceInfo);
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
    this.converter.setProtocolConverter();
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
      // systemErrorList: [{code: 'new Code22223', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: []
    };
  }

  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent 
   */
  updatedDcEventOnDevice(dcEvent) {
    BU.log('updateDcEvent\t', dcEvent.eventName);
    switch (dcEvent.eventName) {
    case this.definedControlEvent.CONNECT:
      // var commandSet = this.generationManualCommand({cmdList:this.converter.generationCommand()});
      // this.executeCommand(commandSet);
      break;
    default:
      break;
    }
  }

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 명령 수행 결과 데이터
   */
  onDcData(dcData){
    // BU.CLIS(dcData.commandSet.cmdList[dcData.commandSet.currCmdIndex], dcData.data);

    let parsedData =  this.converter.parsingUpdateData(dcData);

    this.requestTakeAction(parsedData.eventCode);

    // BU.CLIS(parsedData.eventCode,this.definedCommanderResponse.DONE);
    if(parsedData.eventCode === this.definedCommanderResponse.DONE){
      this.model.onData(parsedData.data);
    }

    // BU.CLI(parsedData);
    // const resultData = this.model.onData(data);

    // BU.CLIN(this.getDeviceOperationInfo());
  }
}
module.exports = Control;
