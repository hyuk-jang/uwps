'use strict';

const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

const bcjh = require('base-class-jh');

const BiModule = require('./BiModule');

const Control = require('./Control');

require('./format');

class Model {
  /** @param {Control} controller */
  constructor(controller) {
    
    this.locationInfo = controller.config.locationInfo;


    // 원데이터는 아님. {x, y, announceData, weathercast} 내장
    this.weatherCastData = {};
    this.biModule = new BiModule(controller.config.dbInfo);
  }

  /**
   * 기상청 날씨 정제
   * @param {{x: number, y: number, announceDate: Date, weatherCast: Array.<weathercast>}} weatherCastData 
   */
  async onData(weatherCastData){
    let tempStorage = new bcjh.db.TempStorage();
    let prevForecastList = await this.biModule.getPrevWeatherCast(this.locationInfo.x, this.locationInfo.y);
    // BU.CLI(prevForecastList);
    prevForecastList.forEach(currentItem => {
      currentItem.applydate = BU.convertDateToText(currentItem.applydate);
    });
    // BU.CLI(prevForecastList);
    tempStorage.initAlreadyStorage(prevForecastList);

    
    weatherCastData.weatherCast.forEach(currentItem => {
      _.extend(currentItem, {x: weatherCastData.x, y: weatherCastData.y});
      tempStorage.addStorage(currentItem, 'applydate', 'kma_data_seq');
    });
    this.weatherCastData = weatherCastData;
    // BU.CLIN(tempStorage.getFinalStorage());

    let finalStorage = tempStorage.getFinalStorage();
    let writedate = BU.convertDateToText(new Date());
    finalStorage.insertObjList.forEach(currentItem => {
      _.extend(currentItem, {writedate});
    });
    // BU.CLI(finalStorage);

    return this.biModule.doQuery(tempStorage, 'kma_data', 'kma_data_seq', false);
  }


  // NOTE 차후 내일 강수량을 얻어올 필요가 있다면 수정 필요
  // get tomorrowPop() {
  //   let currDate = new Date();
  //   if (BU.isEmpty(this.weatherCastData)) {
  //     BU.log('empty');
  //     return {};
  //   } else {
  //     let now = new Date();
  //     let startDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
  //     let endDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));

  //     let forecastList = this.weatherCastData.weatherCast;
  //     let pop = 0;
  //     let popCount = 0;
  //     for (let key in forecastList) {
  //       if (forecastList[key].applydate >= startDate && forecastList[key].applydate < endDate) {
  //         popCount += 1;
  //         pop += Number(forecastList[key].pop);
  //       }
  //     }
  //     return Math.round(pop / popCount);
  //   }
  // }
}

module.exports = Model;