'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const {CU} = require('base-util-jh');

const Control = require('./Control');

const {weathercastProtocolFormat} = require('device-protocol-converter-jh');


class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.deviceData = weathercastProtocolFormat;

    this.index = 0;

    let averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: _.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
  }

  /**
   * @param {weathercastProtocolFormat} weathercastData 
   */
  onData(weathercastData){
    // BU.CLI(weathercastData);
    this.averageStorage.onData(weathercastData);

    this.deviceData = weathercastData;
    // BU.CLI(this.deviceData);
  }
}

module.exports = Model;
