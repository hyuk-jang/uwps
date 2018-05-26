'use strict';

const _ = require('lodash');
const {BU} = require('base-util-jh');

// const AbstDeviceClient = require('device-client-controller-jh');
const AbstDeviceClient = require('../../../../module/device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

// const {AbstConverter, controlFormat} = require('../../../../../../module/device-protocol-converter-jh');
const {AbstConverter, BaseModel} = require('../../../../module/device-protocol-converter-jh');
// const {AbstConverter} = require('device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    
    this.config = config.current;

    
    this.converter = new AbstConverter(this.config.deviceInfo.protocol_info);
    this.baseModel = new BaseModel.Inverter(this.config.deviceInfo.protocol_info);
    
    this.model = new Model(this);
    
    this.observerList = [];
  }

  get id(){
    return this.config.deviceInfo.target_id;
  }

  /** device client 설정 및 프로토콜 바인딩 */
  init(){
    /** 개발 버젼일 경우 Echo Server 구동 */
    if(this.config.hasDev){
      const EchoServer = require('../../../../module/device-echo-server-jh');
      const echoServer = new EchoServer(this.config.deviceInfo.connect_info.port);
      echoServer.attachDevice(this.config.deviceInfo.protocol_info);
    }
    this.setDeviceClient(this.config.deviceInfo);
    this.converter.setProtocolConverter(this.config.deviceInfo);
  }

  /**
   * 
   * @param {Object} parent 
   */
  attach(parent){
    this.observerList.push(parent);
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
   * 
   * @param {commandInfo[]} commandInfoList 
   */
  orderOperation(commandInfoList){
    // this.baseModel.BASE.DEFAULT.COMMAND.STATUS;
    let commandSet = this.generationManualCommand({
      cmdList: commandInfoList,
      commandId: this.id,
    });

    // BU.CLIN(commandSet);

    this.executeCommand(commandSet);
  }


  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent 
   */
  updatedDcEventOnDevice(dcEvent) {
    BU.log('updateDcEvent\t', dcEvent.eventName);
    try {
      switch (dcEvent.eventName) {
      case this.definedControlEvent.CONNECT:
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
    _.forEach(this.observerList, observer => {
      observer.notifyError(dcError, this);
    });

    // 선택지 1: 에러가 발생할 경우 해당 명령 무시하고 다음 명령 수행
    this.requestTakeAction(this.definedCommanderResponse.NEXT);

    

    // 에러가 발생하면 해당 명령을 모두 제거
    // return this.deleteCommandSet(dcError.commandSet.commandId);

  }

  /**
   * 메시지 발생 핸들러
   * @param {dcMessage} dcMessage 
   */
  onDcMessage(dcMessage){
    switch (dcMessage.msgCode) {
    // 계측이 완료되면 Observer에게 알림
    case this.definedCommandSetMessage.COMMANDSET_EXECUTION_TERMINATE:
      this.observerList.forEach(observer => {
        observer.notifyInverterData(this);
      });
      // this.emit('done', this.getDeviceOperationInfo());
      break;
    default:
      break;
    }
    
  }


  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcData(dcData){
    try {
      BU.CLI('data', dcData.data.toString());
      const parsedData = this.converter.parsingUpdateData(dcData);

      // 만약 파싱 에러가 발생한다면 명령 재 요청
      if (parsedData.eventCode === this.definedCommanderResponse.ERROR) {
        BU.errorLog('inverter', 'parsingError', parsedData.data);
        // return this.requestTakeAction(this.definedCommanderResponse.RETRY);
        return this.requestTakeAction(this.definedCommanderResponse.RETRY);
      }

      // Device Client로 해당 이벤트 Code를 보냄
      this.requestTakeAction(parsedData.eventCode);
      
      parsedData.eventCode === this.definedCommanderResponse.DONE && this.model.onData(parsedData.data);
      // BU.CLIN(this.getDeviceOperationInfo());
    } catch (error) {
      // BU.CLI(error);
      BU.logFile(error);      
    }
  }
}
module.exports = Control;