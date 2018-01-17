'use strict';

const bcjh = require('base-class-jh');
/** Class Ecoding 개발용 */
class EncoderForDev extends bcjh.Converter {
  constructor() {
    super();

    /**
     * @property {Array} cmdList 장치로 보낼 명령 리스트
     */
    this.cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ];
  }

  /**
   * TODO 인버터로 보낼 모든 명령 생성. 현재 5개의 명령
   * @return {Buffer[]} 
   */
  makeMsg() {
    let returnValue = [];
    this.cmdList.forEach(cmd => {
      let bufferMsg = bcjh.classModule.makeRequestMsgForTransfer(cmd);
      returnValue.push(bufferMsg);
    });
    // BU.CLI(returnValue);
    return returnValue;
  }
}

module.exports = EncoderForDev;