'use strict';
const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

const Control = require('./Control');

const SalternDevice = require('../SalternDevice'); 


// const baseFormat = require('device-protocol-converter-jh').baseFormat.saltern;
// const map =require('../config/map');

const {BaseModel} = require('../../../module/device-protocol-converter-jh');



class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.map = controller.map;
    this.routerList = controller.routerList;

    this.baseModel = new BaseModel.Saltern('xbee');

    // Device Model Storage 초기화
    this.init();
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
      returnValue.model = _.find(this.salternDeviceDataStorage.waterDoorList, {targetId});
    } else if(_.includes(targetId, 'P_')){
      returnValue.category = this.baseModel.PUMP.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.pumpList, {targetId});
    } else if(_.includes(targetId, 'V_')){
      returnValue.category = this.baseModel.VALVE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.valveList, {targetId});
    } else if(_.includes(targetId, 'WL_')){
      returnValue.category = this.baseModel.WATER_LEVEL.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.waterLevelList, {targetId});
    } else if(_.includes(targetId, 'S_')){
      returnValue.category = this.baseModel.SALINITY.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.salinityList, {targetId});
    } else if(_.includes(targetId, 'WT_')){
      returnValue.category = this.baseModel.WATER_TEMPERATURE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.waterTemperatureList, {targetId});
    } else if(_.includes(targetId, 'MT_')){
      returnValue.category = this.baseModel.WATER_TEMPERATURE.KEY;
      returnValue.model = _.find(this.salternDeviceDataStorage.moduleTemperatureList, {targetId});
    }
    return returnValue;
  }



  /**
   * 
   * @param {string} modelId 
   */
  findRouter(modelId){
    let foundRouter = _.find(this.routerList, router => {
      return _.includes(router.nodeModelList, modelId);
    });

    return foundRouter;
  }

  /**
   * @param {SalternDevice} salternController 
   */
  onData(salternController){
    let operationInfo = salternController.getDeviceOperationInfo();

    operationInfo.controller.nodeModelList.forEach(modelId => {
      let foundIt = this.findDataStorage(modelId);
      foundIt.model.targetData = salternController.getDeviceData(foundIt.category);
    });
  }


  getAllStatus(){
    
    
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