'use strict';
const _ = require('lodash');
const cron = require('cron');

// const {BU, CU} = require('../../../../../module/base-util-jh');
const {BU, CU} = require('base-util-jh');

const Control = require('./Control');
// const {baseFormat} = require('device-protocol-converter-jh');
// const {BaseModel} = require('../../../../../module/device-protocol-converter-jh');


class Model {
  /**
   * @param {Control} controller 
   */
  constructor(controller) {
    this.controller = controller;

    this.deviceData = controller.baseModel.baseFormat;

    this.tempDeviceData = controller.baseModel.baseFormat;
    
    let averConfig = {
      maxStorageNumber: 10, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData)
    };

    this.averageStorage = new CU.AverageStorage(averConfig);

    this.cronScheduler = null;

    this.runCronScheduler();
  }



  runCronScheduler() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 2초마다 요청
      this.cronScheduler = new cron.CronJob({
        cronTime: '*/2 * * * * *',
        onTick: () => {
          // 평균 값 도출
          _.isEmpty(this.tempDeviceData) ? this.averageStorage.shiftDataStorage() : this.averageStorage.onData(this.tempDeviceData);
          this.deviceData =  this.averageStorage.getAverageStorage();
          // 임시 저장소 초기화
          this.tempDeviceData = {};
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }


  /**
   * @param {weathercastProtocolFormat} weathercastData 
   */
  onData(weathercastData){
    // BU.CLI(weathercastData);
    this.tempDeviceData = weathercastData;

    // _.forEach(weathercastData, (data, key) => {
    //   if(_.has(this.deviceData, key)){
    //     this.tempDeviceData[key] = data;
    //   }
    // });
    // BU.CLI(this.deviceData);
  }
}

module.exports = Model;
