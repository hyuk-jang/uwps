'use strict';

const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} dataStorage Device Controller 현재 장치의 계측 및 오류 데이터를 관리하는 상위 주체
 * @property {string} id Device Controller ID
 * @property {Object} config Device Controller를 구동하기 위한 설정
 * @property {Object|Array} data Controller에서 측정한 데이터
 * @property {Array.<deviceErrorInfo>} troubleList 장치와 약속한 프로토콜 상에서 발생한 에러
 * @property {Array.<deviceErrorInfo>} systemErrorList Controller를 구동하고 장치와 연결을 수립하고 통신하는 중간에 생기는 에러
 * @property {Date} measureDate 현재 데이터들의 측정 시간 (DeviceContainer에서 처리)
 * @property {Object[]} convertedDataList data를 {refinedDeviceDataConfig}를 통해서 변경한 데이터 (DeviceContainer에서 처리)
 */

/**
 * @typedef {Object} deviceErrorInfo
 * @property {string} code 장치 에러 고유 id
 * @property {string} msg 세부 오류 정보
 * @property {Date} occur_date 에러 발생 일자
 * @property {Date} fix_date 에러 수정 일자
 */

/**
 * @typedef {Object} defaultDbTroubleTableScheme 필수 장치 에러 테이블 스키마
 * @property {number} is_error
 * @property {string} code
 * @property {string} msg
 * @property {Date} occur_date
 * @property {Date} fix_date
 */

/**
 * @typedef {Object} dataStorageContainer Device Category별로 dataStorage를 관리하는 주체
 * @property {string} deviceCategory 장치 카테고리 (inverter, connector, weatherDevice, ...etc)
 * @property {refinedDeviceDataConfig} refinedDeviceDataConfig 데이터를 가공하기 위한 설정 변수
 * @property {Array} insertTroubleList 신규 오류 리스트
 * @property {Array} updateTroubleList 기존 DB의 오류 내역을 수정할 리스트
 * @property {Array} insertDataList 저장할 계측 데이터 리스트
 * @property {Date} processingDate 본 DB에 컨테이너를 처리한 시각
 * @property {Array.<dataStorage>} storage 관리하고 있는 Device Controller 계측 데이터 객체 리스트
 */

// /**
//  * @typedef {Object} controllerStorageContainer
//  * @property {string} deviceCategory
//  * @property {Array} storage
//  */


/**
 * @typedef {Object} addParamKey
 * @property {string} fromKey 설정 정보에 저장된 Key
 * @property {string} toKey DB에 입력할 Key
 */

/**
 * @typedef {Object} refinedMatchingInfo
 * @property {string} fromKey Device Data Key
 * @property {string} toKey DB에 입력할 Key
 * @property {string|number} calculate 데이터 가공할 계산 식. string일 경우 eval(), number 일경우 scale
 * @property {number} toFixed 소수점 자리수
 */


/**
 * @typedef {Object} refinedDeviceDataConfig
 * @property {string} deviceCategory
 * @property {troubleTableInfo} troubleTableInfo 장치 에러에 관한 처리 설정 정보
 * @property {dataTableInfo} dataTableInfo 장치 계측 데이터에 관한 처리 설정 정보
 */

/**
 * @typedef {Object} troubleTableInfo
 * @property {string} tableName 장치 에러에 관한 처리 설정 정보
 * @property {Array.<addParamKey>} addParamList 
 * @property {{isErrorKey: string, codeKey: string, msgKey: string, occurDateKey: string, fixDateKey: string}} changeColumnKeyInfo 
 * @property {string=} insertDateKey 
 * @property {{primaryKey: string=, foreignKey: string=}} indexInfo 
 */

/**
 * @typedef {Object} dataTableInfo
 * @property {string} tableName 
 * @property {Array.<addParamKey>=} addParamList 
 * @property {string=} insertDateKey 
 * @property {Array.<refinedMatchingInfo>} matchingList 
 
 */ 


/**
 * @typedef {Object} deviceOperationInfo Device Controller 현재 장치의 계측 및 오류 데이터
 * @property {string} id Device Controller ID
 * @property {Object} config Device Controller를 구동하기 위한 설정
 * @property {Array|Object} data Controller에서 측정한 데이터
 * @property {Array.<deviceErrorInfo>} systemErrorList 장치와 약속한 프로토콜 상에서 발생한 에러
 * @property {Array.<deviceErrorInfo>} troubleList Controller를 구동하고 장치와 연결을 수립하고 통신하는 중간에 생기는 에러
 * @property {Date} measureDate 해당 Device Controller에서 데이터를 요청한 시각
 */

