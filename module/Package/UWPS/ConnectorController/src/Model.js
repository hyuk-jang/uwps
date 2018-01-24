'use strict';
/** Array, Object 등 간편한 처리를 위한 Library */
const _ = require('underscore');
/** 자주쓰는 Util 모음 */
const BU = require('base-util-jh').baseUtil;
/** 수중태양광 관련 새로이 만들고 있는 util */
const NU = require('base-util-jh').newUtil;

/**
 * @module Array 고장정보 리스트
 */
const troubleCodeList = require('../config/trouble.config');

/** Class Controller 데이터 관리 */
class Model {
  /**
   * 계측 프로그램을 구동하기 위해서 필요한 설정 정보 
   * @param {Object} controller Controller 구동 객체
   * @param {Object} controller.config Controller 객체 생성 구동 정보
   * @param {Object} controller.config.deviceSavedInfo 장치 설정 정보로 DB를 기초로 도출
   * @param {Array} controller.config.moduleList 태양광 모듈의 접속반, 인버터 등등의 table relation info
   */
  constructor(controller) {
    this.controller = controller;

    this.id = this.controller.config.deviceSavedInfo.target_id;
    /** 장치 재접속 횟수(연속으로 3번해서 안되면 Interval 10배수 해서 시도) */
    this.retryConnectDeviceCount = 0;

    this.deviceSavedInfo = this.controller.config.deviceSavedInfo;

    /** 컨트롤러를 제어하기 위한 상태 값 및 옵션 정보 */
    this.controlStatus = {
      reserveCmdList: [], // Buffer List
      processCmd: {}, // 일반적으로 Buffer
      sendIndex: -1, // Dev Test Stub 데이터 가져오는 index 용
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 장치 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };

    /** 컨트롤러 구동 중 발생한 Error List */
    this.systemErrorList = [];
    /** 장치에서 보내온 Error Info List */
    this.troubleList = [];

    this.moduleList = this.controller.config.moduleList;

    /** 접속반은 채널 별 모듈 발전 정보가 들어감 */
    this.deviceData = [];


    // TEST DATA
    this.testData = _.map(this.moduleList, (obj, index) => {
      return {
        photovoltaic_seq: obj.photovoltaic_seq,
        ch: index + 1,
        amp: 0,
        vol: 0,
      };
    });
  }

  /** 컨트롤러를 제어하기 위한 상태 값 및 옵션 정보 초기화 */
  initControlStatus() {
    this.controlStatus = {
      reserveCmdList: [],
      processCmd: {},
      sendIndex: -1,
      retryChance: 3,
      reconnectInverterInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };
  }

  /** 장치로 요청할 명령 리스트 반환 */
  get reserveCmdList() {
    return this.controlStatus.reserveCmdList;
  }

  /** 현재 장치에게 요청 중인 명령 반환 */
  get processCmd() {
    return this.controlStatus.processCmd;
  }


  /** Module List에 맞는 데이터 저장소 정의 */
  initModule() {
    this.moduleList.forEach(moduleObj => {
      let addObj = {
        photovoltaic_seq: moduleObj.photovoltaic_seq,
        ch: 0,
        amp: 0,
        vol: 0,
      };
      this.deviceData.push(addObj);
    });

  }

  /**
   * 실제 장치에서 보내온 Error 처리. Trouble Case Model List로 공통 처리
   * @param {string} troubleCode Trouble Code
   * @param {Boolean} hasOccur 발생 or 해결
   * @param {Object|string} msg Error 상세 내용
   * @return {Object}
   */
  onSystemError(troubleCode, hasOccur, msg) {
    // BU.CLI(troubleCode, hasOccur);
    if (troubleCode === undefined) {
      this.systemErrorList = [];
      return this.systemErrorList;
    }
    const troubleObj = _.findWhere(troubleCodeList, {
      code: troubleCode
    });
    if (_.isEmpty(troubleObj)) {
      throw ReferenceError('해당 Trouble Msg는 없습니다' + troubleCode);
    }

    const findObj = _.findWhere(this.systemErrorList, {
      code: troubleCode
    });

    // 에러가 발생하였고 systemErrorList에 없다면 삽입
    if (hasOccur && _.isEmpty(findObj)) {
      troubleObj.occur_date = new Date();
      this.systemErrorList.push(troubleObj);
      BU.errorLog('inverter', msg);
    } else if (!hasOccur && !_.isEmpty(findObj)) {  // 에러 해제하였고 해당 에러가 존재한다면 삭제
      this.systemErrorList = _.reject(this.systemErrorList, systemError => {
        return systemError.code === troubleCode;
      });
    }

    return this.systemErrorList;
  }

  /**
   * Trouble List로 받을 경우 (장치에서 에러 Code로 줄 경우)
   * @param {Array} troubleList {msg, code} 로 이루어진 리스트
   */
  onTroubleDataList(troubleList) {
    // BU.CLI(troubleList);
    return this.troubleList = _.isArray(troubleList) ? troubleList.slice(0) : [];
  }



  // 데이터 정제한 데이터 테이블 (10배수 하여 반환)
  get refineData() {
    const returnValue = this.deviceData.map(ele => {
      return {
        photovoltaic_seq: ele.photovoltaic_seq,
        amp: NU.multiplyScale2Value(ele.amp, 10, 1),
        vol: NU.multiplyScale2Value(ele.vol, 10, 1),
      };
    });

    // BU.CLI(returnValue)
    return returnValue;
  }

  // Connecotr Data 수신
  /**
   * 접속반 데이터 Model에 저장
   * @param {Array.<{ch: number, amp: number, vol: number}>} connectorDataList Array
   * @returns {Void} 
   */
  onData(connectorDataList) {
    // BU.CLI('ondata', connectorDataList)

    this.initModule();
    // 접속반 모듈 중 채널과 접속반 seq가 같은 모듈에 모듈 seq를 정의
    connectorDataList.forEach(dataInfo => {
      let findObj = _.findWhere(this.moduleList, {
        connector_ch: dataInfo.ch,
        connector_seq: this.deviceSavedInfo.connector_seq
      });
      dataInfo.photovoltaic_seq = _.isEmpty(findObj) ? null : findObj.photovoltaic_seq;
    });

    this.deviceData = connectorDataList;

    return this.deviceData;
  }
}

module.exports = Model;