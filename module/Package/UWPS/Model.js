const _ = require('underscore');


class Model {
  constructor(controller) {
    this.controller = controller;

    this.measureInverterList = [];
    this.measureConnectorList = [];

  }

  // 인버터 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureInverter(ivtId){
    BU.CLI('findMeasureInverter', ivtId)
    let findObj = _.find(this.measureInverterList, ivtController => {
      let ivtInfo = ivtController.getInverterInfo();
      BU.CLIS(ivtInfo,ivtId)
      return ivtInfo.target_id === ivtId;
    })
    // BU.CLI(findObj)
    
    return findObj;
  }

  // 접속반 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureConnector(cntId){

  }

}

module.exports = Model;