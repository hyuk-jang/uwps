'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const Control = require('./Control');

const {weathercastProtocolFormat} = require('device-protocol-converter-jh');

class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.deviceData = weathercastProtocolFormat;
  }

  /**
   * 
   * @param {weathercastProtocolFormat} weathercastData 
   * @return {{sendStatus: string, currRainLevel: number, currPredictAmount: number, msg: string, averageRain: number}}
   */
  onData(weathercastData){
    _.each(weathercastData, (value, key) => {
      // 정의한 Key 안에서 들어온 데이터일 경우
      if (value !== null && _.has(this.deviceData, key)) {
        this.deviceData[key] = value;
      }
    });
  }

}

module.exports = Model;