const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.deviceSavedInfo = controller.config.deviceSavedInfo;
    this.moduleList = controller.config.moduleList;

    this.moduleDataList = [];

    this.controlStatus = {
      reserveCmdList: [], // Buffer List
      processCmd: {}, // 일반적으로 Buffer
      sendIndex: -1, // Dev Test Stub 데이터 가져오는 index 용
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 장치 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }

    // 현재 발생되고 있는 에러 리스트
    this.troubleCodeList = controller.config.troubleCodeList;
    this.currTroubleList = this.initTroubleMsg();


    // TEST DATA
    this.testData = _.map(this.moduleList, (obj, index) => {
      return {
        photovoltaic_seq: obj.photovoltaic_seq,
        ch: index + 1,
        amp: 0,
        vol: 0,
      }
    })
  }

  /**
   * Trouble List를 저장할 초기 리스트 설정
   */
  initTroubleMsg() {
    BU.CLI(this.troubleCodeList)
    const returnValue = [];
    this.troubleCodeList.forEach(ele => {
      let addObj = {
        connector_seq: this.deviceSavedInfo.connector_seq,
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


  /**
   * 
   * @param {String} troubleCode Trouble Code
   * @param {Boolean} hasOccur 발생 or 해결
   */
  onTroubleData(troubleCode, hasOccur) {
    // BU.CLI('onTroubleData', troubleCode, this.troubleCodeList)
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

  initControlStatus() {
    this.controlStatus = {
      reserveCmdList: [],
      processCmd: {},
      sendIndex: -1,
      retryChance: 3,
      reconnectInverterInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }
  }

  /**
   * 접속반 컨트롤 관련 Getter
   */

  get reserveCmdList() {
    return this.controlStatus.reserveCmdList;
  }

  get processCmd() {
    return this.controlStatus.processCmd;
  }



  // Module List에 맞는 데이터 저장소 정의
  initModule() {
    this.moduleList.forEach(moduleObj => {
      let addObj = {
        photovoltaic_seq: moduleObj.photovoltaic_seq,
        ch: 0,
        amp: 0,
        vol: 0,
      }
      this.moduleDataList.push(addObj);
    })

  }


  // 데이터 정제한 데이터 테이블 (10배수 하여 반환)
  get refineConnectorData() {
    const returnValue = this.moduleDataList.map(ele => {
      return {
        photovoltaic_seq: ele.photovoltaic_seq,
        amp: NU.multiplyScale2Value(ele.amp, 10, 1),
        vol: NU.multiplyScale2Value(ele.vol, 10, 1),
      }
    })

    // BU.CLI(returnValue)
    return returnValue;
  }

  get connectorData() {
    return this.moduleDataList;
  }

  // Connecotr Data 수신
  /**
   * 접속반 데이터 Model에 저장
   * @param {Array} connectorDataList Array
   * @returns {Void} 
   */
  onData(connectorDataList) {
    // BU.CLI('ondata', connectorDataList)

    this.initModule();
    connectorDataList.forEach(dataInfo => {
      let findObj = _.findWhere(this.moduleList, {
        connector_ch: dataInfo.ch,
        connector_seq: this.deviceSavedInfo.connector_seq
      });
      dataInfo.photovoltaic_seq = _.isEmpty(findObj) ? null : findObj.photovoltaic_seq;
    })

    this.moduleDataList = connectorDataList;

    return this.moduleDataList;
  }
}

module.exports = Model;