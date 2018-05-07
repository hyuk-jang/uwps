'use strict';
const _ = require('lodash');

const BU = require('base-util-jh').baseUtil;

// const AbstDeviceClient = require('device-client-controller-jh');
const AbstDeviceClient = require('../../../../module/device-client-controller-jh');
// const {AbstConverter, operationController} = require('device-protocol-converter-jh');
const {AbstConverter, BaseModel} = require('../../../../module/device-protocol-converter-jh');
// const {AbstConverter, operationController} = require('../../../module/device-protocol-converter-jh');
const Model = require('./Model');

let config = require('./config');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    this.config = config.current;

    // BU.CLI(this.config);
    
    /** @type {string[]} */
    this.nodeModelList = config.current.deviceInfo.nodeModelList;
    
    


    this.id = this.config.deviceInfo.target_id;


    this.converter = new AbstConverter(this.config.deviceInfo.protocol_info);
    this.baseModel = new BaseModel.Saltern(this.config.deviceInfo.protocol_info.subCategory);

    this.model = new Model(this);

    this.observerList = [];
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
   * @param {Object} parent 
   */
  attch(parent){
    this.observerList.push(parent);
  }

  /**
   * 
   * @param {{hasTrue: boolean, modelId: string, commandId: string}} orderInfo 
   */
  orderOperation(orderInfo){
    BU.CLI(orderInfo);
    let modelId = orderInfo.modelId;

    let oper;

    if(orderInfo.hasTrue === true){
      if(_.includes(modelId, 'WD_')){
        oper = this.baseModel.WATER_DOOR.COMMAND.OPEN;
      } else if(_.includes(modelId, 'P_')){
        oper = this.baseModel.PUMP.COMMAND.ON;
      } else if(_.includes(modelId, 'V_')){
        oper = this.baseModel.VALVE.COMMAND.OPEN;
      }
    } else if(orderInfo.hasTrue === false){
      if(_.includes(modelId, 'WD_')){
        oper = this.baseModel.WATER_DOOR.COMMAND.CLOSE;
      } else if(_.includes(modelId, 'P_')){
        oper = this.baseModel.PUMP.COMMAND.OFF;
      } else if(_.includes(modelId, 'V_')){
        oper = this.baseModel.VALVE.COMMAND.CLOSE;
      }
    } else {
      if(_.includes(modelId, 'WD_')){
        oper = this.baseModel.WATER_DOOR.COMMAND.STATUS;
      } else if(_.includes(modelId, 'P_')){
        oper = this.baseModel.PUMP.COMMAND.STATUS;
      } else if(_.includes(modelId, 'V_')){
        oper = this.baseModel.VALVE.COMMAND.STATUS;
      }
    }
    /** @type {Array.<commandInfo>} */
    let cmdList = this.converter.generationCommand(oper);
    // BU.CLI(cmdList);
    if(this.config.deviceInfo.connect_info.type === 'socket'){
      cmdList.forEach(currentItem => {
        currentItem.data = JSON.stringify(currentItem.data);
      });
    }
    
    let commandSet =  this.generationManualCommand({cmdList: cmdList, commandId: orderInfo.commandId});
    // BU.CLIN(commandSet, 2);
    this.executeCommand(commandSet);
  }



  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   */
  getDeviceOperationInfo() {
    return {
      controller: this,
      id: this.id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code22223', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: []
    };
  }

  // /**
  //  * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
  //  * @param {dcEvent} dcEvent 
  //  */
  // updatedDcEventOnDevice(dcEvent) {
  //   // BU.log('updateDcEvent\t', dcEvent.eventName);
  //   switch (dcEvent.eventName) {
  //   case this.definedControlEvent.CONNECT:
  //     // var commandSet = this.generationManualCommand({cmdList:this.converter.generationCommand()});
  //     // this.executeCommand(commandSet);
  //     break;
  //   default:
  //     break;
  //   }
  // }



  /**
   * 
   * @param {string} category 
   */
  getDeviceData(category){
    // BU.CLI(category);
    return _.get(this.model.deviceData, category);
  }

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 명령 수행 결과 데이터
   */
  onDcData(dcData){
    // BU.CLIS(dcData.data);

    // TEST 개발용 Socket 일 경우 데이터 처리
    if(this.config.deviceInfo.connect_info.type === 'socket'){
      dcData.data = JSON.parse(dcData.data.toString());
      dcData.data.data = Buffer.from(dcData.data.data);
      BU.CLI(dcData.data);
    }

    try {
      let parsedData =  this.converter.parsingUpdateData(dcData);
  
      BU.CLI(parsedData);
      !this.config.hasDev && this.requestTakeAction(parsedData.eventCode);
  
      // BU.CLIS(parsedData.eventCode,this.definedCommanderResponse.DONE);
      if(parsedData.eventCode === this.definedCommanderResponse.DONE){
        this.model.onData(parsedData.data);
      }
  
      BU.CLI(this.getDeviceOperationInfo().id, this.getDeviceOperationInfo().data);

      // 옵저버에게 데이터 전달
      _.forEach(this.observerList, observer => {
        observer.notifyData(this);
      });
      
    } catch (error) {
      BU.CLI(error.name);
    }
  }
}
module.exports = Control;