/**
 * @typedef {Object} setDeviceKeyInfo setDevice를 할 경우 설정 정보에 반영할 Key 
 * @property {string} idKey 장치 id로 사용할 key
 * @property {string} deviceCategoryKey dataStorageContainer 에 소속될 장치 카테고리 key
 */

let instance;
class DeviceDataStorage {
  /**
   * @param {Array.<refinedDeviceDataConfig>} refinedDeviceDataConfigList 
   */
  constructor(refinedDeviceDataConfigList) {
    if (instance) {
      return instance;
    } else {
      instance = this;
    }

    this.refinedDeviceDataConfigList = refinedDeviceDataConfigList;

    /** @type {Array.<dataStorageContainer>} */
    this.dataStorageContainerList = [];
    // /** @type {Array.<controllerStorageContainer>} */
    // this.deviceControllerStorageList = [];

    /** DB에 저장할 것인지 */
    this.hasSaveToDB = true;
  }

  /**
   * Device Client 추가
   * @param {Object} deviceConfigInfo 
   * @param {setDeviceKeyInfo} setDeviceKeyInfo 
   */
  setDevice(deviceConfigInfo, setDeviceKeyInfo) {
    if (Array.isArray(deviceConfigInfo)) {
      deviceConfigInfo.forEach(currentItem => {
        return this.setDevice(currentItem, setDeviceKeyInfo);
      });
    }
    const {
      deviceCategoryKey,
      idKey
    } = setDeviceKeyInfo;

    const deviceCategory = deviceConfigInfo[deviceCategoryKey];

    // Category에 맞는 StorageData를 가져옴
    let dataStorageContainer = this.getDataStorageContainer(deviceCategory);
    // 없다면 새로 생성
    if (dataStorageContainer === undefined) {
      /** @type {dataStorageContainer} */
      dataStorageContainer = {
        deviceCategory,
        refinedDeviceDataConfig: _.findWhere(this.refinedDeviceDataConfigList, {
          deviceCategory
        }),
        insertTroubleList: [],
        updateTroubleList: [],
        insertDataList: [],
        storage: [],
        processingDate: null
      };

      this.dataStorageContainerList.push(dataStorageContainer);
    }

    let dataStorage = this.getDataStorage(deviceConfigInfo[idKey], deviceCategory);
    if (_.isEmpty(dataStorage)) {
      /** @type {dataStorage} */
      const addDataStorageObj = {
        id: deviceConfigInfo[idKey],
        config: deviceConfigInfo,
        data: null,
        systemErrorList: [],
        troubleList: [],
        convertedDataList: null,
        measureDate: null,
      };
      dataStorageContainer.storage.push(addDataStorageObj);
      // BU.CLIN(this.deviceDataStorageList);
    } else {
      throw new Error('해당 장치는 이미 등록되어 있습니다.');
    }
  }

  /**
   * 장치에서 계측한 데이터를 갱신하고자 할 경우 호출
   * @param {deviceOperationInfo|Array.<deviceOperationInfo>} deviceOperationInfo Device Controller getDeviceOperationInfo() 결과
   * @param {string} deviceCategory 장치 Category 'inverter', 'connector'
   */
  onDeviceOperationInfo(deviceOperationInfo, deviceCategory) {
    // BU.CLI('onMeasureDeviceList', deviceControllerMeasureData);
    let dataStorageContainer = this.getDataStorageContainer(deviceCategory);

    if (_.isEmpty(dataStorageContainer)) {
      throw Error(`deviceType [${deviceCategory}]은 없습니다.`);
    }
    // 
    if (typeof deviceOperationInfo === 'object' && Array.isArray(deviceOperationInfo)) {
      deviceOperationInfo.forEach(deviceMeasureData => {
        this.updateDataStorage(deviceMeasureData, deviceCategory);
      });
    } else {
      this.updateDataStorage(deviceOperationInfo, deviceCategory);
    }

    return dataStorageContainer;
  }

