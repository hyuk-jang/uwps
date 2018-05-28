'use strict';
const _ = require('lodash');

// const {BU, CU} = require('../../../../../module/base-util-jh');
const {BU, CU} = require('base-util-jh');

const Control = require('./Control');

const {BaseModel} = require('../../../../../module/device-protocol-converter-jh');
const BASE_MODEL = BaseModel.Weathercast.BASE_MODEL;

class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.controller = controller;

    this.deviceData = BASE_MODEL;

    this.tempDeviceData = BASE_MODEL;
    
    let averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData)
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
  }


  /**
   * @param {BASE_MODEL} weathercastData 
   */
  onData(weathercastData){
    // BU.CLI(weathercastData);

    weathercastData = this.averageStorage.onData(weathercastData);
    
    this.deviceData = weathercastData;
  }
}

module.exports = Model;
