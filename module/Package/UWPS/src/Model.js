'use strict';
const _ = require('underscore');
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

    this.config = this.controller.config;
    this.deviceTypeList = this.config.deviceInfo.typeList;

    this.hasCopyInverterData = this.config.devOption.hasCopyInverterData;
    this.hasInsertQuery = this.config.devOption.hasInsertQuery;

    /**
     * 하부 Controller에서 계측한 데이터 저장소
     * @type {Array.<{key: string, measureDate: Date, insertTroubleList: Array, updateTroubleList: Array, insertDataList: Array, storage: Array.<{ id: string, seq: string, measureDate: Date, systemErrorList: Array.<{code: string, msg: string, occur_date: Date}>, data: Array | Object, convertData: Array, troubleList: Array.<{code: string, msg: string}>}}>} upmsDeviceDataList 
     */
    this.upmsDeviceDataList = [];

    /** 
     * 하부 Controller Chainging 객체 저장소 
     * @type {Array.<{key: string, storage: Array.<{id: string, seq: number,controller: Object}>}>}
     */
    this.upmsDeviceControllerList = [];

    this.initDeviceGroup();

    this.BM = new bmjh.BM(this.config.dbInfo);

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
        measureDate: null,
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
    let upsasController = this.findUpsasControllerGroup(deviceType);

    // 장치 컨트롤러 반복
    deviceControllerList.forEach(controller => {
      let controllerGroup = this.findUpsasController(controller.deviceId, deviceType);
      if (_.isEmpty(controllerGroup)) {
        throw Error(`${controller.deviceId}를 가진 Controller는 없습니다.`);
      }
      controllerGroup.controller = controller;
    });
    return upsasController;
  }

  /**
   * 장치 ID를 가진 Data Model 객체 반환
   * @param {string} deviceId 장치 ID
   * @param {string} deviceType 장치 ID
   */
  findUpsasData(deviceId, deviceType) {
    // BU.CLI(deviceId, deviceType);
    try {
      let upsasDataGroup = this.findUpsasDataGroup(deviceType);
      let returnValue = _.findWhere(upsasDataGroup.storage, { id: deviceId });
      return returnValue;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장치 ID를 가진 Controller Object 객체 반환
   * @param {string} deviceId 장치 ID
   * @param {string} deviceType 장치 ID
   */
  findUpsasController(deviceId, deviceType) {
    try {
      let upsasController = this.findUpsasControllerGroup(deviceType);
      let returnValue = _.findWhere(upsasController.storage, { id: deviceId });
      return returnValue;
    } catch (error) {
      throw error;
    }
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
      throw Error(`${deviceType} Data Group은 없습니다.`);
    }

    return dataGroup;
  }

  /**
   * 장치 컨트롤러 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  findUpsasControllerGroup(deviceType) {
    const controllerGroup = _.findWhere(this.upmsDeviceControllerList, {
      key: deviceType
    });
    if (_.isEmpty(controllerGroup)) {
      throw Error(`${deviceType} Controller Group은 없습니다.`);
    }

    return controllerGroup;
  }

  /**
   * 장치 컨트롤러 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  getUpsasControllerGrouping(deviceType) {
    try {
      const controllerGroup = this.findUpsasControllerGroup(deviceType);
      return _.map(controllerGroup.storage, obj => {
        return obj.controller;
      });
    } catch (error) {
      throw error;
    }
  }


  /**
   * Device Controller 부터 받은 데이터
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array|Object} deviceControllerMeasureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  onDeviceData(measureTime, deviceControllerMeasureData, deviceType) {
    // BU.CLIS('onDeviceData', measureTime, deviceControllerMeasureData, deviceType);
    try {
      let id = deviceControllerMeasureData.id;
      let deviceDataObj = this.findUpsasData(id, deviceType);
      if (_.isEmpty(deviceDataObj)) {
        throw Error(`fn(onDeviceData) device ID: ${id}가 이상합니다.`);
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

      deviceDataObj.measureDate = measureTime;
      deviceDataObj.data = deviceControllerMeasureData.data;
      deviceDataObj.systemErrorList = deviceControllerMeasureData.systemErrorList;
      deviceDataObj.troubleList = deviceControllerMeasureData.troubleList;

      return deviceDataObj;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장치 그룹을 DB에 입력
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {Array|Object} deviceControllerMeasureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  onMeasureDeviceList(measureTime, deviceControllerMeasureData, deviceType) {
    // BU.CLI('onMeasureDeviceList', deviceControllerMeasureData);
    let upsasDataGroup = this.findUpsasDataGroup(deviceType);
    upsasDataGroup.measureDate = measureTime;

    if (_.isEmpty(upsasDataGroup)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }
    if (typeof deviceControllerMeasureData === 'object' && Array.isArray(deviceControllerMeasureData)) {
      deviceControllerMeasureData.forEach(deviceMeasureData => {
        this.onDeviceData(measureTime, deviceMeasureData, deviceType);
      });
    } else {
      this.onDeviceData(measureTime, deviceControllerMeasureData, deviceType);
    }

    return upsasDataGroup;
  }

  /**
   * 실제 계측한 데이터 처리
   * @param {string} deviceType  장치 Type 'inverter', 'connector'
   * @return {Promise} upsasDataGroup
   */
  async processMeasureData(deviceType) {
    // BU.CLI('processMeasureData', deviceType);
    let upsasDataGroup = this.findUpsasDataGroup(deviceType);
    let bindingObj = _.findWhere(keybinding.binding, {
      deviceType
    });
    // BU.CLI(upsasDataGroup);
    // deviceType Trouble 조회
    let dbTroubleList = await this.getTroubleList(deviceType);
    let strMeasureDate = BU.convertDateToText(upsasDataGroup.measureDate);

    upsasDataGroup.storage.forEach(dataObj => {
      const contollerInfo = this.findUpsasController(dataObj.id, deviceType);
      const deviceSavedInfo = contollerInfo.controller.getDeviceInfo();
      // BU.CLI(deviceSavedInfo);
      // dataObj.
      let resultProcessError;
      let hasSystemError = false;
      // 시스템 에러가 있다면 
      if (dataObj.systemErrorList.length) {
        hasSystemError = true;
        resultProcessError = this.processDeviceErrorList(dataObj.systemErrorList, dbTroubleList, dataObj, 1, deviceType);
      } else { // 장치 에러 처리
        resultProcessError = this.processDeviceErrorList(dataObj.troubleList, dbTroubleList, dataObj, 0, deviceType);
      }

      // BU.CLI(resultProcessError);
      upsasDataGroup.insertTroubleList = upsasDataGroup.insertTroubleList.concat(resultProcessError.insertTroubleList);
      upsasDataGroup.updateTroubleList = upsasDataGroup.updateTroubleList.concat(resultProcessError.updateTroubleList);
      dbTroubleList = resultProcessError.dbTroubleList;

      // 시스템 에러가 없을 경우에 insert 구문 입력
      if (!hasSystemError) {
        const convertDataList = this.processDeviceDataList(dataObj.data, deviceSavedInfo, deviceType);
        dataObj.convertData = convertDataList;
        upsasDataGroup.insertDataList = upsasDataGroup.insertDataList.concat(convertDataList);
      }
    });

    // 남아있는 dbTroubleList는 Clear 처리
    dbTroubleList.forEach(dbTrouble => {
      BU.CLIS(dbTrouble, BU.convertDateToText(dbTrouble.occur_date), upsasDataGroup.measureDate);
      dbTrouble.occur_date = dbTrouble.occur_date instanceof Date ? BU.convertDateToText(dbTrouble.occur_date) : BU.convertDateToText(upsasDataGroup.measureDate);
      dbTrouble.fix_date = BU.convertDateToText(upsasDataGroup.measureDate);
      upsasDataGroup.updateTroubleList.push(dbTrouble);
    });

    // insertDataList에 날짜 추가
    upsasDataGroup.insertDataList = _.map(upsasDataGroup.insertDataList, insertData => {
      return Object.assign({ [bindingObj.dateParam]: strMeasureDate }, insertData);
    });

    // BU.CLI(upsasDataGroup);

    return upsasDataGroup;
  }

  /**
   * 
   * @param {{key: string, measureDate: Date, insertTroubleList: Array, updateTroubleList: Array, insertDataList: Array, storage: Array.<{ id: string, seq: string, measureDate: Date, systemErrorList: Array.<{code: string, msg: string, occur_date: Date}>, data: Array | Object, convertData: Array, troubleList: Array.<{code: string, msg: string}>}}} upmsDeviceData 입력할 테이블 명
   * @param {Array} setList 입력할 데이터 리스트
   * @return {Promise} 정상적으로 성공할경우 upmsDeviceData sql 구문은 초기화 처리
   */
  async applyingMeasureDataToDb(upmsDeviceData) {
    if (this.hasInsertQuery) {
      let bindingObj = _.findWhere(keybinding.binding, {
        deviceType: upmsDeviceData.key
      });

      let dataTableName = bindingObj.dataTableName;
      let troubleTableName = bindingObj.troubleTableName;
      // 입력할 데이터가 있는 경우
      if (upmsDeviceData.insertDataList.length) {
        await this.BM.setTables(dataTableName, upmsDeviceData.insertDataList, false);
      }

      // 입력할 Trouble이 있을 경우
      if (upmsDeviceData.insertTroubleList.length) {
        await this.BM.setTables(troubleTableName, upmsDeviceData.insertTroubleList, false);
      }

      // 수정할 Trouble이 있을 경우
      if (upmsDeviceData.updateTroubleList.length) {
        await this.BM.updateTablesByConnection(troubleTableName, `${troubleTableName}_seq`, upmsDeviceData.updateTroubleList);
      }
    }

    // 초기화
    upmsDeviceData.insertDataList = [];
    upmsDeviceData.insertTroubleList = [];
    upmsDeviceData.updateTroubleList = [];

    return upmsDeviceData;
  }




  /**
   * Device Error 처리. 신규 에러라면 insert, 기존 에러라면 dbTroubleList에서 해당 에러 삭제, 최종으로 남아있는 에러는 update
   * @param {Array.<{code: string, msg: string, occur_date: Date}>} deviceErrorList 장치에서 발생된 시스템 에러 목록
   * @param {Array} dbTroubleList DB에서 가져온 trouble list.
   * @param {{seq: number, measureDate: Date}} categoryInfo deviceDataList 요소. 시퀀스 와 측정 날짜
   * @param {boolean} isSystemError System Error 인지 여부
   * @param {string} deviceType 장치 타입 
   * @return {{insertTroubleList: Array.<{code: string, msg: string, occur_date: Date}>, updateTroubleList: Array.<{tbName: string, whereObj: {key: string, value: number}, updateObj: {fix_date: Date}}>, dbTroubleList: Array}} 삽입 목록과 수정 목록, 수정한 dbTroubleList 
   */
  processDeviceErrorList(deviceErrorList, dbTroubleList, categoryInfo, isSystemError, deviceType) {
    // BU.CLI('processSystemErrorList', deviceErrorList, categoryInfo.seq, deviceType);
    const seq = categoryInfo.seq;
    const measureDate = categoryInfo.measureDate;
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
          occur_date: errorObj.occur_date instanceof Date ? BU.convertDateToText(errorObj.occur_date) : BU.convertDateToText(measureDate),
          fix_date: null
        };

        insertTroubleList.push(addErrorObj);
      }
    });
    // 시스템 에러가 발생할 경우 trouble, data check는 하지 않으므로 남아있는 시스템 에러를 dbTrouble에서 제거함
    dbTroubleList = _.reject(dbTroubleList, dbTrouble => {
      let hasResultOption = isSystemError ? dbTrouble.is_error === 1 : true;
      if (dbTrouble[keyName] === seq && hasResultOption) {
        dbTrouble.occur_date = dbTrouble.occur_date instanceof Date ? BU.convertDateToText(dbTrouble.occur_date) : BU.convertDateToText(measureDate);
        dbTrouble.fix_date = BU.convertDateToText(measureDate);
        updateTroubleList.push(dbTrouble);
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
    // BU.CLI('processDeviceDataList', deviceData);
    // 배열 일 경우에는 재귀
    if (_.isArray(deviceData)) {
      let convertDataList = [];

      deviceData.forEach(data => {
        let result = this.processDeviceDataList(data, deviceSavedInfo, deviceType);
        convertDataList = convertDataList.concat(result);
      });
      return convertDataList;
    } else if (_.isObject(deviceData)) {
      let bindingObj = _.findWhere(keybinding.binding, {
        deviceType
      });

      let convertData = {};
      const addParamList = bindingObj.addParamList;
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
    // BU.CLI('calculateMatchingData', matchingBindingObj, deviceData);
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
          // BU.CLI('resultCalculate', resultCalculate);
        } else {
          throw Error(`해당 데이터는 숫자가 아님: ${deviceData[baseKey]}`);
        }
      } else if(typeof calculate === 'string') { // 계산식이 문자일 경우 eval 계산식 생성
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
      } else {
        // BU.CLI('deviceData[baseKey]', deviceData[baseKey]);
        resultCalculate = deviceData[baseKey];
      }
    } catch (error) {
      throw error;
    }

    return resultCalculate;
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
        WHERE b.${deviceType}_trouble_data_seq is NULL AND o.fix_date is NULL
        ORDER BY o.${deviceType}_trouble_data_seq ASC
    `;

    let returnValue = await this.BM.db.single(sql);

    return returnValue;
  }
}

module.exports = Model;