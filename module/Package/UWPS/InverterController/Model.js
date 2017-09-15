const NU = require('./util/newUtil.js');

class Model {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config;

    this.hasOperation = false;
    this.retryConnectInverterCount = 0;

    this.requestCmdList = [];
    this.requestMsgList = [];

    this.socketServerPort = 0;

    // Socket에 접속 중인 사용자 리스트
    this.clientList = [];

    this.ivtSavedInfo = this.config.ivtSavedInfo;

    this.sysInfo = {
      hasSingle: 0, // 단상 or 삼상
      capa: 0, // 인버터 용량 kW
      productYear: '00000000', // 제작년도 월 일 yyyymmdd,
      sn: '' // Serial Number
    }

    this.pv = {
      amp: 0, // Ampere
      vol: 0 // voltage
    }

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

    this.singleGridData = {
      amp: 0, // Ampere
      vol: 0, // voltage
      lf: 0 // 라인 주파수 Line Frequency, 단위: Hz
    }

    this.thirdGridData = {
      rsVol: 0, // rs 선간 전압
      stVol: 0, // st 선간 전압
      trVol: 0, // tr 선간 전압
      rAmp: 0, // r상 전류
      sAmp: 0, // s상 전류
      tAmp: 0, // t상 전류
      lf: 0 // 라인 주파수 Line Frequency, 단위: Hz
    }

    this.power = {
      // pvWh: 0, //  현재 태양 전지 출력 전력량, 단위: 
      gridKw: 0,  // 출력 전력
      dailyKwh: 0,  // 하루 발전량 kWh
      cpKwh: 0, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: 0,  // 역률 Power Factor %
    }

    this.weather = {};
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

  get currIvtAmp() {
    if (this.config.ivtSavedInfo.target_type) {
      return this.singleGridData.amp;
    } else {
      return this.thirdGridData.rsAmp;
    }
  }

  get currIvtVol() {
    if (this.config.ivtSavedInfo.target_type) {
      return this.singleGridData.vol;
    } else {
      return this.thirdGridData.rsVol;
    }
  }

  // 데이터 정제한 데이터 테이블
  get refineInverterData() {
    let in_wh = this.pv.amp * this.pv.vol;
    let out_wh = 0;
    if(this.config.ivtSavedInfo.target_type){
      out_wh = this.grid.rAmp * this.grid.rsVol;
    } else {
      out_wh = this.grid.rAmp * this.grid.rsVol * 1.732;
    }

    // BU.CLIS(this.pvData, in_wh)
    let returnvalue = {
      // inverter_seq: this.ivt_seq,
      in_a: this.pv.amp,
      in_v: this.pv.vol,
      in_wh: in_wh,
      out_a: this.grid.rAmp,
      out_v: this.grid.rsVol,
      out_wh: out_wh,
      p_f: _.isNaN(out_wh / in_wh) ? 0 : out_wh / in_wh * 100,
      d_wh: this.power.dailyKwh * 1000,
      c_wh: this.power.cpKwh * 1000
    };

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
    return NU.multiplyScale2Obj(this.power, 10, 0)
  }

  get scaleSysInfo() {
    let returnValue = Object.assign({}, this.sysInfo);
    returnValue.capa = returnValue.capa * 10;

    return returnValue;
  }


  getInverterData(cmd) {
    return this[cmd];
  }

  getScaleInverterData(cmd) {
    let firstChar = cmd.charAt(0).toUpperCase();
    let covertChar = 'scale' + firstChar + cmd.slice(1);
    return this[covertChar] === undefined ? {} : this[covertChar];

  }

  // Inverter Data 수신
  onInverterData(receiveObj) {
    let cmd = receiveObj.cmd;
    this[cmd] = receiveObj.contents;

    // 요청중인 명령리스트에 해당 명령 삭제
    this.requestCmdList = _.reject(this.requestCmdList, value => value === cmd);

    // BU.CLI(this.requestCmdList)
  }





}

module.exports = Model;