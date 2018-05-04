'use strict';
const _ = require('lodash');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');
// const AbstDeviceClient = require('../../../../module/device-client-controller-jh');
const {AbstConverter, operationController} = require('device-protocol-converter-jh');
// const {AbstConverter, operationController} = require('../../../../module/device-protocol-converter-jh');
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

    this.modelList = config.current.deviceInfo.modelList;

    this.operationInfo = operationController.saltern.xbee;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init(){
    if(!this.config.hasDev){
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      this.executeCommand = require('./dummy')(this);
    }
    this.converter.setProtocolConverter();
  }


  /**
   * 
   * @param {{hasTrue: boolean, modelId: string, commandId: string}} orderInfo 
   */
  orderOperation(orderInfo){
    BU.CLI(orderInfo);
    let modelId = orderInfo.modelId;

    BU.CLI(_.includes(modelId, 'V_') && orderInfo.hasTrue === true);
    BU.CLI(_.includes(modelId, 'P_') && orderInfo.hasTrue === true);
    // BU.CLIN(this.converter);
    BU.CLI(this.operationInfo.waterDoor);
    let oper;

    if(orderInfo.hasTrue === true){
      if(_.includes(modelId, 'WD_')){
        oper = this.operationInfo.waterDoor.OPEN;
      } else if(_.includes(modelId, 'P_')){
        oper = this.operationInfo.pump.ON;
      } else if(_.includes(modelId, 'V_')){
        oper = this.operationInfo.valve.OPEN;
      }
    } else if(orderInfo.hasTrue === false){
      if(_.includes(modelId, 'WD_')){
        oper = this.operationInfo.waterDoor.CLOSE;
      } else if(_.includes(modelId, 'P_')){
        oper = this.operationInfo.pump.OFF;
      } else if(_.includes(modelId, 'V_')){
        oper = this.operationInfo.valve.CLOSE;
      }
    } else {
      if(_.includes(modelId, 'WD_')){
        oper = this.operationInfo.waterDoor.STATUS;
      } else if(_.includes(modelId, 'P_')){
        oper = this.operationInfo.pump.STATUS;
      } else if(_.includes(modelId, 'V_')){
        oper = this.operationInfo.valve.STATUS;
      }
    }
    let cmdList = this.converter.generationCommand(oper);
    let commandSet =  this.generationManualCommand({cmdList: cmdList, commandId: orderInfo.commandId});

    BU.CLIN(commandSet);
    this.executeCommand(commandSet);
    // return commandSet.cmdList;
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



  getData(category){
    BU.CLI(category);
    return this.model.deviceData[category];
  }

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 명령 수행 결과 데이터
   */
  onDcData(dcData){
    BU.CLIS(dcData.data);

    try {
      let parsedData =  this.converter.parsingUpdateData(dcData);
  
      BU.CLI(parsedData);

      !this.config.hasDev && this.requestTakeAction(parsedData.eventCode);
  
      // BU.CLIS(parsedData.eventCode,this.definedCommanderResponse.DONE);
      if(parsedData.eventCode === this.definedCommanderResponse.DONE){
        this.model.onData(parsedData.data);
      }
  
      BU.CLI(parsedData);
      // const resultData = this.model.onData(data);
  
      // BU.CLIN(this.getDeviceOperationInfo());
      
    } catch (error) {
      BU.CLI(error.name);
    }
  }
}
module.exports = Control;