  /**
   * 지정한 카테고리의 모든 데이터를 순회하면서 db에 적용할 데이터를 정제함.
   * @param {string} deviceCategory  장치 Type 'inverter', 'connector'
   * @param {Date=} processingDate 해당 카테고리를 DB에 처리한 시각. insertData에 저장이 됨
   */
  async refineTheDataToSaveDB(deviceCategory, processingDate) {
    // BU.CLI('applyToDatabase', deviceType);
    let dataStorageContainer = this.getDataStorageContainer(deviceCategory);
    // BU.CLI(dataStorageContainer);

    if (_.isEmpty(dataStorageContainer)) {
      throw new Error('해당 Device Category는 존재하지 않습니다.');
    }
    // 처리 시각 저장
    dataStorageContainer.processingDate = processingDate instanceof Date ? processingDate : new Date();

    let {
      refinedDeviceDataConfig,
      storage,
    } = dataStorageContainer;

    // Trouble을 적용할 TableName이 존재해야만 DB에 에러처리를 적용하는 것으로 판단
    const hasApplyToDatabaseForError = _.isObject(refinedDeviceDataConfig.troubleTableInfo) && refinedDeviceDataConfig.troubleTableInfo.tableName.length ? true : false;

    let strMeasureDate = BU.convertDateToText(dataStorageContainer.processingDate);
    let dbTroublePacketList = [];

    // TODO Trouble을 DB상에 처리할 것이라면
    if (hasApplyToDatabaseForError) {
      dbTroublePacketList = await this.getTroubleList(dataStorageContainer);
      // BU.CLI(dbTroublePacketList);
    }
    // BU.CLI(dbTroublePacketList);

    // 카테고리에 저장되어 있는 저장소의 모든 데이터 점검
    storage.forEach(dataStorage => {
      // 시스템 오류나 장치 이상이 발견된다면 오류발생 처리
      let hasError = dataStorage.systemErrorList.length || dataStorage.troubleList.length ? true : false;
      // 시스템 에러가 있다면 
      if (hasApplyToDatabaseForError) {
        let resultProcessError = this.processDeviceErrorList(dataStorage, dataStorageContainer, dbTroublePacketList);
        // BU.CLI(resultProcessError);
        // 에러 처리한 결과를 컨테이너에 반영
        dataStorageContainer.insertTroubleList = dataStorageContainer.insertTroubleList.concat(resultProcessError.insertTroubleList);
        dataStorageContainer.updateTroubleList = dataStorageContainer.updateTroubleList.concat(resultProcessError.updateTroubleList);
        dbTroublePacketList = resultProcessError.dbTroublePacketList;
      }

      // Trouble 이나 System Error가 발생한 계측 데이터는 사용하지 않음.
      if (!hasError) {
        dataStorage.convertedDataList = this.processDeviceDataList(dataStorage, dataStorageContainer);
        dataStorageContainer.insertDataList = dataStorageContainer.insertDataList.concat(dataStorage.convertedDataList);
      }
    });

    // 남아있는 dbTroubleList는 Clear 처리
    if (hasApplyToDatabaseForError) {
      dbTroublePacketList.forEach(dbTrouble => {
        dbTrouble.occur_date = dbTrouble.occur_date instanceof Date ? BU.convertDateToText(dbTrouble.occur_date) : strMeasureDate;
        dbTrouble.fix_date = strMeasureDate;
        dataStorageContainer.updateTroubleList.push(dbTrouble);
      });
    }

    // insertDataList에 날짜 추가
    dataStorageContainer.insertDataList = _.map(dataStorageContainer.insertDataList, insertData => {
      return Object.assign({
        [refinedDeviceDataConfig.dataTableInfo.insertDateKey]: strMeasureDate
      }, insertData);
    });
    return dataStorageContainer;
  }

