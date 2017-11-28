const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.cntSavedInfo = controller.config.cntSavedInfo;
    this.moduleList = controller.config.moduleList;

    this.maxChNum = _.max(this.moduleList, moduleObj => moduleObj.connector_ch).connector_ch;

    this.moduleDataList = [];
   
    this.hasConnectedConnector = false;

    this.vol = 0;
    this.ampList = [];
  }

  // Module List에 맞는 데이터 저장소 정의
  initModule(){
    this.moduleList.forEach(moduleObj => {
      let addObj = {
        photovoltaic_seq: moduleObj.photovoltaic_seq,
        amp: 0,
        vol: 0,
      }
      this.moduleDataList.push(addObj);
    })

  }


  // 데이터 정제한 데이터 테이블
  get refineConnectorData() {
    return this.moduleDataList;
  }

  get connectorData() {
    let returnValue = [];

    returnValue = _.map(this.moduleDataList, moduleData => {
      return {
        photovoltaic_seq: moduleData.photovoltaic_seq,
        amp:NU.multiplyScale2Value(moduleData.amp, 0.1, 1),
        vol:NU.multiplyScale2Value(moduleData.vol, 0.1, 1),
      }
    })

    return returnValue;
  }

  // Connecotr Data 수신
  /**
   * 접속반 데이터 Model에 저장
   * @param {Array} data Array
   * @returns {Void} 
   */
  onData(data) {
    // BU.CLI('ondata', data, this.config)
    // TEST Test data
    data = [2513, 0, 0, 0, 20, 21, 22, 23, 24, 25]

    // NU.multiplyScale2Obj(data)
    this.vol = data[this.cntSavedInfo.addr_v];
    this.ampList = data.slice(this.cntSavedInfo.addr_a, this.cntSavedInfo.addr_a + this.maxChNum)
    
    this.moduleList.forEach(moduleObj => {
      let chIndex = Number(moduleObj.connector_ch) - 1;
      let findModuleData = _.findWhere(this.moduleDataList, {photovoltaic_seq: moduleObj.photovoltaic_seq});
      findModuleData.amp = this.ampList[chIndex];
      findModuleData.vol = this.vol;
    })

    // BU.CLI(this.moduleDataList)
    // BU.CLIS(this.vol, this.ampList, this.refineConnectorData)
    return this.moduleDataList;
  }
}

module.exports = Model;