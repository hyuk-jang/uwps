const cron = require('cron');
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

const Promise = require('bluebird');

class P_GenerateData {
  constructor(controller) {
    this.controller = controller;

    this.pvInfo = this.controller.config.dummyValue.pv;

    this.cronJobMeasureInverter = null;

    // this.powerRangeByYear = this.controller.config.dummyValue.powerRangeByYear;
    this.powerRange = this.controller.config.dummyValue.powerRangeByDay;
    this.dailyScale = this.controller.config.dummyValue.dailyScale;
    this.dummyScale = this.controller.config.dummyValue.dummyScale;
    this.dailyPoint = -1;

    // 데이터 기간 생성기
    this.dateCurrPoint = new Date();
    this.dateEndPoint = new Date();
    this.generateIntervalMin = this.controller.config.dummyValue.generateIntervalMin;
    this.dummyRangeData = [];
    this.dateCount = 0;
  }

  runCronForMeasureInverter() {
    this.dataMaker(new Date());

    try {
      if (this.cronJobMeasureInverter !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureInverter.stop();
      }
      // BU.CLI('Setting Cron')
      // 1분마다 요청
      this.cronJobMeasureInverter = new cron.CronJob({
        cronTime: '0 * * * * *',
        onTick: () => {
          let res = this.dataMaker(new Date());

        },
        start: true,
        // timeZone: 'America/Los_Angeles'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 시작, 종료 날짜값을 기준으로 데이터 생성 --> db 입력용
   * @param {Date} startDate YYYY-mm-dd HH:mm 시작
   * @param {Date} endDate YYYY-mm-dd HH:mm 종료
   * @param {Number} generateIntervalMin 측정 인터벌 분
   * @param {Number} inverter_seq 인버터 장치 seq
   */
  dummyRangeDataMaker(startDate, endDate, generateIntervalMin, inverter_seq) {
    this.dateCurrPoint = startDate != null ? BU.convertTextToDate(startDate) : this.dateCurrPoint;
    this.dateEndPoint = endDate != null ? BU.convertTextToDate(endDate) : this.dateEndPoint;
    this.generateIntervalMin = generateIntervalMin != null ? Number(generateIntervalMin) : this.generateIntervalMin;


    this.dateCurrPoint.setMinutes(0,0,0)
    // BU.CLI('dummyRangeDataMaker')

    let returnValue = [];

    do {
      let res = this.dataMaker(this.dateCurrPoint);
      let makedData = this.controller.model.refineInverterData;
      makedData.inverter_seq = Number(inverter_seq);
      makedData.writedate = BU.convertDateToText(this.dateCurrPoint) ;

      returnValue.push(makedData)

      this.dateCurrPoint.setMinutes(this.dateCurrPoint.getMinutes() + this.generateIntervalMin);
    } while (this.dateCurrPoint < this.dateEndPoint);

    // BU.CLI(returnValue)

    return returnValue;
  }

  dataMaker(currDate) {
    // BU.CLI(currDate)
    let currMonth = currDate.getMonth();
    let currDaily = currDate.getDate() - 1 >= 0 ? currDate.getDate() - 1 : 0;
    let currHour = currDate.getHours() - 1 >= 0 ? currDate.getHours() - 1 : 0;
    let currMin = currDate.getMinutes();

    // BU.CLI(currMonth, currDaily, currHour, currMin)
    let currScale = this.dummyScale[currMonth][currDaily][currHour][0]
    let nextScale = this.dummyScale[currMonth][currDaily][currHour + 1][0];
    // BU.CLIS(currScale, nextScale)

    let scale = currScale + (nextScale - currScale) * (currMin / 60);

    let pv = this.generatePvData(this.controller.config.dummyValue.pv, scale);
    let ivt = this.generateInverterData(pv);

    this.controller.model.onData(pv, ivt, currDate);

    return this.controller.model.currPower;
  }

  // 태양광 모듈 더미 데이터 생성
  generatePvData(pv = {
    amp,
    vol,
    baseAmp,
    baseVol,
    ampCritical,
    volCritical
  }, scale) {
    scale = (_.isNumber(scale) ? scale / 100 : 1);
    let baseAmp = this.controller.config.dummyValue.pv.baseAmp;
    let baseVol = this.controller.config.dummyValue.pv.baseVol;

    let resPv = {};
    resPv.amp = this.calcPlusMinus(pv.baseAmp, pv.amp, pv.ampCritical) * scale;
    resPv.vol = this.calcPlusMinus(pv.baseVol, pv.vol, pv.volCritical)

    return resPv;
  }

  // 인버터 변환 더미 데이터 생성
  generateInverterData(pv = { amp, vol }) {
    // BU.CLI(pv.amp, pv.amp * this.controller.config.dummyValue.ivt.basePf * _.random(98, 100) / 100 / 100)
    return {
      amp: pv.amp * this.controller.config.dummyValue.ivt.basePf / 100,
      vol: pv.vol * _.random(98, 100) / 100
      // vol: pv.vol * this.controller.config.dummyValue.ivt.basePf / 100
    }
  }


  calcPlusMinus(base, target, critical, hasPlus) {
    // BU.CLIS(base, target, critical)
    let value = _.random(0, 10) / 1000 * critical;

    if (hasPlus) {
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