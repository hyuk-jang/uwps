'use strict';
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
   * @param {Object} controller.config.deviceInfo 인버터, 접속반 등등 자식 그룹 정보
   * @param {Array} controller.config.deviceInfo.typeList 그룹 리스트 명
   */
  constructor(controller) {
    this.controller = controller;

    this.controllerConfig = this.controller.config;
    this.deviceTypeList = this.controller.config.deviceInfo.typeList;

    this.hasCopyInverterData = controller.config.devOption.hasCopyInverterData;
    this.hasInsertQuery = controller.config.devOption.hasInsertQuery;

    // 생성한 인버터, 접속반 컨트롤러 객체 리스트
    this.inverterControllerList = [];
    this.connectorControllerList = [];

    // 최근에 계측한 인버터, 접속반 데이터 리스트
    this.inverterDataList = [];
    this.connectorDataList = [];

    /**
     * 하부 Controller에서 계측한 데이터 저장소
     * @type {Array.<{key: string, insertTroubleList: Array, updateTroubleList: Array, insertDataList: Array, storage: Array.<{ id: string, seq: string, measureDate: Date, systemErrorList: Array.<{code: string, msg: string, occur_date: Date}>, data: Array | Object, convertData: Array, troubleList: Array.<{code: string, msg: string}>}}>} upmsDeviceDataList 
     */
    this.upmsDeviceDataList = [];

    /** 
     * 하부 Controller Chainging 객체 저장소 
     * @type {Array.<{key: string, storage: Array.<{id: string, seq: number,controller: Object}>}>}
     */
    this.upmsDeviceControllerList = [];

    this.initDeviceGroup();

    this.BM = new bmjh.BM(this.controller.config.dbInfo);

  }

  /**
   * UPSAS 자식 객체들의 총 정보 집합을 초기화
   */
  initDeviceGroup() {
    this.upmsDeviceDataList = [];
    this.upmsDeviceControllerList = [];


    this.deviceTypeList.forEach(deviceType => {
      let addDataObj = {
        key: deviceType,
        insertTroubleList: [],
        updateTroubleList: [],
        insertDataList: [],
        storage: []
      };

      let addControllerObj = {
        key: deviceType,
        storage: []
      };

      this.controller.config[`${deviceType}List`].forEach(deviceConfigObj => {
        const deviceSavedInfo = deviceConfigObj.current.deviceSavedInfo;
        const addDataStorageObj = {
          id: deviceSavedInfo.target_id,
          seq: deviceSavedInfo[`${deviceType}_seq`],
          systemErrorList: [],
          data: null,
          convertData: null,
          troubleList: []
        };
        addDataObj.storage.push(addDataStorageObj);

        const addControllerStorageObj = {
          id: deviceSavedInfo.target_id,
          seq: deviceSavedInfo[`${deviceType}_seq`],
          controller: {}
        };
        addControllerObj.storage.push(addControllerStorageObj);
      });
      this.upmsDeviceDataList.push(addDataObj);
      this.upmsDeviceControllerList.push(addControllerObj);
    });
  }

  /**
   * Child Controller를 설정
   * @param {string} deviceType 자식 컨트롤 종류
   * @param {Array} deviceControllerList Controller init List
   */
  setDeviceController(deviceType, deviceControllerList) {
    // BU.CLI('setDeviceController', deviceType, this.upsasControllerList);
    let findUpsasController = _.findWhere(this.upmsDeviceControllerList, {
      key: deviceType
    });
    if (_.isEmpty(findUpsasController)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }

    // 장치 컨트롤러 반복
    deviceControllerList.forEach(controller => {
      let controllerGroup = this.findUpsasController(controller.deviceId);
      if (_.isEmpty(controllerGroup)) {
        throw Error(`${controller.deviceId}를 가진 Controller는 없습니다.`);
      }
      controllerGroup.controller = controller;
    });
    return findUpsasController;
  }

  /**
   * 장치 ID를 가진 Data Model 객체 반환
   * @param {string} deviceId 장치 ID
   */
  findUpsasData(deviceId) {
    let returnValue = _.map(this.upmsDeviceDataList, data => {
      let resultFind = _.findWhere(data.storage, {
        id: deviceId
      });
      return resultFind;
    });

    return _.first(returnValue);
  }

  /**
   * 장치 ID를 가진 Controller Object 객체 반환
   * @param {string} deviceId 장치 ID
   */
  findUpsasController(deviceId) {
    let returnValue = _.map(this.upmsDeviceControllerList, data => {
      let resultFind = _.findWhere(data.storage, {
        id: deviceId
      });
      return resultFind;
    });

    return _.first(returnValue);
  }

  /**
   * 장치 데이터 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  findUpsasDataGroup(deviceType) {
    const dataGroup = _.findWhere(this.upmsDeviceDataList, {
      key: deviceType
    });
    if (_.isEmpty(dataGroup)) {
      throw Error(`${deviceType} Controller Group은 없습니다.`);
    }

    return dataGroup;
  }

  /**
   * 장치 컨트롤러 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  getUpsasControllerGrouping(deviceType) {
    const controllerGroup = _.findWhere(this.upmsDeviceControllerList, {
      key: deviceType
    });
    if (_.isEmpty(controllerGroup)) {
      throw Error(`${deviceType} Controller Group은 없습니다.`);
    }

    return _.map(controllerGroup.storage, obj => {
      return obj.controller;
    });
  }


  /**
   * Device Controller 부터 받은 데이터
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array|Object} deviceControllerMeasureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  onDeviceData(measureTime, deviceControllerMeasureData, deviceType) {
    BU.CLI('onDeviceData', measureTime, deviceControllerMeasureData);
    try {
      let id = deviceControllerMeasureData.id;
      let deviceDataObj = this.findUpsasData(id);
      if (_.isEmpty(deviceDataObj)) {
        throw Error(`device ID: ${id}가 이상합니다.`);
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

      deviceDataObj.measureDate = BU.convertDateToText(measureTime);
      deviceDataObj.data = deviceControllerMeasureData.data;
      deviceDataObj.systemErrorList = deviceControllerMeasureData.systemErrorList;
      deviceDataObj.troubleList = deviceControllerMeasureData.troubleList;

      return deviceDataObj;
    } catch (error) {
      throw Error(error);
    }
  }

  /**
   * 장치 그룹을 DB에 입력
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array|Object} deviceControllerMeasureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  onMeasureDeviceList(measureTime, deviceControllerMeasureData, deviceType) {
    BU.CLI('onMeasureDeviceList', deviceControllerMeasureData);

    let upsasDataGroup = this.findUpsasDataGroup(deviceType);

    if (_.isEmpty(upsasDataGroup)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }
    if (typeof deviceControllerMeasureData === 'object' && Array.isArray(deviceControllerMeasureData)) {
      deviceControllerMeasureData.forEach(deviceMeasureData => {
        this.onDeviceData(measureTime, deviceMeasureData);
      });
    } else {
      this.onDeviceData(measureTime, deviceControllerMeasureData);
    }

    return upsasDataGroup;
  }

  /**
   * 실제 계측한 데이터 처리
   * @param {string} deviceType  장치 Type 'inverter', 'connector'
   * @return {Object} upsasDataGroup
   */
  async processMeasureData(deviceType) {
    let upsasDataGroup = this.findUpsasDataGroup(deviceType);
    // deviceType Trouble 조회
    let dbTroubleList = await this.getTroubleList(deviceType);
    // BU.CLI(dbTroubleList);

    upsasDataGroup.storage.forEach(dataObj => {
      const contollerInfo = this.findUpsasController(dataObj.id);
      const deviceSavedInfo = contollerInfo.controller.getDeviceInfo();
      // BU.CLI(deviceSavedInfo);

      let resultProcessError;
      let hasSystemError = false;
      // 시스템 에러가 있다면 
      if (dataObj.systemErrorList.length) {
        hasSystemError = true;
        resultProcessError = this.processDeviceErrorList(dataObj.systemErrorList, dbTroubleList, dataObj.seq, 1, deviceType);
      } else { // 장치 에러 처리
        resultProcessError = this.processDeviceErrorList(dataObj.troubleList, dbTroubleList, dataObj.seq, 0, deviceType);
      }

      // BU.CLI(resultProcessError);
      upsasDataGroup.insertTroubleList = upsasDataGroup.insertTroubleList.concat(resultProcessError.insertTroubleList);
      upsasDataGroup.updateTroubleList = upsasDataGroup.updateTroubleList.concat(resultProcessError.updateTroubleList);

      // 시스템 에러가 없을 경우에 insert 구문 입력
      if (!hasSystemError) {
        const convertDataList = this.processDeviceDataList(dataObj.data, deviceSavedInfo, deviceType);
        dataObj.convertData = convertDataList; 
        upsasDataGroup.insertDataList = upsasDataGroup.insertDataList.concat(convertDataList);
      }
    });

    // 남아있는 dbTroubleList는 Clear 처리
    dbTroubleList.forEach(dbTrouble => {
      upsasDataGroup.updateTroubleList.push({
        tbName: `${deviceType}_trouble_data`,
        whereObj: {
          key: `${deviceType}_trouble_data_seq`,
          value: dbTrouble[`${deviceType}_trouble_data_seq`]
        },
        updateObj: {
          fix_date: null
        }
      });
    });

    return upsasDataGroup;
  }


  /**
   * Device Error 처리. 신규 에러라면 insert, 기존 에러라면 dbTroubleList에서 해당 에러 삭제, 최종으로 남아있는 에러는 update
   * @param {Array.<{code: string, msg: string, occur_date: Date}>} deviceErrorList 장치에서 발생된 시스템 에러 목록
   * @param {Array} dbTroubleList DB에서 가져온 trouble list.
   * @param {number} seq 에러 시퀀스
   * @param {boolean} isSystemError System Error 인지 여부
   * @param {string} deviceType 장치 타입 
   * @return {{insertTroubleList: Array.<{code: string, msg: string, occur_date: Date}>, updateTroubleList: Array.<{tbName: string, whereObj: {key: string, value: number}, updateObj: {fix_date: Date}}>, dbTroubleList: Array}} 삽입 목록과 수정 목록, 수정한 dbTroubleList 
   */
  processDeviceErrorList(deviceErrorList, dbTroubleList, seq, isSystemError, deviceType) {
    BU.CLI('processSystemErrorList', deviceErrorList, seq, deviceType);

    const insertTroubleList = [];
    const updateTroubleList = [];

    const keyName = `${deviceType}_seq`;
    deviceErrorList.forEach(errorObj => {
      // BU.CLI(systemError);
      let hasNewError = true;
      // // 기존 시스템 에러가 존재한다면 처리할 필요가 없으므로 dbTroubleList에서 삭제
      dbTroubleList = _.reject(dbTroubleList, dbTrouble => {
        // TODO 발생한 날짜를 기입하도록 변경 필요
        if (dbTrouble.code === errorObj.code && dbTrouble[keyName] === seq) {
          hasNewError = false;
          return true;
        } else {
          return false;
        }
      });
      // 신규 에러라면 insertList에 추가
      if (hasNewError) {
        let addErrorObj = {
          [keyName]: seq,
          is_error: isSystemError,
          code: errorObj.code,
          msg: errorObj.msg,
          occur_date: errorObj.occur_date || null,
          fix_date: null
        };

        insertTroubleList.push(addErrorObj);
      }
    });
    // 시스템 에러가 발생할 경우 trouble, data check는 하지 않으므로 남아있는 시스템 에러를 dbTrouble에서 제거함
    dbTroubleList = _.reject(dbTroubleList, dbTrouble => {
      let hasResultOption = isSystemError ? dbTrouble.is_error === 1 : true;
      if (dbTrouble[keyName] === seq && hasResultOption) {
        updateTroubleList.push({
          tbName: `${deviceType}_trouble_data`,
          whereObj: {
            key: `${deviceType}_trouble_data_seq`,
            value: dbTrouble[`${deviceType}_trouble_data_seq`]
          },
          updateObj: {
            fix_date: null
          }
        });
        return true;
      } else {
        return false;
      }
    });

    return {
      insertTroubleList,
      updateTroubleList,
      dbTroubleList
    };
  }

  /**
   * 장치 데이터 리스트 keyBinding 처리하여 반환
   * @param {Object|Array} deviceData 
   * @param {Object} deviceSavedInfo 
   * @param {string} deviceType 장치 타입 (inverter, connector)
   */
  processDeviceDataList(deviceData, deviceSavedInfo, deviceType) {
    // 배열 일 경우에는 재귀
    if (_.isArray(deviceData)) {
      let convertDataList = [];
      convertDataList = convertDataList.concat(deviceData.forEach(data => this.processDeviceDataList(data, deviceSavedInfo, deviceType)));
      return convertDataList;
    } else if (_.isObject(deviceData)) {
      let bindingObj = _.findWhere(keybinding.binding, {
        deviceType
      });
      
      let convertData = {};
      const addParamList = bindingObj.addParamList;
      const dataTableName = bindingObj.dataTableName;
      const matchingList = bindingObj.matchingList;

      // 계산식 반영
      matchingList.forEach(matchingObj => {
        convertData[matchingObj.updateKey] = this.calculateMatchingData(deviceData, matchingObj);
      });

      addParamList.forEach(addParam => {
        convertData[addParam.updateKey] = deviceSavedInfo[addParam.baseKey];
      });

      return [convertData];
    }
  }

  /**
   * 
   * @param {Object} deviceData 장치 데이터
   * @param {{baseKey: string, updateKey: string, calculate: string|number, toFixed: number}} matchingBindingObj 
   * @return {number} 계산 결과
   */
  calculateMatchingData(deviceData, matchingBindingObj) {
    // BU.CLI('calculateMatchingData', matchingBindingObj, deviceData );
    let resultCalculate = 0;
    try {
      let baseKey = matchingBindingObj.baseKey;
      let calculate = matchingBindingObj.calculate;
      let toFixed = matchingBindingObj.toFixed;
      var reg = /[a-zA-Z]/;
      // 계산식이 숫자일 경우는 eval 하지 않음
      if (_.isNumber(calculate)) {
        let data = deviceData[baseKey];
        data = typeof data === 'string' ? Number(data) : data;
        // 숫자가 아니거나 null일 경우 throw 반환
        if (_.isNumber(data)) {
          resultCalculate = Number((deviceData[baseKey] * calculate).toFixed(toFixed));
        } else {
          throw Error(`해당 데이터는 숫자가 아님: ${deviceData[baseKey]}`);
        }
      } else { // 계산식이 문자일 경우 eval 계산식 생성
        let finalMsg = '';
        let tempBuffer = '';
        for (let i = 0; i < calculate.length; i += 1) {
          let thisChar = calculate.charAt(i);
          if (reg.test(thisChar)) {
            tempBuffer += thisChar;
          } else {
            if (tempBuffer !== '') {
              finalMsg += `deviceData['${tempBuffer}']`;
              tempBuffer = '';
            }
            finalMsg += thisChar;
          }
          if (calculate.length === i + 1 && tempBuffer !== '') {
            finalMsg += `deviceData['${tempBuffer}']`;
          }
        }
        resultCalculate = Number(Number(eval(finalMsg)).toFixed(toFixed));
        resultCalculate = isNaN(resultCalculate) ? 0 : resultCalculate;
      }
    } catch (error) {
      throw error;
    }

    return resultCalculate;
  }

  async applyMeasureData2Db(){

  }


  /**
   * 
   * @param {string} deviceType 장치 type
   * @param {number} deviceSeq deivce seq
   * @param {Array} dbTroubleList DB에서 조회한 현재 Trouble
   * @param {Array} localTroubleList 장치에서 계측한 Trouble
   * @return {Array.<{{isInsertData: number, insertTroubleList: Array, updateTroubleList: Array}}>} isInsert: 계측 data 입력 여부, insertTroubleList: DB로 새로 삽입할 데이터, updateTroubleList: update 할 Trouble
   */
  getRefineTrouble(deviceType, deviceSeq, dbTroubleList, localTroubleList) {
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
      // BU.CLIS(deviceKey, deviceSeq, dbTrouble[deviceKey]);
      return dbTrouble[deviceKey] === deviceSeq ? true : false;
    });

    // BU.CLIS(filterDbTrouble, localTroubleList);

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
  async getTroubleList(deviceType) {
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