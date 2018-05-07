'use strict';
const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

const Control = require('./Control');

class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.deviceData = controller.baseModel.baseFormat;
  }

  getData(category){
    return this.deviceData[category];
  }

  /**
   * @param {Object} salternData 
   */
  onData(salternData){
    // BU.CLI(salternData);
    _.forEach(salternData, (data, key) => {
      if(_.has(this.deviceData, key)){
        this.deviceData[key] = data;
      }
    });
    // BU.CLI(this.deviceData);
  }
}

module.exports = Model;