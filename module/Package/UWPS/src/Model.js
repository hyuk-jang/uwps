const Promise = require('bluebird');
const _ = require('underscore');
const cron = require('cron');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;

const keybinding = require('../config/keybinding');

class Model {
  /**
   * 
   * @param {Object} controller UPSAS 제어 Main Process
   * @param {Object} controller.config Main Process 생성 옵션 정보
   * @param {Object} controller.config.devOption 개발자 모드 관련 정보
   * @param {Object} controller.config.childInfo 인버터, 접속반 등등 자식 그룹 정보
   * @param {Array} controller.config.childInfo.typeList 그룹 리스트 명
   */
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

    this.upsasDataList = this.initChildGroup();

    this.BM = new bmjh.BM(this.controller.config.dbInfo);

  }

  /**
   * UPSAS 자식 객체들의 총 정보 집합을 초기화
   */
  initChildGroup() {
    const returnValue = [];
    this.controller.config.childInfo.typeList.forEach(deviceType => {
      let addObj = {
        key: deviceType,
        storageList: []
      };
      returnValue.push(addObj);
    });
    return returnValue;
  }

  /**
   * Child Controller를 설정
   * @param {string} deviceType 자식 컨트롤 종류
   * @param {Array} deviceControllerList Controller init List
   */
  setDeviceGroup(deviceType, deviceControllerList) {
    let findObj = _.findWhere(this.upsasDataList, {
      key: deviceType
    });
    if (_.isEmpty(findObj)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }

    findObj.storageList = [];

    deviceControllerList.forEach(controller => {
      let addObj = {
        id: controller.deviceId,
        seq: controller.deviceSeq,
        controller: controller,
        measureTime: {},
        data: {},
        troubleList: []
      };
      BU.CLI(controller.deviceSeq);
      findObj.storageList.push(addObj);
    });
  }

  /**
   * 장치 ID를 가진 Model Controller 객체 반환
   * @param {string} deviceId 장치 ID
   */
  findDeviceGroup(deviceId) {
    let returnValue;
    _.find(this.upsasDataList, data => {
      // BU.CLI(data);
      returnValue = _.findWhere(data.storageList, {
        id: deviceId
      });
      if (_.isEmpty(returnValue)) {
        return false;
      } else {
        return true;
      }
    });

    return returnValue;
  }

  /**
   * Device Controller 부터 받은 데이터
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array|Object} deviceControllerMeasureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceType 자식 컨트롤 종류
   */
  onDeviceData(measureTime, deviceControllerMeasureData, deviceType) {
    if (typeof deviceControllerMeasureData === 'object' && Array.isArray(deviceControllerMeasureData)) {
      return deviceControllerMeasureData.forEach(ele => this.onDeviceData(measureTime, ele));
    }

    BU.CLI(measureTime, deviceControllerMeasureData);
    let id = deviceControllerMeasureData.id;
    let childGroupObj = this.findDeviceGroup(id);
    if (_.isEmpty(childGroupObj)) {
      throw Error(`child ID: ${id}가 이상합니다.`);
    }

    // 인버터일 경우에는 계측 시간이 자정일 경우에 일간 발전량을 초기화 시킴
    if (deviceType === 'inverter') {
      let measureHour = measureTime.getHours();
      let measureMin = measureTime.getMinutes();

      // 자정일 경우에는 d_wh를 강제로 초기화 한다
      if (measureHour === 0 && measureMin === 0) {
        deviceControllerMeasureData.data.d_wh = 0;
      }
    }


    childGroupObj.measureDate = BU.convertDateToText(measureTime);
    childGroupObj.data = deviceControllerMeasureData.data;
    childGroupObj.troubleList = deviceControllerMeasureData.troubleList;

    return true;
  }

  /**
   * 장치 그룹을 DB에 입력
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  async updateUpsas2Db(deviceType) {
    BU.CLI('updateUpsas2Db', deviceType);
    let upsasData = _.findWhere(this.upsasDataList, {
      key: deviceType
    });
    if (_.isEmpty(upsasData)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }

    let troubleList = await this.getTroubleList(deviceType);

    upsasData.storageList.forEach(dataObj => {
      let seq = dataObj.seq;
      let refineTrouble =  this.getRefineTrouble(deviceType, seq, troubleList, dataObj.troubleList);

    });

    // let binding = _.findWhere(keybinding.binding, {
    //   deviceType: deviceType
    // });
    // let dataTableName = binding.dataTableName;
    // let troubleTableName = binding.troubleTableName;
  }

  /**
   * 
   * @param {string} deviceType 장치 type
   * @param {number} deviceSeq deivce seq
   * @param {Array} dbTroubleList DB에서 조회한 현재 Trouble
   * @param {Array} localTroubleList 장치에서 계측한 Trouble
   * @return {Array.<{{isInsertData: number, insertTroubleList: Array, updateTroubleList: Array}}>} isInsert: 계측 data 입력 여부, insertTroubleList: DB로 새로 삽입할 데이터, updateTroubleList: update 할 Trouble
   */
  getRefineTrouble(deviceType, deviceSeq, dbTroubleList, localTroubleList){
    const returnValue = {
      isInsertData: 0,
      currentTroubleList: [],
      insertTroubleList: [],
      updateTroubleList: []
    };

    // BU.CLIS(dbTroubleList, localTroubleList);
    // DB에서 얻어온 DB List 중에서 Device Seq와 같은 요소만 뽑아냄
    let deviceKey = `${deviceType}_seq`;
    let filterDbTrouble = _.filter(dbTroubleList, dbTrouble => {
      BU.CLIS(deviceKey , deviceSeq, dbTrouble[deviceKey]);
      return dbTrouble[deviceKey] === deviceSeq ? true : false;
    }); 

    BU.CLIS(filterDbTrouble, localTroubleList);

    // 장치에서 수신한 Trouble 순회
    localTroubleList.forEach(localTrouble => {
      
      
    });


    return returnValue;
  }



  // 인버터 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureInverter(targetId) {
    // BU.CLI('findMeasureInverter', ivtId)
    return _.find(this.inverterControllerList, controller => {
      let targetInfo = controller.getInverterInfo();
      return targetInfo.target_id === targetId;
    });

    return findObj;
  }

  // 접속반 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureConnector(targetId) {
    return _.find(this.connectorControllerList, controller => {
      // BU.CLI(controller)
      let targetInfo = controller.getConnectorInfo();
      return targetInfo.target_id === targetId;
    });
  }

  // TODO 에러 시 예외처리, 인버터 n개 중 부분 성공일 경우 처리
  /**
   * 인버터 계측 Event가 모두 완료될 경우 호출되는 Method
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array} inverterListData 계측한 값. NOTE 쓸지 말지는 기획에 따라서 차후 처리
   * @returns {Array} Data List
   */
  onInverterDataList(measureTime, inverterListData) {
    // BU.CLI(measureTime, inverterListData);
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
    });


    // TEST 인버터 데이터에 기초해 데이터 넣음
    if (this.hasCopyInverterData) {
      let testCntDataList = [];
      inverterListData.forEach(ivtData => {
        let addObj = {
          photovoltaic_seq: ivtData.inverter_seq,
          amp: ivtData.in_a || null,
          vol: ivtData.in_v || null,
        };
        testCntDataList.push(addObj);
      });

      // BU.CLI(testCntDataList)
      let dummyConnectorDataList = this.onConnectorDataList(measureTime, testCntDataList);
      this.insertQuery('module_data', dummyConnectorDataList)
        .then(resQuery => {})
        .catch(err => {
          BU.errorLog('insertErrorDB', err);
        });
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
    });

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

  /**
   * 인버터 및 접속반 에러 리스트 가져옴
   * @param {string} deviceType 'inverter' or 'connect'
   */
  async getTroubleList(deviceType){
    let sql = `
      SELECT o.*
        FROM ${deviceType}_trouble_data o                    
          LEFT JOIN ${deviceType}_trouble_data b             
              ON o.${deviceType}_seq = b.${deviceType}_seq AND o.code = b.code AND o.${deviceType}_trouble_data_seq < b.${deviceType}_trouble_data_seq
        WHERE b.${deviceType}_trouble_data_seq is NULL
        ORDER BY o.${deviceType}_trouble_data_seq ASC
    `;

    let returnValue = await this.BM.db.single(sql);

    return returnValue;

  }
}

module.exports = Model;