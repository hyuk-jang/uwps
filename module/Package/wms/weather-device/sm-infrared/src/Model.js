'use strict';

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

    let resCalcObj = this.averageCalculator.onData(dataObj);
    
    // BU.CLI(resCalcObj.hasOccurEvent, this.averageRain);
    if(resCalcObj.hasOccurEvent){
      return this.checkRain();
    } else {
      return {};
    }
  }

  /**
   * 현재 레인 센서 값에따라 비오는 여부 체크
   * @return {{sendStatus: string, currRainLevel: number, currPredictAmount: number, msg: string, averageRain: number}}
   */
  checkRain() {
    // console.log('manageList',manageList)
    if (this.rainAlarmBoundaryList.length === 0) {
      return {};
    }

    let currTime = BU.convertDateToText(new Date(), 'kor', 4, 1);
    let sendObj = {
      sendStatus: 'rain_0',
      currRainLevel: 0,
      currPredictAmount: 0,
      averageRain: this.averageRain,
      msg: ''
    };


    // BU.CLI('this.averageRain',this.averageRain)
    // 설정한 범위를 돌면서 값이 일치할 경우 계속해서 초기화
    let hasFind = false;
    this.rainAlarmBoundaryList.forEach((element, index) => {
      // 적절한 상태를 찾았다면 수행 X
      if (hasFind) {
        return;
      }
      // BU.CLIS(element.boundary, this.averageRain, index)
      // 비가 안올 경우 RainLevel 초기화
      if (index === 0 && element.boundary > this.averageRain && this.currRainLevel !== -1) {
        this.currRainLevel = 0;
      }

      // 현재 우천 센서 데이터 평균 값의 Config 범위에 따라 전송알림 객체 설정
      if (element.boundary > this.averageRain) {
        hasFind = true;

        sendObj.sendStatus = 'rain_' + (index);
        sendObj.currRainLevel = index;
        sendObj.currPredictAmount = element.predictAmount;
        sendObj.msg = index === 0 ? '' : currTime + '부터 ' + element.msg;
      }
    });
    // 현재 비오는 단계보다 강도가 약하다면 무시
    if (this.currRainLevel < sendObj.currRainLevel) {
      // BU.CLIS(sendObj, this.averageObj);
      this.currRainLevel = sendObj.currRainLevel;
      return sendObj;
    } else {
      return {};
    }
  }


}

module.exports = Model;