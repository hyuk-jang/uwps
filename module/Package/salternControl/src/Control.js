'use strict';
const _ = require('lodash');

const BU = require('base-util-jh').baseUtil;


const SalternDevice = require('../SalternDevice'); 


const Model = require('./Model');

let config = require('./config');

const map = require('../config/map');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;

    // BU.CLI(this.config);
    this.model = new Model(this);

    this.map = map;

    /** @type {Array.<SalternDevice>} */
    this.routerList = [];
    this.modelList = map.setInfo.modelInfo;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init(){
    this.map.setInfo.connectInfoList.forEach(deviceConnectInfo => {
      let connectInfo = {
        type: deviceConnectInfo.type,
        subType: deviceConnectInfo.subType,
        port: deviceConnectInfo.port,
        baudRate: deviceConnectInfo.baudRate
      };
      deviceConnectInfo.deviceRouterList.forEach(routerInfo => {
        const salternDevice = new SalternDevice({current:{
          hasDev: false,
          deviceInfo: {
            target_id: routerInfo.targetId,
            // target_category: 'socket',
            // target_protocol: 'xbee',
            target_category: 'saltern',
            target_protocol: 'xbee',
            protocolConstructorConfig: {deviceId: routerInfo.deviceId} ,
            logOption:{
              hasCommanderResponse: true,
              hasDcError: true,
              hasDcEvent: true,
              hasReceiveData: true,
              hasDcMessage: true,
              hasTransferCommand: true
            },
            connect_info: connectInfo,
            modelList: routerInfo.nodeModelList
          }
        }});
        salternDevice.init();
        this.routerList.push(salternDevice);
      });
    });
  }

  getAllStatus(){
    
  }

  /**
   * 
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo 
   */
  excuteControl(controlInfo) {
    let orderList = [];
    controlInfo.trueList.forEach(modelId => {
      let orderInfo = {
        hasTrue: true,
        modelId: '' ,
        commandId: controlInfo.cmdName
      };
      let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
      orderInfo.modelId = modelInfo.targetId;
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    controlInfo.falseList.forEach(modelId => {
      let orderInfo = {
        hasTrue: true,
        modelId: '' ,
        commandId: controlInfo.cmdName
      };
      let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
      orderInfo.modelId = modelInfo.targetId;
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    return orderList;
  }

  /**
   * 
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo 
   */
  cancelControl(controlInfo){
    let orderList = [];
    controlInfo.trueList.forEach(modelId => {
      let orderInfo = {
        hasTrue: false,
        modelId: '' ,
        commandId: controlInfo.cmdName
      };
      let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
      orderInfo.modelId = modelInfo.targetId;
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    // controlInfo.falseList.forEach(modelId => {
    //   let orderInfo = {
    //     hasTrue: true,
    //     modelId: '' ,
    //     commandId: controlInfo.cmdName
    //   };
    //   let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
    //   orderInfo.modelId = modelInfo.targetId;
    //   orderList.push(foundRouter.orderOperation(orderInfo));
    // });

    return orderList;
  }

  findRouterAndModel(modelId){
    let modelInfo;

    let category =  _.findKey(this.modelList, modelList => {
      let foundIt = _.find(modelList, {targetId: modelId});
      if(!_.isEmpty(foundIt)){
        modelInfo = foundIt;
        return true;
      }
    });
    
    switch (category) {
    case 'waterDoorList':
      category = 'waterDoor';
      break;
    case 'valveList':
      category = 'valve';
      break;
    case 'pumpList':
      category = 'pump';
      break;
    default:
      break;
    }
    
    modelInfo.category = category;
    let foundRouter = _.find(this.routerList, router => {
      return _.includes(router.modelList, modelId);
    });

    return {foundRouter, modelInfo};
  }
  
  findModel(modelId){
    let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
    BU.CLIN(modelInfo);
    let deviceData = foundRouter && foundRouter.getData(modelInfo.category);

    BU.CLIN(deviceData);
  }

}
module.exports = Control;
