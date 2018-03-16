'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const NU = require('base-util-jh').newUtil;

const Control = require('./Control');

class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.averageCalculator = new NU.CalculateAverage(controller.config.calculateOption);

    this.rainAlarmBoundaryList = controller.config.rainAlarmBoundaryList;

    this.deviceData = {
      smInfrared: null
    };

    /** @property {Object} rainStatus */
    this.rainStatus = this.rainAlarmBoundaryList[0];
    this.lastestRainLevel = 0;
    // this.rainAlarmBoundaryList.reverse();
  }

  getDeviceData() {
    return this.averageCalculator.getData();
  }

  get averageRain() {
    return this.averageCalculator.getAverageData('smInfrared');
  }



  /**
   * 
   * @param {Buffer} data 
   * @return {{sendStatus: string, currRainLevel: number, currPredictAmount: number, msg: string, averageRain: number}}
   */
  onData(data){
    const dataLength = data.length;
    const usefulLength = 55;

    if(dataLength !== usefulLength){
      throw new Error('정상적인 데이터가 아닙니다.');
    }

    const rainDataLength = 8;
    const endCharLength = 6; 

    let rainBufferData =  data.slice(dataLength - endCharLength - rainDataLength, dataLength - endCharLength );

    let rainData = parseInt(rainBufferData, 16);

    // BU.CLI(rainData);
    

    let dataObj = {
      smInfrared: rainData
    };

    let resultAverageData = this.averageCalculator.onData(dataObj);

    _.each(resultAverageData.averageStorage, (value, key) => {
      // 정의한 Key 안에서 들어온 데이터일 경우
      if (value !== null && _.has(this.deviceData, key)) {
        this.deviceData[key] = value.average;
      }
    });



    
    // BU.CLI(resCalcObj.hasOccurEvent, this.averageRain);
    if(resultAverageData.hasOccurEvent){
      return this.checkRain();
    } else {
      return {};
    }
  }

  applyDeviceDataFromAverage(){

  }

  /**
   * 현재 레인 센서 값에따라 비오는 여부 체크
   * @return {{rainLevel: number, status: string, keyword: string,  predictAmount: number, msg: string, averageRain: number}}
   */
  checkRain() {
    // BU.CLI('this.averageRain', this.averageRain);
    let foundIndex = 0;
    // 현재 기상 값의 범위에 들어있는 조건 탐색
    _.find(this.rainAlarmBoundaryList, (currItem, index) => {
      // 찾은 조건식 상 다음 Index가 실제 데이터이므로 1 증가
      if(currItem.boundary < this.averageRain){
        foundIndex = index + 1;
        return true;
      }
    });
    
    let foundRainAlarm = this.rainAlarmBoundaryList[foundIndex];

    // 날씨가 더 나빠질 경우 알람 필요
    if(foundRainAlarm.rainLevel > this.lastestRainLevel  ){
      let currTime = BU.convertDateToText(new Date(), 'kor', 4, 1);
      this.lastestRainLevel = foundRainAlarm.rainLevel;
      this.rainStatus = Object.assign({}, foundRainAlarm);
      this.rainStatus.averageRain = this.averageRain;
      this.rainStatus.msg = currTime + '부터 ' + foundRainAlarm.msg;

      return true;
    } else {
      if(foundRainAlarm.rainLevel === 0){
        this.lastestRainLevel = 0;
      }
      return false;
    }
  }
}

module.exports = Model;