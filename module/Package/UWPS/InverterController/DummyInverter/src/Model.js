const _ = require('underscore');
/** Inverter Data 가 공통으로 담길 Base Format Guide Line */
const {baseFormat} = require('../../Converter');
const NU = require('base-util-jh').newUtil;
/** Class DummyConnector 데이터 저장 */
class Model {
  /**
   * Controller Method Chaning Pattern
   * @param {Object} controller Control 객체
   * @param {Object} controller.config Control 설정 정보
   * @param {Object} controller.config.dummyValue 인버터 초기 시작 값이 담긴 객체
   * @param {Object} controller.config.dummyValue.pv 모듈 초기값 객체
   * @param {number} controller.config.dummyValue.pv.amp 전류 시작값
   * @param {number} controller.config.dummyValue.pv.vol 전압 시작값
   */
  constructor(controller) {
    this.controller = controller;

    this.config = controller.config;
    this.socketServerPort = 0;
    this.inverterData = baseFormat;

    this.dummy = {
      pointHour: 0,
      pointDate: 1,
      storageHourKwh: [],
      storageDailyKwh: []
    };


    this.sysInfo = {
      isSingle: 1, // 단상 or 삼상
      capa: 0, // 인버터 용량 kW
      productYear: '00000000', // 제작년도 월 일 yyyymmdd,
      sn: '' // Serial Number
    };

    this.pv = {
      amp: this.config.dummyValue.pv.amp, // Ampere
      vol: this.config.dummyValue.pv.vol // voltage
    };

    // Single Grid, Third Grid 둘다 커버하는 Grid
    this.grid = {
      rsVol: 0, // rs 선간 전압
      stVol: 0, // st 선간 전압
      trVol: 0, // tr 선간 전압
      rAmp: 0, // r상 전류
      sAmp: 0, // s상 전류
      tAmp: 0, // t상 전류
      lf: 0 // 라인 주파수 Line Frequency, 단위: Hz
    };

    this.power = {
      // pvWh: 0, //  현재 태양 전지 출력 전력량, 단위: 
      gridKw: 0, // 출력 전력
      dailyKwh: this.config.dummyValue.dailyKwh || 0, // 하루 발전량 kWh
      cpKwh: this.config.dummyValue.cpKwh || 0, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: 0, // 역률 Power Factor %
    };

    // BU.CLI(this.power)

    this.operationInfo = {
      isRun: 0, // 인버터 동작 유무
      isError: 0, // 인버터 에러 발생 유무
      temperature: 0, // 인버터 온도
      errorList: [], // 에러 리스트 Array
      warningList: [] // 경고 리스트 Array
    };
  }


  // 현재 매칭된 값의 소수점 절삭하여 반환
  get currPv() {
    return NU.toFixedAll(this.pv, 1);
  }

  get currGrid() {
    return NU.toFixedAll(this.grid, 1);
  }

  get currPower() {
    return NU.toFixedAll(this.power, 3);
  }


  // 데이터 정제한 데이터 테이블
  get refineInverterData() {
    let in_w = this.pv.amp * this.pv.vol;
    let out_w = 0;
    if (this.config.isSingle) {
      out_w = this.grid.rAmp * this.grid.rsVol;
    } else { // 3상일때 배율 1.732 적용
      out_w = this.grid.rAmp * this.grid.rsVol * 1.732;
    }

    let returnvalue = {
      in_a: this.pv.amp,
      in_v: this.pv.vol,
      in_w,
      out_a: this.grid.rAmp,
      out_v: this.grid.rsVol,
      out_w,
      p_f: _.isNaN(out_w / in_w) ? 0 : out_w / in_w * 100,
      d_wh: this.power.dailyKwh * 1000,
      c_wh: this.power.cpKwh * 1000
    };

    // BU.CLIS(returnvalue, this.power)

    // Scale 10 배수 처리
    return NU.multiplyScale2Obj(returnvalue, 10, 0);
  }


  get scalePv() {
    return NU.multiplyScale2Obj(this.pv, 10, 0);
  }
  get scaleGrid() {
    return NU.multiplyScale2Obj(this.grid, 10, 0);
  }

  get scalePower() {
    return NU.multiplyScale2Obj(this.power, 10, 0);
  }

  get scaleSysInfo() {
    let returnValue = Object.assign({}, this.sysInfo);
    returnValue.capa = returnValue.capa * 10;

    return returnValue;
  }


  onPvData(amp, vol) {
    // BU.CLI(amp, vol)
    this.pv.amp = amp;
    this.pv.vol = vol;
  }

  onIvtData(amp, vol, currDate) {
    // BU.CLI(amp, vol)
    let in_w = this.pv.amp * this.pv.vol;
    let out_w = 0;

    // 단상일 경우
    if (this.config.isSingle) {
      this.grid.rAmp = amp;
      this.grid.rsVol = vol;

      out_w = this.grid.rAmp * this.grid.rsVol;

      this.power.gridKw = out_w / 1000;
    } else {
      this.grid.rAmp = amp;
      this.grid.sAmp = amp;
      this.grid.tAmp = amp;
      this.grid.rsVol = vol;
      this.grid.stVol = vol;
      this.grid.trVol = vol;

      out_w = this.grid.rAmp * this.grid.rsVol * 1.732;
      this.power.gridKw = out_w / 1000;

    }

    this.power.pf = isNaN(out_w / in_w) ? 0 : out_w / in_w * 100;

    // BU.CLIS(pv, ivt)
    let date = currDate.getDate();
    let hour = currDate.getHours();
    // BU.CLIS(date, hour, this.dummy)

    // 시간이 바뀜
    if (hour !== this.dummy.pointHour) {
      this.dummy.pointHour = hour;

      if (!this.dummy.storageHourKwh.length) {
        this.dummy.pointHour = hour;
        this.dummy.pointDate = date;
      } else {
        let hourKwh = this.dummy.storageHourKwh.reduce((x, y) => x + y) / this.dummy.storageHourKwh.length;
        // 1시간 발전량 측정 저장소 초기화
        this.dummy.storageHourKwh = [];
        // 하루 누적 발전량에 추가
        // BU.CLI(hourKwh)
        this.power.dailyKwh += hourKwh;
        // 누적 발전량 기입
        this.power.cpKwh += hourKwh;

        // 요일이 바뀌었다면 하루 발전량
        if (date !== this.dummy.pointDate) {
          // 요일 다시 지정
          this.dummy.pointDate = date;
          this.power.dailyKwh = 0;
        }
      }
    }
    this.dummy.storageHourKwh.push(amp * vol / 1000);
  }

  onData(pv, ivt, currDate) {
    // BU.CLIS(pv, ivt)
    this.onPvData(pv.amp, pv.vol);
    this.onIvtData(ivt.amp, ivt.vol, currDate);
  }
}

module.exports = Model;