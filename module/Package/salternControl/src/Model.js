'use strict';
const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

const Control = require('./Control');

const SalternDevice = require('../SalternDevice'); 


// const map =require('../config/map');
const {BaseModel} = require('../../../module/device-protocol-converter-jh');



class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    // BU.CLIN(controller);
    this.map = controller.map;
    this.routerList = controller.routerList;

    this.baseModel = new BaseModel.Saltern(controller.config.deviceInfo.protocol_info);

    // Device Model Storage 초기화
    this.init();

    this.commandStorage = {};
  }

  init(){
    this.salternDeviceDataStorage = this.map.setInfo.modelInfo;

    _.forEach(this.salternDeviceDataStorage, (deviceGroup) => {
      deviceGroup.forEach(currentItem => {
        // let foundIt = this.findRouter(currentItem.targetId);
        currentItem.targetData = this.baseModel.DEFAULT.STATUS.UNDEF;
        // currentItem.salternRouter = foundIt;
      });
    });
  }

  /**
   * 
   * @param {string} category waterDoorList, pumpList, ...etc
   */
  getDeviceCategory(category) {
    switch (category) {
    case [this.baseModel.WATER_DOOR.KEY]:
        
      break;
    
    default:
      break;
    }
  }

  /**
   * 
   * @param {string} targetId 
   */
  findDataStorage(targetId) {
    let returnValue = {
      category: '',
      model: {}
    };
    if(_.includes(targetId, 'WD_')){
      returnValue.category = this.baseModel.WATER_DOOR.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.WATER_DOOR.KEY], {targetId});
    } else if(_.includes(targetId, 'P_')){
      returnValue.category = this.baseModel.PUMP.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.PUMP.KEY], {targetId});
    } else if(_.includes(targetId, 'V_')){
      returnValue.category = this.baseModel.VALVE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.VALVE.KEY], {targetId});
    } else if(_.includes(targetId, 'WL_')){
      returnValue.category = this.baseModel.WATER_LEVEL.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.WATER_LEVEL.KEY], {targetId});
    } else if(_.includes(targetId, 'S_')){
      returnValue.category = this.baseModel.SALINITY.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.SALINITY.KEY], {targetId});
    } else if(_.includes(targetId, 'WT_')){
      returnValue.category = this.baseModel.WATER_TEMPERATURE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.WATER_TEMPERATURE.KEY], {targetId});
    } else if(_.includes(targetId, 'MFT_')){
      returnValue.category = this.baseModel.MODULE_FRONT_TEMPERATURE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.MODULE_FRONT_TEMPERATURE.KEY], {targetId});
    } else if(_.includes(targetId, 'MRT_')){
      returnValue.category = this.baseModel.MODULE_REAR_TEMPERATURE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage[this.baseModel.MODULE_REAR_TEMPERATURE.KEY], {targetId});
    }
    return returnValue;
  }



  /**
   * @param {string} modelId 
   */
  findRouter(modelId){
    let foundRouter = _.find(this.routerList, router => {
      return _.includes(router.nodeModelList, modelId);
    });

    return foundRouter;
  }

  /**
   * @param {SalternDevice} salternDevice 
   */
  onData(salternDevice){
    let operationInfo = salternDevice.getDeviceOperationInfo();

    const commandStorage = salternDevice.manager.commandStorage;
    // commandStorage.standbyCommandSetList;

    // let currentCommandSet = _.clone(commandStorage.currentCommandSet);
    // currentCommandSet.commandId;
    // currentCommandSet.commandName;
    this.commandStorage = {
      currentCommandSet: _.pick(commandStorage.currentCommandSet, ['commandType', 'commandId', 'commandName']),
      standbyCommandSetList: [],
      delayCommandSetList: []
    };

    _.forEach(commandStorage.standbyCommandSetList, storage => {
      _.forEach(storage.list, commandSet => {
        this.commandStorage.standbyCommandSetList.push(_.pick(commandSet, ['commandType', 'commandId', 'commandName']));
      });
    });

    // commandStorage.currentCommandSet;

    _.forEach(commandStorage.delayCommandSetList, storage => {
      this.commandStorage.delayCommandSetList.push(_.pick(storage, ['commandType', 'commandId', 'commandName']));
    });

    operationInfo.controller.nodeModelList.forEach(modelId => {
      let foundIt = this.findDataStorage(modelId);
      foundIt.model.targetData = salternDevice.getDeviceData(foundIt.category);
    });
  }


  
  /**
   * @return {Array.<{category: string, targetId: string, targetName: string, targetData: *}>}
   */
  getAllDeviceModelStatus(){
    let returnValue = [];
    _.forEach(this.salternDeviceDataStorage, (deviceGroup, deviceCategory) => {
      let deviceCate = '';
      switch (deviceCategory) {
      case this.baseModel.WATER_DOOR.KEY:
        deviceCate = this.baseModel.WATER_DOOR.NAME;
        break;
      case this.baseModel.VALVE.KEY:
        deviceCate = this.baseModel.VALVE.NAME;
        break;
      case this.baseModel.PUMP.KEY:
        deviceCate = this.baseModel.PUMP.NAME;
        break;
      case this.baseModel.SALINITY.KEY:
        deviceCate = this.baseModel.SALINITY.NAME;
        break;
      case this.baseModel.WATER_LEVEL.KEY:
        deviceCate = this.baseModel.WATER_LEVEL.NAME;
        break;
      case this.baseModel.WATER_TEMPERATURE.KEY:
        deviceCate = this.baseModel.WATER_TEMPERATURE.NAME;
        break;
      case this.baseModel.MODULE_FRONT_TEMPERATURE.KEY:
        deviceCate = this.baseModel.MODULE_FRONT_TEMPERATURE.NAME;
        break;
      case this.baseModel.MODULE_REAR_TEMPERATURE.KEY:
        deviceCate = this.baseModel.MODULE_REAR_TEMPERATURE.NAME;
        break;
      default:
        break;
      }
      
      deviceGroup.forEach(currentItem => {
        returnValue.push({
          targetCategory: deviceCate, 
          targetId: currentItem.targetId, 
          targetName: currentItem.targetName, 
          targetData: currentItem.targetData, 
        });
      });
    });


    // return _.sortBy(returnValue, 'targetName');
    return returnValue;
  }



}

module.exports = Model;


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