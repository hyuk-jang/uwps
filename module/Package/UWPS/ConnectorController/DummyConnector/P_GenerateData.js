const _ = require('underscore');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;


class P_GenerateData {
  constructor(controller) {
    this.controller = controller;

    this.pvInfo = this.controller.config.dummyValue.pv;
  }

  generateFault() {

  }

  // 태양광 모듈 더미 데이터 생성
  generatePvData(pv = {
    amp,
    vol
  }, scale) {
    scale = _.isNumber(scale) ? scale / 100 : 1;
    let baseAmp = this.controller.config.dummyValue.pv.baseAmp;
    let baseVol = this.controller.config.dummyValue.pv.baseVol;
    
    pv.amp = this.calcPlusMinus(baseAmp, pv.amp, this.pvInfo.ampCritical) * scale;
    pv.vol = this.calcPlusMinus(baseVol, pv.vol, this.pvInfo.volCritical)

    return pv;
  }

  // 인버터 변환 더미 데이터 생성
  generateInverterData(pv = {amp, vol}) {
    let baseAmp = this.controller.config.dummyValue.pv.baseAmp;
    let baseVol = this.controller.config.dummyValue.pv.baseVol;

    let transAmp = this.calcPlusMinus(baseAmp, pv.amp, this.pvInfo.ampCritical * 10, '0');
    let transVol = this.calcPlusMinus(baseVol, pv.vol, this.pvInfo.volCritical * 10, '0');
    
    return {amp: transAmp, vol: transVol};
  }


  calcPlusMinus(base, target, critical, hasPlus) {
    // BU.CLIS(base, target, critical)
    let value = _.random(0, 10) / 1000 * critical;

    if(hasPlus) {
      value = hasPlus === '1' ? value : -value;
    } else {
      value = Math.random() >= 0.5 ? value : -value;
    }

    let tempValue = target + value;

    let minCritical = base - critical;
    let maxCritical = base + critical;

    if (tempValue <= minCritical) {
      return target + Math.abs(value);
    } else if (tempValue >= maxCritical) {
      return target - Math.abs(value);
    } else {
      // 음수이면 0 리턴
      return tempValue < 0 ? 0 : tempValue;
    }
  }



}
module.exports = P_GenerateData;