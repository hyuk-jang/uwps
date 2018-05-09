'use strict';
const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

const Control = require('./Control');
// const {baseFormat} = require('device-protocol-converter-jh');
// const {BaseModel} = require('../../../../../module/device-protocol-converter-jh');


class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.deviceData = controller.baseModel.baseFormat;
    
    let averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData)
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
  }

  /**
   * @param {weathercastProtocolFormat} weathercastData 
   */
  onData(weathercastData){
    // BU.CLI(weathercastData);
    this.averageStorage.onData(weathercastData);

    _.forEach(weathercastData, (data, key) => {
      if(_.has(this.deviceData, key)){
        this.deviceData[key] = data;
      }
    });
    // BU.CLI(this.deviceData);
  }
}

module.exports = Model;
