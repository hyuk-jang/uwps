const NU = require('./util/newUtil.js');

class Model {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config;

    this.hasOperation = false;
    this.retryConnectInverterCount = 0;

    this.cmdList = {
      getFault: 'fault',
      getPv: 'pv',
      getGrid: 'grid',
      getPower: 'power',
      getSysInfo: 'sysInfo',
      getWeather: 'weather'
    }

    this.controlStatus = {
      reserveCmdList: [],
      processCmd: '',
      processMsgList: []
    }


    this.socketServerPort = 0;

    // Socket에 접속 중인 사용자 리스트
    this.clientList = [];

    this.ivtSavedInfo = this.config.ivtSavedInfo;

    this.sysInfo = {}
    this.pv = {}
    // Single Grid, Third Grid 둘다 커버하는 Grid
    this.grid = {};
    this.power = {}
    this.weather = {};

    Object.values(this.cmdList).forEach(element => this.onInitInverterData(element));
  }

  // 인버터 데이터 초기화
  onInitInverterData(cmd) {
    switch (cmd) {
      case 'pv':
        this.pv = {
          amp: 0, // Ampere
          vol: 0 // voltage
        }
        break;
      case 'power':
        this.power = {
          // pvWh: 0, //  현재 태양 전지 출력 전력량, 단위: 
          gridKw: 0, // 출력 전력
          dailyKwh: 0, // 하루 발전량 kWh
          cpKwh: 0, // 인버터 누적 발전량 mWh  Cumulative Power Generation
          pf: 0, // 역률 Power Factor %
        }
        break;
      case 'grid':
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
        break;
      case 'sysInfo':
        this.sysInfo = {
          hasSingle: 0, // 단상 or 삼상
          capa: 0, // 인버터 용량 kW
          productYear: '00000000', // 제작년도 월 일 yyyymmdd,
          sn: '' // Serial Number
        }
        break;
      case 'weather':
        // Single Grid, Third Grid 둘다 커버하는 Grid
        this.weather = {};
        break;
      default:
        break;
    }
  }

  /**
   * 인버터 컨트롤 관련 Getter
   */

  get reserveCmdList() {
    return this.controlStatus.reserveCmdList;
  }

  get processCmd() {
    return this.controlStatus.processCmd;
  }

  get processMsgList() {
    return this.controlStatus.processMsgList;
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
    let in_w = this.pv.amp * this.pv.vol;
    let out_w = 0;
    if (this.config.ivtSavedInfo.target_type === 0) {
      out_w = this.grid.rAmp * this.grid.rsVol;
    } else {
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

    returnvalue = NU.multiplyScale2Obj(returnvalue, 10, 0);
    returnvalue.inverter_seq = this.ivtSavedInfo.inverter_seq;

    // Scale 10 배수 처리
    return returnvalue;
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
    // BU.CLI('onInverterData', receiveObj)
    return this[receiveObj.cmd] = receiveObj.contents;
  }
}

module.exports = Model;