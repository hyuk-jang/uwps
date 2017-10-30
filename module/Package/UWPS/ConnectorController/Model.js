const BUJ = require('base-util-jh');

const NU = BUJ.newUtil;

class Model {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config.cntSavedInfo;

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

    returnvalue = NU.multiplyScale2Obj(returnvalue, 10, 0);

    returnvalue.connector_data_seq = this.config.connector_seq;

    // Scale 10 배수 처리
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
    data = [10, 0, 0, 0, 25, 22, 65, 43, 68, 96]

    this.vol = data[this.config.addr_v];
    this.ampList = data.slice(this.config.addr_a, this.config.addr_a + this.config.ch_number)

    // BU.CLIS(this.vol, this.ampList, this.refineConnectorData)
    // return true;
  }
}

module.exports = Model;