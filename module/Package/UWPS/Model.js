const _ = require('underscore');
const cron = require('cron');
const BMJ = require('base-model-jh');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

class Model {
  constructor(controller) {
    this.controller = controller;

    this.inverterControllerList = [];
    this.connectorControllerList = [];

    this.BM = new BMJ(this.controller.config.dbInfo);
  }

  // 인버터 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureInverter(ivtId) {
    BU.CLI('findMeasureInverter', ivtId)
    let findObj = _.find(this.inverterControllerList, ivtController => {
      let ivtInfo = ivtController.getInverterInfo();
      BU.CLIS(ivtInfo, ivtId)
      return ivtInfo.target_id === ivtId;
    })
    // BU.CLI(findObj)

    return findObj;
  }

  // 접속반 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureConnector(cntId) {

  }

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Object} inverterListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Promise} DB 입력한 결과
   */
  completeMeasureInverter(measureTime, inverterListData) {
    let measureInverterDataList = [];
    this.inverterControllerList.forEach(inverterController => {
      let refineData = inverterController.refineInverterData;
      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      measureInverterDataList.push(refineData);
    })

    // TEST 실제 입력은 하지 않음. 
    return;

    this.BM.setTables('inverter_data', measureInverterDataList)
      .then(result => {
        // 데이터 정상적으로 입력 수행
        BU.CLI(result)
        return true;
      }).catch(err => {
        BU.errorLog('measureInverterScheduler', err);
        return false;
      })
  }
}

module.exports = Model;