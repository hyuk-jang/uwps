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
  completeMeasureInverter(measureTime, inverterListData) {
    BU.CLI(measureTime, inverterListData)
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
    if (this.hasCopyInverterData) {
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
    this.controller.emit('completeMeasureInverter', null, inverterListData)
    // BU.CLI('Success:', measureInverterDataList.length, 'Fail', inverterListData.length - measureInverterDataList.length)

    // TEST 실제 입력은 하지 않음. 
    if(!this.hasInsertQuery){
      return false;
    }

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
    // BU.CLI(measureTime, connectorListData)
    let measureConnectorDataList = [];


    // NOTE 나중에 db schema 변할 경우 작업
    // connectorListData.forEach((refineData, key) => {
    //   let volObj = {};
    //   volObj.connector_seq = refineData.connector_seq;
    //   volObj.data_type = 'vol';
    //   volObj.value = refineData.vol;
    //   measureConnectorDataList.push(volObj);

    //   refineData.ampList.forEach((amp, index) => {
    //     let ampObj = {};
    //     amp.connector_seq = refineData.connector_seq;
    //     amp.data_type = 'vol';
    //     amp.value = refineData.vol;
    //     measureConnectorDataList.push(volObj);
    //   })
    // })

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
    this.controller.emit('completeMeasureConnector',  null, connectorListData)
    // BU.CLI('Success:', measureConnectorDataList.length, 'Fail', connectorListData.length - measureConnectorDataList.length)

    // TEST 실제 입력은 하지 않음. 
    if(!this.hasInsertQuery){
      return false;
    }

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