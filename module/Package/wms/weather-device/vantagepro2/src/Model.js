'use strict';

const BU = require('base-util-jh').baseUtil;
const NU = require('base-util-jh').newUtil;
global.BU = BU;
const Control = require('./Control');

class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {

    // this.averageCalculator = new NU.CalculateAverage(controller.config.calculateOption);

    // this.rainAlarmBoundaryList = controller.config.current.rainAlarmBoundaryList;

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
    BU.CLI(data);
    // const dataLength = data.length;
    // const usefulLength = 55;

    // if(dataLength !== usefulLength){
    //   throw new Error('정상적인 데이터가 아닙니다.');
    // }

    // const rainDataLength = 8;
    // const endCharLength = 6; 

    // let rainBufferData =  data.slice(dataLength - endCharLength - rainDataLength, dataLength - endCharLength );

    // let rainData = parseInt(rainBufferData, 16);

    // BU.CLI(rainData);

    // let dataObj = {
    //   smInfrared: rainData
    // };

    // let resCalcObj = this.averageCalculator.onData(dataObj);
    
    // // BU.CLI(resCalcObj.hasOccurEvent, this.averageRain);
    // if(resCalcObj.hasOccurEvent){
    //   return this.checkRain();
    // } else {
    //   return {};
    // }
  }

}

module.exports = Model;