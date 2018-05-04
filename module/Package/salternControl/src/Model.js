'use strict';
const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

const Control = require('./Control');

const baseFormat = require('device-protocol-converter-jh').baseFormat.saltern;
// const baseFormat = require('../../../module/device-protocol-converter-jh').baseFormat.saltern;

const map =require('../config/map');


class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
   
    // this.deviceModel = {waterDoorList: [], valveList: [], pumpList: []};
  }

  /**
   * @param {baseFormat} salternData 
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