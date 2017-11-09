const _ = require('underscore');
const Bi = require('./Bi.js');

const BU = require('base-util-jh').baseUtil;


class P_IvtDataMaker {
  constructor(controller) {
    this.controller = controller;

    this.bi = new Bi(this.controller.config.dbInfo);
    this.dbmsManager = this.controller.config.dbmsManager;

    this.currDate = new Date();
    this.datePoint = new Date(this.dbmsManager.startDate);
    this.dateCount = 0;

    this.powerRange = this.controller.config.dbmsManager.powerRange;

    this.storageInsert = [];

    this.dailyPoint = -1;
    this.dailyScale = this.controller.config.dbmsManager.dailyScale;
  }

  maker(callback) {
    // 현재 객체 데이터 생성
    let currDaily = this.datePoint.getDate();
    let currHour = this.datePoint.getHours();
    let currMin = this.datePoint.getMinutes();

    // // 날씨가 안좋은 날씨에 대한 가중치 부여
    // if(this.dailyPoint !== currDaily){
    //   // 16분의 1로 비가 옴.
    //   let hasRain = _.random(0, 15) === 0 ? true : false;
    //   this.dailyPoint = currDaily;
    //   this.dailyScale = hasRain ? _.random(0, 50) / 100 : _.random(80, 100) / 100;
    // }


    let currPower = this.powerRange[currHour];
    let nextPower = this.powerRange[currHour + 1] || currPower;
    let scale = (currPower + (nextPower - currPower) * (currMin / 60)) * this.dailyScale[currDaily];
    this.controller.generatePvData(scale);
    
    // BU.CLIS(currHour, currPower, nextPower, scale,currMin)
    let ivt_data = this.controller.currInverterData;
    this.controller._onIvtData(this.datePoint, ivt_data.currIvtKw);

    let invertData = this.controller.currIvtDataForDbms;
    invertData.writedate = BU.convertDateToText(this.datePoint) ;
    let copy = JSON.parse(JSON.stringify(invertData));
    this.storageInsert.push(copy);

    // BU.CLI(invertData)

    this.datePoint.setMinutes(this.datePoint.getMinutes() + this.dbmsManager.insertInterval);
    
    // if(this.dateCount++ < 30){
    if(this.datePoint < this.currDate){
      setTimeout(() => {
        this.maker(callback);  
      }, 1);
      
    } else {
      BU.CLI('hi')
      this.controller._completeMakerQuery(this.storageInsert, callback);
    }



  }



  








}
module.exports = P_IvtDataMaker;