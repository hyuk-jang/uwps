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

    // 생성한 인버터, 접속반 컨트롤러 객체 리스트
    this.inverterControllerList = [];
    this.connectorControllerList = [];

    // 최근에 계측한 인버터, 접속반 데이터 리스트
    this.inverterDataList = [];
    this.connectorDataList = [];

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
    return _.find(this.connectorControllerList, controller => {
      // BU.CLI(controller)
      let targetInfo = controller.getConnectorInfo();
      return targetInfo.target_id === targetId;
    })
  }

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array} inverterListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Array} Data List
   */
  onInverterDataList(measureTime, inverterListData) {
    // BU.CLI(measureTime, inverterListData)
    this.inverterDataList = [];

    inverterListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 인버터 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }

      let measureHour = measureTime.getHours();
      let measureMin = measureTime.getMinutes();

      // 자정일 경우에는 d_wh를 강제로 초기화 한다
      if (measureHour === 0 && measureMin === 0) {
        refineData.d_wh = 0;
      }

      // BU.CLI(measureTime)
      refineData.writedate = BU.convertDateToText(measureTime);
      this.inverterDataList.push(refineData);
    })


    // TEST 인버터 데이터에 기초해 데이터 넣음
    if (this.hasCopyInverterData) {
      let testCntDataList = [];
      inverterListData.forEach(ivtData => {
        let addObj = {
          photovoltaic_seq: ivtData.inverter_seq,
          amp: ivtData.in_a || null,
          vol: ivtData.in_v || null,
        }
        testCntDataList.push(addObj);
      })

      // BU.CLI(testCntDataList)
      let dummyConnectorDataList = this.onConnectorDataList(measureTime, testCntDataList);
      this.insertQuery('module_data', dummyConnectorDataList)
        .then(resQuery => {})
        .catch(err => {
          BU.errorLog('insertErrorDB', err)
        })
    }

    return this.inverterDataList;
  }


  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array} connectorListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Array} Data List
   */
  onConnectorDataList(measureTime, connectorListData) {
    // BU.CLI('completeMeasureConnector', connectorListData)
    this.connectorDataList = [];

    connectorListData.forEach(refineData => {
      // TODO 메시지 발송? 에러 처리? 인버터 정지? 고민 필요
      if (_.isEmpty(refineData)) {
        return;
      }
      refineData.writedate = BU.convertDateToText(measureTime);
      this.connectorDataList.push(refineData);
    })

    return this.connectorDataList;
  }

  /**
   * 계측한 인버터, 접속반 Data List를 DB에 입력
   * @param {String} tbName DB Table Name
   * @param {Array} dataList 계측한 리스트
   * @returns {Promise} 성공 유무
   */
  async insertQuery(tbName, dataList) {
    // TEST 실제 입력은 하지 않음. 
    if (this.hasInsertQuery) {
      return await this.BM.setTables(tbName, dataList);
    } else {
      return {};
    }
  }
}

module.exports = Model;