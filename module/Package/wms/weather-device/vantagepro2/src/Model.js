'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const NU = require('base-util-jh').newUtil;

const Control = require('./Control');

const {weathercastProtocolFormat} = require('device-protocol-converter-jh');

class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.averageCalculator = new NU.CalculateAverage(controller.config.calculateOption);
    this.deviceData = weathercastProtocolFormat;
  }

  /**
   * @param {weathercastProtocolFormat} weathercastData 
   */
  onData(weathercastData){
    BU.CLI(weathercastData);
    let resultAverageData = this.averageCalculator.onData(weathercastData);

    BU.CLI(resultAverageData);

    // _.each(weathercastData, (value, key) => {
    //   // 정의한 Key 안에서 들어온 데이터일 경우
    //   if (value !== null && _.has(this.deviceData, key)) {
    //     this.deviceData[key] = value;
    //   }
    // });
  }
}

module.exports = Model;