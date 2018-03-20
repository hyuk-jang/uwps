'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} dataStorage Device Controller 현재 장치의 계측 및 오류 데이터를 관리하는 상위 주체
 * @property {string} id Device Controller ID
 * @property {Object} config Device Controller를 구동하기 위한 설정
 * @property {Object|Array} data Controller에서 측정한 데이터
 * @property {Array} troubleList 장치와 약속한 프로토콜 상에서 발생한 에러
 * @property {Array} systemErrorList Controller를 구동하고 장치와 연결을 수립하고 통신하는 중간에 생기는 에러
 * @property {Date} measureDate 현재 데이터들의 측정 시간 (DeviceContainer에서 처리)
 * @property {Object|Array} convertedData data를 {keyChangeConfig}를 통해서 변경한 데이터 (DeviceContainer에서 처리)
 */

/**
 * @typedef {Object} dataStorageContainer Device Category별로 dataStorage를 관리하는 주체
 * @property {string} deviceCategory 장치 카테고리 (inverter, connector, weatherDevice, ...etc)
 * @property {string=} dbDataTableName 계측 data를 반영할 DB Table Name. dataStorage.convertedData를 저장할 DB Table. 이 값이 없을 경우 DB에 기록하지 않는다고 판단
 * @property {string=} dbTroubleTableName 오류 data를 반영할 DB Table Name. dataStorage.troubleList, dataStorage.systemErrorList 를 저장할 DB Table. 이 값이 없을 경우 DB에 기록하지 않는다고 판단
 * @property {Array} insertTroubleList 신규 오류 리스트
 * @property {Array} updateTroubleList 기존 DB의 오류 내역을 수정할 리스트
 * @property {Array} insertDataList 저장할 계측 데이터 리스트
 * @property {Array.<dataStorage>} storage 관리하고 있는 Device Controller 계측 데이터 객체 리스트
 */

/**
 * @typedef {Object} controllerStorageContainer
 * @property {string} deviceCategory
 * @property {Array} storage
 */

/**
 * @typedef {Object} keyChangeConfig
 * @property {string} deviceCategory
 * @property {string} dataTableName
 * @property {string} troubleTableName
 * @property {string} dateParam
 * @property {Array} addParamList
 * @property {Array.<{baseKey: string, updateKey: string, calculate: number, toFixed: number}>} matchingList
 */

/**
 * @typedef {Object} measureData Device Controller 현재 장치의 계측 및 오류 데이터
 * @property {string} id Device Controller ID
 * @property {Object} config Device Controller를 구동하기 위한 설정
 * @property {Array|Object} data Controller에서 측정한 데이터
 * @property {Array} systemErrorList 장치와 약속한 프로토콜 상에서 발생한 에러
 * @property {Array} troubleList Controller를 구동하고 장치와 연결을 수립하고 통신하는 중간에 생기는 에러
 */


let instance;
class DeviceDataStorage {
  /**
   * @param {Array.<keyChangeConfig>} keyChangeConfigList 
   */
  constructor(keyChangeConfigList) {
    if(instance){
      return instance;
    } else {
      instance = this;
    }


    this.keyChangeConfigList = keyChangeConfigList; 

    /** @type {Array.<dataStorageContainer>} */
    this.deviceDataStorageList = [];
    // /** @type {Array.<controllerStorageContainer>} */
    // this.deviceControllerStorageList = [];
  }

