const Promise = require('bluebird');
const _ = require('underscore');
const cron = require('cron');
const BMJ = require('base-model-jh');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

class Model {
  constructor(controller) {
    this.controller = controller;

    this.hasDbWriter = controller.config.hasDbWriter;

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

    inverterListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 인버터 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }
      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      measureInverterDataList.push(refineData);
    })


    // TEST 인버터 데이터에 기초해 데이터 넣음
    if (this.hasDbWriter) {
      let connectorData = [];
      let connectorSeqList = [[1, 2, 5, 3], [4, 6]];
      let connectorArr = [{}, {}];
      inverterListData.forEach(refineData => {
        connectorSeqList.forEach((cntSeqGroup, cIndex) => {
          let findIndex = cntSeqGroup.findIndex(ele => ele === refineData.inverter_seq);
          if (findIndex !== -1) {
            connectorArr[cIndex][`ch_${findIndex + 1}`] = refineData.in_a;
            connectorArr[cIndex].v = refineData.in_v;
            connectorArr[cIndex].connector_seq = cIndex + 1;
          }
        })
      })
      this.completeMeasureConnector(measureTime, connectorArr);
      // BU.CLI(connectorArr)
    }

    // BU.CLI(measureInverterDataList)
    BU.CLI('Success:', measureInverterDataList.length, 'Fail', inverterListData.length - measureInverterDataList.length)

    // TEST 실제 입력은 하지 않음. 
    // return;

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

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Object} connectorListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Promise} DB 입력한 결과
   */
  completeMeasureConnector(measureTime, connectorListData) {
    let measureConnectorDataList = [];

    connectorListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 접속반 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }
      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      measureConnectorDataList.push(refineData);
    })

    // BU.CLI(measureConnectorDataList)
    BU.CLI('Success:', measureConnectorDataList.length, 'Fail', connectorListData.length - measureConnectorDataList.length)

    // TEST 실제 입력은 하지 않음. 
    // return;

    Promise.map(measureConnectorDataList, measureData => {
      return this.BM.setTable('connector_data', measureData);
    }).then(result => {
      // 데이터 정상적으로 입력 수행
      BU.CLI(result)
      return true;
    }).catch(err => {
      BU.errorLog('measureConnectorScheduler', err);
      return false;
    })


  }
}

module.exports = Model;