  /**
   * DB에 컨테이너 단위로 저장된 insertDataList, insertTroubleList, updateTroubleList를 적용
   * @param {string} deviceCategory 카테고리 명
   */
  async saveDataToDB(deviceCategory) {
    // Category에 맞는 StorageData를 가져옴
    const dataStorageContainer = this.getDataStorageContainer(deviceCategory);
    if(_.isEmpty(dataStorageContainer)){
      throw new Error('해당 deviceCategory는 존재하지 않습니다.' + deviceCategory);
    }
    if (this.hasSaveToDB) {
      // BU.CLI(dataStorageContainer);
      const dataTableInfo = dataStorageContainer.refinedDeviceDataConfig.dataTableInfo;
      const troubleTableInfo = dataStorageContainer.refinedDeviceDataConfig.troubleTableInfo;

      // 입력할 Data와 저장할 DB Table이 있을 경우
      if (dataStorageContainer.insertDataList.length && dataTableInfo.tableName) {
        await this.BM.setTables(dataTableInfo.tableName, dataStorageContainer.insertDataList, false);
      }

      // 입력할 Trouble Data가 있을 경우
      if (dataStorageContainer.insertTroubleList.length) {
        await this.BM.setTables(troubleTableInfo.tableName, dataStorageContainer.insertTroubleList, false);
      }

      // 수정할 Trouble이 있을 경우
      if (dataStorageContainer.updateTroubleList.length) {
        await this.BM.updateTablesByPool(troubleTableInfo.tableName, troubleTableInfo.indexInfo.primaryKey, dataStorageContainer.updateTroubleList, false);
      }
    }

    // 초기화
    dataStorageContainer.insertDataList = [];
    dataStorageContainer.insertTroubleList = [];
    dataStorageContainer.updateTroubleList = [];

    return dataStorageContainer;
  }




  /**
   * 장치 카테고리에 맞는 타입을 가져옴
   * @param {string} deviceCategory 장치 카테고리 'inverter', 'connector' ... etc
   * @return {dataStorageContainer}
   */
  getDataStorageContainer(deviceCategory) {
    // BU.CLI(this.deviceDataStorageList);
    return _.findWhere(this.dataStorageContainerList, {
      deviceCategory
    });
  }