  /**
   * 
   * @param {Object|Object[]} deviceConfigInfo 
   * @param {{id: string, deviceCategory: string, dbDataTableName: string, dbTroubleTableName: string}} keySetInfo 
   */
  setDevice(deviceConfigInfo, keySetInfo){
    if(Array.isArray(deviceConfigInfo)){
      deviceConfigInfo.forEach(currentItem => {
        return this.setDevice(currentItem, keySetInfo);
      });
    }

    // Category에 맞는 StorageData를 가져옴
    let foundStorageData = this.getMatchingCategoryFromDataList(deviceConfigInfo[keySetInfo.deviceCategory]);
    // 없다면 새로 생성
    if(foundStorageData === undefined){
      foundStorageData = {
        deviceCategory: deviceConfigInfo[keySetInfo.deviceCategory],
        dbDataTableName: deviceConfigInfo[keySetInfo.dbDataTableName] ? deviceConfigInfo[keySetInfo.dbDataTableName] : null,
        dbTroubleTableName: deviceConfigInfo[keySetInfo.dbTroubleTableName] ? deviceConfigInfo[keySetInfo.dbTroubleTableName] : null,
        measureDate: null,
        insertTroubleList: [],
        updateTroubleList: [],
        insertDataList: [],
        storage: []
      };

      this.deviceDataStorageList.push(foundStorageData);
    }
    
    let foundIt = this.getMatchingIdFromDataList(deviceConfigInfo[keySetInfo.id], deviceConfigInfo[keySetInfo.deviceCategory]);
    if(_.isEmpty(foundIt)){
      /** @type {dataStorage} */
      const addDataStorageObj = {
        id: deviceConfigInfo[keySetInfo.id],
        config: deviceConfigInfo,
        data: null,
        systemErrorList: [],
        troubleList: [],
        convertedData: null,
        measureDate: null
      };
      foundStorageData.storage.push(addDataStorageObj);
      // BU.CLI(this.deviceDataStorageList);
    } else {
      throw new Error('해당 장치는 이미 등록되어 있습니다.');
    }
  }

  /**
   * 장치 카테고리에 맞는 타입을 가져옴
   * @param {string} deviceCategory 장치 카테고리 'inverter', 'connector' ... etc
   * @return {dataStorageContainer}
   */
  getMatchingCategoryFromDataList(deviceCategory) {
    // BU.CLI(this.deviceDataStorageList);
    return _.findWhere(this.deviceDataStorageList, {
      deviceCategory
    });
  }

  /**
   * 장치 ID를 가진 Data Model 객체 반환
   * @param {string} deviceId 장치 ID
   * @param {string=} deviceCategory 장치 ID
   */
  getMatchingIdFromDataList(deviceId, deviceCategory) {
    // BU.CLI(deviceId, deviceCategory);
    try {
      if(deviceCategory.length){
        let storageData = this.getMatchingCategoryFromDataList(deviceCategory);
        if(storageData){
          return _.findWhere(storageData.storage, { id: deviceId });
        } else {
          return {};
        }

      } else {
        let foundIt = {};
        _.find(this.deviceDataStorageList, deviceDataStorage => {
          let foundStorage = _.findWhere(deviceDataStorage.storage, {id: deviceId});
          if(_.isEmpty(foundStorage)){
            return false;
          } else {
            foundIt = foundStorage;
            return true;
          }
        });
        return foundIt;
      }

    } catch (error) {
      throw error;
    }
  }

  



