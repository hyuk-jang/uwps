const Promise = require('bluebird');
const _ = require('underscore');
const cron = require('cron');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;

class Model {
  constructor(controller) {
    this.controller = controller;

    this.hasCopyInverterData = controller.config.devOption.hasCopyInverterData;
    this.hasInsertQuery = controller.config.devOption.hasInsertQuery;

    this.inverterControllerList = [];
    this.connectorControllerList = [];

    this.BM = new bmjh.BM(this.controller.config.dbInfo);
  }

  // 인버터 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureInverter(targetId) {
    // BU.CLI('findMeasureInverter', ivtId)
    return _.find(this.inverterControllerList, controller => {
      let targetInfo = controller.getInverterInfo();
      return targetInfo.target_id === targetId;
    })

    return findObj;
  }

  // 접속반 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureConnector(targetId) {
    return _.find(this.connectorControllerList , controller => {
      // BU.CLI(controller)
      let targetInfo = controller.getConnectorInfo();
      return targetInfo.target_id === targetId;
    })
  }

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Object} inverterListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Promise} DB 입력한 결과
   */
  async completeMeasureInverter(measureTime, inverterListData) {
    // BU.CLI(measureTime, inverterListData)
    let measureInverterDataList = [];

    inverterListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 인버터 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }

      let measureHour = measureTime.getHours();
      let measureMin = measureTime.getMinutes();

      // 자정일 경우에는 d_wh를 강제로 초기화 한다
      if(measureHour === 0 && measureMin === 0){
        refineData.d_wh = 0;
      }

      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      measureInverterDataList.push(refineData);
    })


    // TEST 인버터 데이터에 기초해 데이터 넣음
    if (this.hasCopyInverterData) {
      let testCntDataList = [];
      inverterListData.forEach(ivtData => {
        let addObj = {
          photovoltaic_seq: ivtData.inverter_seq,
          amp: ivtData.in_a || null ,
          vol: ivtData.in_v || null,
        }
        testCntDataList.push(addObj);
      })

      // BU.CLI(testCntDataList)
      this.completeMeasureConnector(measureTime, testCntDataList);
    }

    // BU.CLI(measureInverterDataList)
    this.controller.emit('completeMeasureInverter', null, inverterListData)
    // BU.CLI('Success:', measureInverterDataList.length, 'Fail', inverterListData.length - measureInverterDataList.length)

    // TEST 실제 입력은 하지 않음. 
    if(!this.hasInsertQuery){
      return false;
    }

    return await this.BM.setTables('inverter_data', measureInverterDataList);
  }

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Object} connectorListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Promise} DB 입력한 결과
   */
  async completeMeasureConnector(measureTime, connectorListData) {
    // BU.CLI('completeMeasureConnector', connectorListData)
    let measureConnectorDataList = [];

    connectorListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 인버터 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }
      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      measureConnectorDataList.push(refineData);
    })

    // BU.CLI(measureConnectorDataList)
    this.controller.emit('completeMeasureConnector',  null, connectorListData)
    // BU.CLI('Success:', measureConnectorDataList.length, 'Fail', connectorListData.length - measureConnectorDataList.length)

    // TEST 실제 입력은 하지 않음. 
    if(!this.hasInsertQuery){
      return false;
    }

    // BU.CLI(measureConnectorDataList)
    return await this.BM.setTables('module_data', measureConnectorDataList)
  }
}

module.exports = Model;