  /**
   * 장치 ID를 가진 Data Model 객체 반환
   * @param {string} deviceId 장치 ID
   * @param {string=} deviceCategory 장치 ID
   * @return {dataStorage}
   */
  getDataStorage(deviceId, deviceCategory) {
    // BU.CLI(deviceId, deviceCategory);
    try {
      if (deviceCategory.length) {
        let storageData = this.getDataStorageContainer(deviceCategory);
        return storageData ? _.findWhere(storageData.storage, {
          id: deviceId
        }) : {};
      } else {
        let foundIt = {};
        _.find(this.dataStorageContainerList, deviceDataStorage => {
          let foundStorage = _.findWhere(deviceDataStorage.storage, {
            id: deviceId
          });
          if (_.isEmpty(foundStorage)) {
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
   * @private
   * Device Controller 부터 받은 데이터
   * @param {deviceOperationInfo} deviceOperationInfo Device Controller getDeviceOperationInfo() 결과
   * @param {string} deviceCategory 장치 Type 'inverter', 'connector'
   */
  updateDataStorage(deviceOperationInfo, deviceCategory) {
    try {
      let id = deviceOperationInfo.id;
      let dataStorage = this.getDataStorage(id, deviceCategory);
      if (_.isEmpty(dataStorage)) {
        throw Error(`fn(onDeviceData) device ID: ${id}가 이상합니다.`);
      }
      // 주소 참조 데이터의 고리를 끊고 사본을 저장
      // 상수
      dataStorage.id = deviceOperationInfo.id;
      dataStorage.measureDate = deviceOperationInfo.measureDate;
      // 상수는 아니나 설정은 변하지 않음.
      dataStorage.config = deviceOperationInfo.config;

      // 데이터는 Json 형태로 저장된다고 가정하고 얕은 복사 진행 
      // 데이터가 Object[] 형태로 들어올 경우
      if(Array.isArray(deviceOperationInfo.data)){
        dataStorage.data = _.map(deviceOperationInfo.data, deviceData => {
          return Object.assign({}, deviceData);
        });
      } else {
        dataStorage.data = Object.assign({}, deviceOperationInfo.data);
      }

      dataStorage.systemErrorList = _.map(deviceOperationInfo.systemErrorList, error => {
        return Object.assign({}, error);
      });

      dataStorage.troubleList = _.map(deviceOperationInfo.troubleList, error => {
        return Object.assign({}, error);
      });

      dataStorage.convertedDataList = [];

      return dataStorage;
    } catch (error) {
      throw error;
    }
  }


  /**
   * @private
   * Device Error 처리. 신규 에러라면 insert, 기존 에러라면 dbTroubleList에서 해당 에러 삭제, 최종으로 남아있는 에러는 update
   * @param {dataStorage} dataStorage 
   * @param {dataStorageContainer} dataStorageContainer 
   * @param {deviceOperationInfo.<defaultDbTroubleTableScheme>} dbTroublePacketList DB에서 가져온 trouble list.
   */
  processDeviceErrorList(dataStorage, dataStorageContainer, dbTroublePacketList) {
    // BU.CLI('processSystemErrorList', deviceErrorList, categoryInfo.seq, deviceType);
    const insertTroubleList = [];
    const updateTroubleList = [];


    // 에러를 저장할 DB Schema 정보
    let troubleTableInfo = dataStorageContainer.refinedDeviceDataConfig.troubleTableInfo;
    let measureDeviceConfig = dataStorage.config;

    // 에러를 처리할 대상 설정
    /** @type {Array.<deviceErrorInfo>} */
    let deviceErrorList = [];
    let isSystemError = 0;

    if (dataStorage.systemErrorList.length) {
      isSystemError = 1;
      deviceErrorList = dataStorage.systemErrorList;
    } else if (dataStorage.troubleList.length) {
      deviceErrorList = dataStorage.troubleList;
    }


    // 저장할때 추가하는 키
    let addObjectParam = {};
    troubleTableInfo.addParamList.forEach(currentItem => {
      addObjectParam[currentItem.toKey] = measureDeviceConfig[currentItem.fromKey];
    });

    // 기존 DB에 저장되어 있는 에러라면 제거
    deviceErrorList.forEach(deviceError => {
      // BU.CLI(systemError);
      let hasExitError = false;
      // // 기존 시스템 에러가 존재한다면 처리할 필요가 없으므로 dbTroubleList에서 삭제
      dbTroublePacketList = _.reject(dbTroublePacketList, dbTrouble => {
        // TODO 발생한 날짜를 기입하도록 변경 필요
        // code 가 같다면 설정 변수 값이 같은지 확인하여 모두 동일하다면 해당 에러 삭제
        if (dbTrouble.code === deviceError.code) {
          // TroubleTableInfo의 AddParam에 명시된 값과 dataStorage의 config Key 값들이 전부 일치 한다면 동일 에러라고 판단
          return hasExitError = _.every(troubleTableInfo.addParamList, troubleParamInfo => {
            return dbTrouble[troubleParamInfo.toKey] === dataStorage.config[troubleParamInfo.fromKey];
          });
        } else { // new Error
          return hasExitError = false;
        }
      });

      // 신규 에러라면 insertList에 추가
      if (!hasExitError) {
        let changeColumnKeyInfo = troubleTableInfo.changeColumnKeyInfo;
        let addErrorObj = {
          [changeColumnKeyInfo.isErrorKey]: isSystemError,
          [changeColumnKeyInfo.codeKey]: deviceError.code,
          [changeColumnKeyInfo.msgKey]: deviceError.msg,
          [changeColumnKeyInfo.occurDateKey]: deviceError.occur_date instanceof Date ? BU.convertDateToText(deviceError.occur_date) : BU.convertDateToText(dataStorage.measureDate),
          [changeColumnKeyInfo.fixDateKey]: null
        };

        addErrorObj = Object.assign(addObjectParam, addErrorObj);
        insertTroubleList.push(addErrorObj);
      }
    });


    // 시스템 에러가 발생할 경우 해당 칼럼과 동일한 에러는 수정되었다고 처리
    // Trouble 처리를 하지 않으므로
    if (isSystemError) {
      // ParamList에 적시된 config 값이 동일한 Db Error는 제거
      dbTroublePacketList = _.reject(dbTroublePacketList, dbTroubleDataPacket => {
        let hasEqualDevice = _.every(troubleTableInfo.addParamList, currentItem => {
          return dbTroubleDataPacket[currentItem.toKey] === dataStorage[currentItem.fromKey];
        });

        // 모든 config 값이 동일 하다면 시스템 에러가 수정된 것으로 업데이트 처리
        if (hasEqualDevice) {
          dbTroubleDataPacket.occur_date = dbTroubleDataPacket.occur_date instanceof Date ? BU.convertDateToText(dbTroubleDataPacket.occur_date) : BU.convertDateToText(dataStorage.measureDate);
          dbTroubleDataPacket.fix_date = BU.convertDateToText(dataStorage.measureDate);
          updateTroubleList.push(dbTroubleDataPacket);
        }
      });
    }
    return {
      insertTroubleList,
      updateTroubleList,
      dbTroublePacketList
    };
  }

  /**
   * @private
   * 장치 데이터 리 처리하여 반환
   * @param {dataStorage} dataStorage deviceDataList 요소. 시퀀스 와 측정 날짜
   * @param {dataStorageContainer} dataStorageContainer deviceDataList 요소. 시퀀스 와 측정 날짜 
   */
  processDeviceDataList(dataStorage, dataStorageContainer) {
    // 장치 데이터, 장치 설정 정보
    const {
      data,
      config
    } = dataStorage;

    const refinedDeviceDataConfig = dataStorageContainer.refinedDeviceDataConfig;
    const matchingList = refinedDeviceDataConfig.dataTableInfo.matchingList;
    const addParamList = refinedDeviceDataConfig.dataTableInfo.addParamList;

    // 데이터가 Array.<Object> 형태일 경우
    if (_.isArray(data)) {
      let convertDataList = [];
      data.forEach(deviceData => {
        let convertData = {};
        // 계산식 반영
        matchingList.forEach(matchingObj => {
          convertData[matchingObj.toKey] = this.calculateMatchingData(deviceData, matchingObj);
        });

        addParamList.forEach(addParam => {
          convertData[addParam.toKey] = config[addParam.fromKey];
        });

        convertDataList.push(convertData);
      });

      return convertDataList;
    } else if (_.isObject(data)) {
      let convertData = {};

      // 계산식 반영
      matchingList.forEach(matchingObj => {
        convertData[matchingObj.toKey] = this.calculateMatchingData(data, matchingObj);
      });

      addParamList.forEach(addParam => {
        convertData[addParam.toKey] = config[addParam.fromKey];
      });

      return [convertData];
    }
  }

  /**
   * @private
   * 설정 변환키 정보와 계산식을 토대로 반환 값을 계산
   * @param {Object} deviceData 장치 데이터
   * @param {refinedMatchingInfo} refinedMatchingInfo 
   * @return {number} 계산 결과
   */
  calculateMatchingData(deviceData, refinedMatchingInfo) {
    // BU.CLI('calculateMatchingData', matchingBindingObj, deviceData);
    let resultCalculate = 0;
    try {
      let {
        fromKey,
        toFixed,
        calculate
      } = refinedMatchingInfo;
      var reg = /[a-zA-Z]/;
      // 계산식이 숫자일 경우는 eval 하지 않음
      if (_.isNumber(calculate)) {
        let data = deviceData[fromKey];
        data = typeof data === 'string' ? Number(data) : data;
        // 숫자가 아니거나 null일 경우 throw 반환
        if (_.isNumber(data)) {
          resultCalculate = Number((deviceData[fromKey] * calculate).toFixed(toFixed));
          // BU.CLI('resultCalculate', resultCalculate);
        } else {
          resultCalculate = deviceData[fromKey];
          // throw Error(`해당 데이터는 숫자가 아님: ${deviceData[fromKey]}`);
        }
      } else if (typeof calculate === 'string') { // 계산식이 문자일 경우 eval 계산식 생성
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
        // BU.CLI('deviceData[fromKey]', deviceData[fromKey]);
        resultCalculate = deviceData[fromKey];
      }
    } catch (error) {
      throw error;
    }

    return resultCalculate;
  }



  /**
   * @protected 색다르게 필요하다면 구현
   * Device Category 에 접미사 _trouble_data 를 붙이는걸 전제로 함
   * Trouble 형식 --> {${id}, ${seq}, code, msg, occur_date, fix_date}
   * @param {dataStorageContainer} dataStorageContainer deviceDataList 요소. 시퀀스 와 측정 날짜 
   */
  getTroubleList(dataStorageContainer) {
    const troubleTableInfo = dataStorageContainer.refinedDeviceDataConfig.troubleTableInfo;
    const {tableName, changeColumnKeyInfo, indexInfo} = troubleTableInfo;
    const {foreignKey, primaryKey} = indexInfo;

    let sql = `
      SELECT o.*
        FROM ${tableName} o                    
          LEFT JOIN ${tableName} b             
              ON o.${foreignKey} = b.${foreignKey} AND o.${changeColumnKeyInfo.codeKey} = b.${changeColumnKeyInfo.codeKey} AND o.${primaryKey} < b.${primaryKey}
        WHERE b.${primaryKey} is NULL AND o.${changeColumnKeyInfo.fixDateKey} is NULL
        ORDER BY o.${primaryKey} ASC
    `;

    return this.BM.db.single(sql);
  }
}
module.exports = DeviceDataStorage;