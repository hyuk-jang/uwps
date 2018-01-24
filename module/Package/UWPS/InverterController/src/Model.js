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

/** */
const {
  baseFormat
} = require('../Converter');

/** Class Controller 데이터 관리 */
class Model {
  /**
   * 계측 프로그램을 구동하기 위해서 필요한 설정 정보 
   * @param {Object} controller Controller 구동 객체
   * @param {Object} controller.config Controller 객체 생성 구동 정보
   * @param {Object} controller.config.deviceSavedInfo 장치 설정 정보로 DB를 기초로 도출
   */
  constructor(controller) {
    this.controller = controller;

    this.id = this.controller.config.deviceSavedInfo.target_id;

    this.retryConnectDeviceCount = 0;

    this.controlStatus = {
      reserveCmdList: [], // Buffer List
      processCmd: {}, // 일반적으로 Buffer
      sendIndex: -1, // Dev Test Stub 데이터 가져오는 index 용
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };

    // Converter에 정의한 baseFormat 가져옴
    this.deviceData = Object.assign({}, baseFormat);
    this.deviceSavedInfo = this.controller.config.deviceSavedInfo;

    // 현재 발생되고 있는 에러 리스트
    this.systemErrorList = [];
    this.troubleList = [];
  }

  /** Trouble List 반환.
   * occur_date가 없거나, fix_date 날짜가 있다면 해결된 에러
   * occur_date가 있지만 fix_date 가 없다면 현재 에러가 있음
   */
  get currentTroubleList() {
    return _.flatten([this.troubleArrayStorage, this.currTroubleList]);
  }

  initControlStatus() {
    this.controlStatus = {
      reserveCmdList: [],
      processCmd: {},
      sendIndex: -1,
      retryChance: 3,
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };
  }

  get reserveCmdList() {
    return this.controlStatus.reserveCmdList;
  }

  get processCmd() {
    return this.controlStatus.processCmd;
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

  // Inverter Data 수신
  onData(inverterData) {
    // BU.CLI(inverterData);
    _.each(inverterData, (value, key) => {
      // 정의한 Key 안에서 들어온 데이터일 경우
      if (value !== null && _.has(this.deviceData, key)) {
        if (key === 'errorList') {
          this.onTroubleDataList(value);
        } else {
          this.deviceData[key] = value;
        }
      }
    });
    // BU.CLI(this.inverterData)
    return this.deviceData;
  }
}

module.exports = Model;