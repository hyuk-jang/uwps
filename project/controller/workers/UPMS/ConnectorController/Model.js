const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.cntSavedInfo = controller.config.cntSavedInfo;

    this.hasConnectedConnector = false;

    this.vol = 0;
    this.ampList = [];
  }


  // 데이터 정제한 데이터 테이블
  get refineConnectorData() {
    let returnvalue = {
      v: this.vol
    };

    // BU.CLI(this.ampList)
    this.ampList.forEach((ele, index) => {
      returnvalue['ch_' + (index + 1)] = ele;
    })

    // returnvalue = NU.multiplyScale2Obj(returnvalue, 10, 0);
    returnvalue.connector_data_seq = this.cntSavedInfo.connector_seq;

    // Scale 10 배수 처리
    return returnvalue;
  }

  get connectorData() {
    let returnvalue = {
      v: this.vol
    };

    // BU.CLI(this.ampList)
    this.ampList.forEach((ele, index) => {
      returnvalue['ch_' + (index + 1)] = ele;
    })

    returnvalue = NU.multiplyScale2Obj(returnvalue, 0.1, 1);
    returnvalue.connector_data_seq = this.cntSavedInfo.connector_seq;
    return returnvalue;
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
    data = [2513, 0, 0, 0, 25, 22, 65, 43, 68, 96]

    NU.multiplyScale2Obj(data)
    
    this.vol = data[this.cntSavedInfo.addr_v];
    this.ampList = data.slice(this.cntSavedInfo.addr_a, this.cntSavedInfo.addr_a + this.cntSavedInfo.ch_number)

    // BU.CLIS(this.vol, this.ampList, this.refineConnectorData)
    // return true;
  }
}

module.exports = Model;