const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.cntSavedInfo = controller.config.cntSavedInfo;
    this.moduleList = controller.config.moduleList;

    this.moduleDataList = [];

    this.hasConnectedConnector = false;
  }

  // Module List에 맞는 데이터 저장소 정의
  initModule() {
    this.moduleList.forEach(moduleObj => {
      let addObj = {
        photovoltaic_seq: moduleObj.photovoltaic_seq,
        ch:0,
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
      let findObj = _.findWhere(this.moduleList, {connector_ch: dataInfo.ch, connector_seq: this.cntSavedInfo.connector_seq});
      dataInfo.photovoltaic_seq = _.isEmpty(findObj) ? null : findObj.photovoltaic_seq;
    })

    this.moduleDataList = connectorDataList;

    return this.moduleDataList;
  }
}

module.exports = Model;