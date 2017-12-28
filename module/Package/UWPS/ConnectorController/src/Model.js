const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.cntSavedInfo = controller.config.cntSavedInfo;
    this.moduleList = controller.config.moduleList;

    this.moduleDataList = [];

    this.hasConnectedDevice = false;

    this.controlStatus = {
      reserveCmdList: [], // Buffer List
      processCmd: {}, // 일반적으로 Buffer
      sendIndex: -1,  // Dev Test Stub 데이터 가져오는 index 용
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60,  // 장치 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1   // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    }

  }

  initControlStatus() {
    this.controlStatus = {
      reserveCmdList: [],
      processCmd: {},
      sendIndex: -1,
      retryChance: 3,
      reconnectInverterInterval: 1000 * 60,  // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1   // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
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


  // 데이터 정제한 데이터 테이블
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
    // BU.CLI('ondata', data)

    this.initModule();
    connectorDataList.forEach(dataInfo => {
      let findObj = _.findWhere(this.moduleList, {
        connector_ch: dataInfo.ch,
        connector_seq: this.cntSavedInfo.connector_seq
      });
      dataInfo.photovoltaic_seq = _.isEmpty(findObj) ? null : findObj.photovoltaic_seq;
    })

    this.moduleDataList = connectorDataList;

    return this.moduleDataList;
  }
}

module.exports = Model;