  /**
   * Device Controller 부터 받은 데이터
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {measureData} measureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceCategory 장치 Type 'inverter', 'connector'
   */
  onDeviceData(measureTime, measureData, deviceCategory) {
    try {
      let id = measureData.id;
      let dataStorage = this.getMatchingIdFromDataList(id, deviceCategory);
      if (_.isEmpty(dataStorage)) {
        throw Error(`fn(onDeviceData) device ID: ${id}가 이상합니다.`);
      }
      
      dataStorage.measureDate = measureTime;
      dataStorage.data = measureData.data;
      dataStorage.systemErrorList = measureData.systemErrorList;
      dataStorage.troubleList = measureData.troubleList;
      dataStorage.config = measureData.config;

      return dataStorage;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장치 그룹을 DB에 입력
   * @param {Date} measureTime DB에 입력할 계측 날짜
   * @param {measureData} measureData Device Controller getDeviceStatus() 결과
   * @param {string} deviceCategory 장치 Type 'inverter', 'connector'
   */
  onMeasureDeviceList(measureTime, measureData, deviceCategory) {
    // BU.CLI('onMeasureDeviceList', deviceControllerMeasureData);
    let dataStorage = this.getMatchingCategoryFromDataList(deviceCategory);
    
    if (_.isEmpty(dataStorage)) {
      throw Error(`deviceType [${deviceCategory}]은 없습니다.`);
    }
    dataStorage.measureDate = measureTime;
    if (typeof measureData === 'object' && Array.isArray(measureData)) {
      measureData.forEach(deviceMeasureData => {
        this.onDeviceData(measureTime, deviceMeasureData, deviceCategory);
      });
    } else {
      this.onDeviceData(measureTime, measureData, deviceCategory);
    }

    return dataStorage;
  }


  /**
   * 지정한 카테고리의 모든 데이터를 순회하면서 db에 적용할 데이터를 정제함.
   * @param {string} deviceCategory  장치 Type 'inverter', 'connector'
   * @return {Promise} upsasDataGroup
   */
  async processMeasureData(deviceCategory) {
    // BU.CLI('processMeasureData', deviceType);
    let dataStorageContainer = this.getMatchingCategoryFromDataList(deviceCategory);
    BU.CLI(dataStorageContainer);
    let foundKeyChangeConfig = _.findWhere(this.keyChangeConfigList, {
      deviceCategory
    });
    BU.CLI(foundKeyChangeConfig);


    let strMeasureDate = BU.convertDateToText(dataStorageContainer.measureDate);
    let dbTroubleList = [];

    // Trouble을 DB상에 처리할 것이라면
    if(dataStorageContainer.dbTroubleTableName){
      dbTroubleList = await this.getTroubleList(deviceCategory);
    }

    dataStorageContainer.storage.forEach(storage => {
      // const contollerInfo = this.findUpsasController(storage.id, deviceCategory);
      // 
      // BU.CLI(storage);
      const dataStorageConfig = storage.config;
      // BU.CLI(dataStorageConfig);
      
      let resultProcessError;
      
      // 시스템 오류나 장치 이상이 발견된다면 오류발생 처리
      let hasError = storage.systemErrorList.length || storage.troubleList.length ? true : false;
      // 시스템 에러가 있다면 
      if (storage.systemErrorList.length) {
        resultProcessError = this.processDeviceErrorList(storage.systemErrorList, dbTroubleList, storage, 1, deviceCategory);
      } else { // 장치 에러 처리
        resultProcessError = this.processDeviceErrorList(storage.troubleList, dbTroubleList, storage, 0, deviceCategory);
      }

      // BU.CLI(resultProcessError);
      dataStorageContainer.insertTroubleList = dataStorageContainer.insertTroubleList.concat(resultProcessError.insertTroubleList);
      dataStorageContainer.updateTroubleList = dataStorageContainer.updateTroubleList.concat(resultProcessError.updateTroubleList);
      dbTroubleList = resultProcessError.dbTroubleList;

      // Trouble 이나 System Error가 발생한 계측 데이터는 사용하지 않음.
      if (!hasError) {
        const convertedDataList = this.processDeviceDataList(storage.data, dataStorageConfig, deviceCategory);
        storage.convertedData = convertedDataList;
        dataStorageContainer.insertDataList = dataStorageContainer.insertDataList.concat(convertedDataList);
      }
    });

    // 남아있는 dbTroubleList는 Clear 처리
    dbTroubleList.forEach(dbTrouble => {
      // BU.CLIS(dbTrouble, BU.convertDateToText(dbTrouble.occur_date), upsasDataGroup.measureDate);
      dbTrouble.occur_date = dbTrouble.occur_date instanceof Date ? BU.convertDateToText(dbTrouble.occur_date) : BU.convertDateToText(dataStorageContainer.measureDate);
      dbTrouble.fix_date = BU.convertDateToText(dataStorageContainer.measureDate);
      dataStorageContainer.updateTroubleList.push(dbTrouble);
    });

    // insertDataList에 날짜 추가
    dataStorageContainer.insertDataList = _.map(dataStorageContainer.insertDataList, insertData => {
      return Object.assign({ [foundKeyChangeConfig.dateParam]: strMeasureDate }, insertData);
    });

    BU.CLI(dataStorageContainer);

    return dataStorageContainer;
  }


  /**
   * Device Error 처리. 신규 에러라면 insert, 기존 에러라면 dbTroubleList에서 해당 에러 삭제, 최종으로 남아있는 에러는 update
   * @param {Array.<{code: string, msg: string, occur_date: Date}>} deviceErrorList 장치에서 발생된 시스템 에러 목록
   * @param {Array} dbTroubleList DB에서 가져온 trouble list.
   * @param {{seq: number, measureDate: Date}} categoryInfo deviceDataList 요소. 시퀀스 와 측정 날짜
   * @param {boolean} isSystemError System Error 인지 여부
   * @param {string} deviceCategory 장치 타입 
   * @return {{insertTroubleList: Array.<{code: string, msg: string, occur_date: Date}>, updateTroubleList: Array.<{tbName: string, whereObj: {key: string, value: number}, updateObj: {fix_date: Date}}>, dbTroubleList: Array}} 삽입 목록과 수정 목록, 수정한 dbTroubleList 
   */
  processDeviceErrorList(deviceErrorList, dbTroubleList, categoryInfo, isSystemError, deviceCategory) {
    // BU.CLI('processSystemErrorList', deviceErrorList, categoryInfo.seq, deviceType);
    const seq = categoryInfo.seq;
    const measureDate = categoryInfo.measureDate;
    const insertTroubleList = [];
    const updateTroubleList = [];
    const keyName = `${deviceCategory}_seq`;
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
   * @param {string} deviceCategory 장치 타입 (inverter, connector)
   */
  processDeviceDataList(deviceData, deviceSavedInfo, deviceCategory) {
    // BU.CLI('processDeviceDataList', deviceData);
    // 배열 일 경우에는 재귀
    if (_.isArray(deviceData)) {
      let convertDataList = [];

      deviceData.forEach(data => {
        let result = this.processDeviceDataList(data, deviceSavedInfo, deviceCategory);
        convertDataList = convertDataList.concat(result);
      });
      return convertDataList;
    } else if (_.isObject(deviceData)) {
      let keyChangeConfig = _.findWhere(this.keyChangeConfigList, {
        deviceCategory
      });

      BU.CLI(keyChangeConfig);

      let convertData = {};
      const addParamList = keyChangeConfig.addParamList;
      const matchingList = keyChangeConfig.matchingList;

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
   * 장치 에러 리스트 가져옴
   * Device Category 에 접미사 _trouble_data 를 붙이는걸 전제로 함
   * Trouble 형식 --> {${id}, ${seq}, code, msg, occur_date, fix_date}
   * @param {string} deviceCategory 'inverter' or 'connect'
   */
  async getTroubleList(deviceCategory) {
    let sql = `
      SELECT o.*
        FROM ${deviceCategory}_trouble_data o                    
          LEFT JOIN ${deviceCategory}_trouble_data b             
              ON o.${deviceCategory}_seq = b.${deviceCategory}_seq AND o.code = b.code AND o.${deviceCategory}_trouble_data_seq < b.${deviceCategory}_trouble_data_seq
        WHERE b.${deviceCategory}_trouble_data_seq is NULL AND o.fix_date is NULL
        ORDER BY o.${deviceCategory}_trouble_data_seq ASC
    `;

    let returnValue = await this.BM.db.single(sql);

    return returnValue;
  }

  


}
module.exports = DeviceDataStorage;