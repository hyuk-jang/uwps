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
    
    this.map = map;
    
    /** @type {Array.<SalternDevice>} */
    this.routerList = [];
    this.model = new Model(this);
  }

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
            target_category: 'saltern',
            logOption:{
              hasCommanderResponse: true,
              hasDcError: true,
              hasDcEvent: true,
              hasReceiveData: true,
              hasDcMessage: true,
              hasTransferCommand: true
            },
            protocol_info: {
              mainCategory: 'saltern',
              subCategory: 'xbee',
              deviceId: routerInfo.deviceId,
            },
            connect_info: connectInfo,
            nodeModelList: routerInfo.nodeModelList
          }
        }});
        salternDevice.init();
        salternDevice.attch(this);
        this.routerList.push(salternDevice);
      });
    });
  }

  getAllStatus(){
    return this.model.salternDeviceDataStorage;
  }


  /**
   * Saltern Device로 부터 데이터 갱신이 이루어 졌을때 자동 업데이트 됨.
   * @param {SalternDevice} salternController 
   */
  notifyData(salternController) {
    this.model.onData(salternController);

    BU.CLI(this.getAllStatus());
    return this.getAllStatus();
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
        modelId,
        commandId: controlInfo.cmdName
      };
      let foundRouter = this.model.findRouter(modelId);
      // BU.CLIN(foundRouter);
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    controlInfo.falseList.forEach(modelId => {
      let orderInfo = {
        hasTrue: false,
        modelId,
        commandId: controlInfo.cmdName
      };
      let foundRouter = this.model.findRouter(modelId);
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
    controlInfo.trueList = _.reverse(controlInfo.trueList);
    controlInfo.trueList.forEach(modelId => {
      let orderInfo = {
        hasTrue: false,
        modelId,
        commandId: controlInfo.cmdName
      };
      let foundRouter = this.model.findRouter(modelId);
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
}
module.exports = Control;


/**
 * @typedef {Object} deviceOperationInfo
 * @prop {SalternDevice} controller
 * @prop {string} id
 * @prop {Object} config
 * @prop {Object} data
 * @prop {Array.<systemError>} systemErrorList
 * @prop {Array.<systemError>} troubleList
 */

/**
 * @typedef {Object} systemError
 * @prop {string} code
 * @prop {string} msg
 * @prop {Date} occur_date
 */ 