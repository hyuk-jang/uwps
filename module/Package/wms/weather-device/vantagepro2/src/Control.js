'use strict';
const {BU} = require('base-util-jh');

// const AbstDeviceClient = require('device-client-controller-jh');
const AbstDeviceClient = require('../../../../../module/device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

// const {AbstConverter, controlFormat} = require('../../../../../../module/device-protocol-converter-jh');
const {AbstConverter, BaseModel} = require('../../../../../module/device-protocol-converter-jh');
// const {AbstConverter} = require('device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    
    this.config = config.current;

    
    this.converter = new AbstConverter(this.config.deviceInfo.protocol_info);
    this.baseModel = new BaseModel.Weathercast(this.config.deviceInfo.protocol_info.subCategory);
    
    this.model = new Model(this);
    /** 주기적으로 LOOP 명령을 내릴 시간 인터벌 */
    this.executeCommandInterval = null;

    
  }

  get id(){
    return this.config.deviceInfo.target_id;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init(){
    if(!this.config.hasDev){
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      BU.CLI('생성기 호출', this.id);
      require('./dummy')(this);
    }
    this.converter.setProtocolConverter(this.config.deviceInfo);
  }


  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
      measureDate: new Date()
    };
  }


  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent 
   */
  updatedDcEventOnDevice(dcEvent) {
    BU.log('updateDcEvent\t', dcEvent.eventName);
    try {
      /** @type {Array.<commandInfo>} */
      let cmdList = this.converter.generationCommand();
      if (this.config.deviceInfo.connect_info.type === 'socket') {
        cmdList.forEach(currentItem => {
          currentItem.data = JSON.stringify(currentItem.data);
        });
      }
      switch (dcEvent.eventName) {
      case this.definedControlEvent.CONNECT:
        var commandSet = this.generationManualCommand({cmdList});
        this.executeCommand(commandSet);
        this.executeCommandInterval = setInterval(() => {
          this.executeCommand(commandSet);
          this.requestTakeAction(this.definedCommanderResponse.NEXT);
        }, 1000 * 60);
        break;
      default:
        break;
      }
      
    } catch (error) {
      BU.CLI(error);
    }
  }

  /**
   * 장치에서 명령을 수행하는 과정에서 생기는 1:1 이벤트
   * @param {dcError} dcError 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcError(dcError) {
    BU.CLI('dcError', dcError.errorInfo);
    if(dcError.errorInfo.message === this.definedOperationError.E_TIMEOUT){
      // BU.CLI('E_UNHANDLING_DATA');
      // controlInfo.hasReconnect 옵션이 켜져있기 때문에 장치 재접속으로 데이터 미수신 처리
      this.manager.disconnect();
    }
  }


  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcData(dcData){
    try {
      // BU.CLI('data', dcData.data.toString());
      const resultParsing = this.converter.parsingUpdateData(dcData);
      // BU.CLI(resultParsing);
      
      resultParsing.eventCode === this.definedCommanderResponse.DONE && this.model.onData(resultParsing.data);
      BU.CLIN(this.getDeviceOperationInfo());
    } catch (error) {
      BU.logFile(error);      
    }
  }
}
module.exports = Control;