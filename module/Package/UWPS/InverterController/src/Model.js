'use strict';
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.retryConnectDeviceCount = 0;

    this.cmdList = [
      'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
    ]

    this.controlStatus = {
      reserveCmdList: [], // Buffer List
      processCmd: {}, // 일반적으로 Buffer
      sendIndex: -1, // Dev Test Stub 데이터 가져오는 index 용
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }

    // Converter에 정의한 baseFormat 가져옴
    this.inverterData = this.controller.config.baseFormat;
    // Socket에 접속 중인 사용자 리스트
    this.deviceSavedInfo = this.controller.config.deviceSavedInfo;

    this.sysInfo = {}
    this.pv = {}
    // Single Grid, Third Grid 둘다 커버하는 Grid
    this.grid = {};
    this.power = {};
    this.operationInfo = {};
    this.weather = {};

    this.cmdList.forEach(element => this.onInitInverterData(element));

    this.ivtDataGroup = [
      this.sysInfo, this.pv, this.grid, this.power, this.operationInfo, this.weather
    ];

    // 현재 발생되고 있는 에러 리스트
    this.troubleCodeList = controller.config.troubleCodeList;
    this.currTroubleList = this.initTroubleMsg();
    // Trouble List로 들어올 경우 임시 저장소
    this.troubleArrayStorage = [];


  }

  initTroubleMsg() {
    const returnValue = [];
    this.troubleCodeList.forEach(ele => {
      let addObj = {
        inverter_seq: this.deviceSavedInfo.inverter_seq,
        is_error: ele.is_error,
        code: ele.code,
        msg: ele.msg,
        occur_date: null,
        fix_date: null
      }
      returnValue.push(addObj)
    })
    return returnValue;
  }

  initControlStatus() {
    this.controlStatus = {
      reserveCmdList: [],
      processCmd: {},
      sendIndex: -1,
      retryChance: 3,
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }
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
      case 'system':
        this.sysInfo = {
          isSingle: this.deviceSavedInfo.target_type === 'single' ? 1 : 0, // 단상 or 삼상
          capa: typeof this.deviceSavedInfo.amount === 'number' ? this.deviceSavedInfo.amount / 10 : 0, // 인버터 용량 kW
          productYear: '00000000', // 제작년도 월 일 yyyymmdd,
          sn: this.deviceSavedInfo.code // Serial Number
        }
        break;
      case 'operation':
        this.operationInfo = {
          isRun: 0, // 인버터 동작 유무
          isError: 0, // 인버터 에러 발생 유무
          temperature: 0, // 인버터 온도
          errorList: [], // 에러 리스트 Array
          warningList: [] // 경고 리스트 Array
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
    // BU.CLI('refineInverterData', this.inverterData)
    let in_w = this.pv.amp * this.pv.vol;
    let out_w = 0;
    if (this.deviceSavedInfo.target_type === 'single') {
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
    returnvalue.inverter_seq = this.deviceSavedInfo.inverter_seq;
    // BU.CLI(returnvalue)
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

  /**
   * Program 이상과 장치 이상 List를 합쳐 반환
   */
  getCurrTroubleData(){
    // BU.CLIS(this.currTroubleList, this.troubleArrayStorage)
    return this.currTroubleList.concat(this.troubleArrayStorage)
  }

  /**
   * Trouble Code로 에러를 받을 경우 (프로그램 에러 발생 시)
   * @param {String} troubleCode Trouble Code
   * @param {Boolean} hasOccur 발생 or 해결
   */
  onTroubleData(troubleCode, hasOccur) {
    const returnValue = {
      msg: '',
      obj: {}
    };
    const troubleObj = _.findWhere(this.troubleCodeList, {
      code: troubleCode
    })
    if (_.isEmpty(troubleObj)) {
      throw ReferenceError('해당 Trouble Msg는 없습니다' + troubleCode)
    }
    const findObj = _.findWhere(this.currTroubleList, {
      code: troubleCode
    })

    // 발생
    if (hasOccur) {
      // 완료된 내역이 있다면 초기화
      if (findObj.occur_date !== null && findObj.fix_date !== null) {
        findObj.occur_date = null;
        findObj.fix_date = null;
      }
      // 최초 발생시에만 발생 날짜 기록.
      if (findObj.occur_date === null) {
        returnValue.msg = `Trouble 발생 : ${troubleCode}`;
        findObj.occur_date = BU.convertDateToText(new Date());
      } else {
        returnValue.msg = `Trouble 이미 모니터링 중 : ${troubleCode}`;
      }
    } else { // 해결 시
      // 발생 시각이 존재 할 경우
      if (findObj.occur_date === null) {
        returnValue.msg = `Trouble 내역 존재하지 않음 : ${troubleCode}`;
      } else if (findObj.fix_date === null) {
        returnValue.msg = `Trouble 해제 완료 : ${troubleCode}`;
        findObj.fix_date = BU.convertDateToText(new Date());
      } else {
        returnValue.msg = `이미 완료된 Trouble : ${troubleCode}`;
      }
    }
    returnValue.obj = findObj;
    return returnValue;
  }

  /**
   * Trouble List로 받을 경우 (장치에서 에러 Code로 줄 경우)
   * @param {Array} troubleList {msg, code} 로 이루어진 리스트
   */
  onTroubleDataList(troubleList) {
    // BU.CLI('onTroubleDataList', troubleList)
    let troubleListClone = troubleList.slice(0);
    // 기존 에러 저장소를 순회하면서 Clear된 내역을 찾음
    this.troubleArrayStorage.forEach(troubleStorage => {
      // 반영 여부
      let hasApply = false;
      // 기존 저장소에 해당 에러가 있다면 내용 반영 후 제거
      troubleListClone = _.reject(troubleListClone, troubleClone => {
        if (troubleClone.code === troubleStorage.code) {
          hasApply = true;
          // 완료된 내역이 있다면 초기화
          if (troubleStorage.occur_date !== null && troubleStorage.fix_date !== null) {
            troubleStorage.occur_date = null;
            troubleStorage.fix_date = null;
          }
          // 발생 일자가 없다면 기록(최초 발생 일자를 기준으로 저장함)
          if (troubleStorage.occur_date === null) {
            troubleStorage.occur_date = BU.convertDateToText(new Date());
          }
          return true;
        } else {
          return false;
        }
      })

      // 수신 에러 리스트에 해당 에러가 없으므로 해결되었다고 판단
      if (!hasApply) {
        if (troubleStorage.fix_date === null) {
          troubleStorage.fix_date = BU.convertDateToText(new Date());
        }
      }
    })

    troubleListClone.forEach(trouble => {
      let addObj = {
        inverter_seq: this.deviceSavedInfo.inverter_seq,
        is_error: 1,
        code: trouble.code,
        msg: trouble.msg,
        occur_date: BU.convertDateToText(new Date()),
        fix_date: null
      }
      this.troubleArrayStorage.push(addObj)
    })
    return;
  }

  // Inverter Data 수신
  onData(inverterData) {
    // BU.CLI(inverterData)
    _.each(inverterData, (value, key) => {
      // 정의한 Key 안에서 들어온 데이터일 경우
      if (value !== null && _.has(this.inverterData, key)) {
        // 실제 사용하는 영역일 경우 실제 대입
        _.each(this.ivtDataGroup, (ivtObj) => {
          if (_.has(ivtObj, key)) {
            // 에러 내역이 있을 경우
            if (key === 'errorList') {
              this.onTroubleDataList(value)
            }
            ivtObj[key] = value;
          }
        })
        // 정의한 key value 업데이트 (차후에 쓰일지도 몰라서)
        this.inverterData[key] = value;
      }
    })
    // BU.CLI(this.inverterData)
    return this.inverterData;
  }
}

module.exports = Model;