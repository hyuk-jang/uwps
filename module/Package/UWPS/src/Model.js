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

    /** 하부 Controller에서 계측한 데이터 저장소 */
    this.upmsDeviceDataList = [];
    /** 하부 Controller Chainging 객체 저장소 */
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
    let returnValue;
    _.find(this.upmsDeviceDataList, data => {
      // BU.CLI(data);
      returnValue = _.findWhere(data.storage, {
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
   * 장치 ID를 가진 Controller Object 객체 반환
   * @param {string} deviceId 장치 ID
   */
  findUpsasController(deviceId) {
    let returnValue;
    _.find(this.upmsDeviceControllerList, data => {
      // BU.CLI(data);
      returnValue = _.findWhere(data.storage, {
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
   * 장치 데이터 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  findUpsasDataGroup(deviceType){
    const dataGroup = _.findWhere(this.upmsDeviceDataList, {key: deviceType});
    if(_.isEmpty(dataGroup)){
      throw Error(`${deviceType} Controller Group은 없습니다.`);
    }

    return dataGroup;
  }

  /**
   * 장치 컨트롤러 그룹을 돌려줌
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  getUpsasControllerGrouping(deviceType){
    const controllerGroup = _.findWhere(this.upmsDeviceControllerList, {key: deviceType});
    if(_.isEmpty(controllerGroup)){
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
  async onMeasureDeviceList(measureTime, deviceControllerMeasureData, deviceType) {
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

    // deviceType Trouble 조회
    let dbTroubleList = await this.getTroubleList(deviceType);
    BU.CLI(dbTroubleList);

    await this.processSystemErrorList(upsasDataGroup, dbTroubleList, deviceType);
    BU.CLI('what the', upsasDataGroup);





    return upsasDataGroup;
  }

  /**
   * 
   * @param {Object} upsasDeviceDataGroup 같은 그룹간 장치 계측한 데이터 
   * @param {Array} upsasDeviceDataGroup.insertTroubleList db에 새로 저장할 데이터를 넣을 공간
   * @param {Array.<{id: string, data: Object, systemErrorList: Array, troubleList: Array}>} upsasDeviceDataGroup.storage 실제 장치들 데이터가 존재 {id, data, systemErrorList, troubleList}
   * @param {Array} dbTroubleList 
   * @param {string} deviceType 
   */
  async processSystemErrorList(upsasDeviceDataGroup, dbTroubleList, deviceType) {
    BU.CLI('processSystemErrorList');
    let updateList = [];
    upsasDeviceDataGroup.storage.forEach(deviceDataObj => {
      // systemError가 있을 경우에만 처리
      if(!_.isEmpty(deviceDataObj.systemErrorList)){
        deviceDataObj.systemErrorList.forEach(systemErrorObj => {
          // dbTrouble에 해당 SystemError가 존재하는지 체크
          let hasNewSystemError = false;
          // 기존 시스템 에러가 존재한다면 처리할 필요가 없으므로 dbTroubleList에서 삭제
          dbTroubleList = _.reject(dbTroubleList, dbTrouble => {
            // TODO 발생한 날짜를 기입하도록 변경 필요
            if(systemErrorObj.code === systemErrorObj.code){
              hasNewSystemError = true;
              updateList.push({
                tbName:`${deviceType}_trouble_data`,
                whereObj: {
                  key: `${deviceType}_trouble_data_seq`,
                  value: dbTrouble[`${deviceType}_trouble_data_seq`]  
                },
                updateObj: {
                  fix_date: BU.convertDateToText(new Date())
                }
              });
              return true;
            } else {
              return false;
            }
          });

          // 신규 에러라면 insertList에 추가
          if(hasNewSystemError){
            upsasDeviceDataGroup.insertTroubleList.push(systemErrorObj);
          } 
        });
      }
    });
    return Promise.map(updateList, update => {
      return this.BM.updateTable(update.tbName, update.whereObj, update.updateObj);
    });
  }

  /**
   * 
   * @param {number} isSystemError 시스템 에러를 체크할지
   * @param {Object} upsasDeviceDataGroup 같은 그룹간 장치 계측한 데이터 
   * @param {Array} upsasDeviceDataGroup.insertTroubleList db에 새로 저장할 데이터를 넣을 공간
   * @param {Array.<{id: string, data: Object, systemErrorList: Array, troubleList: Array}>} upsasDeviceDataGroup.storage 실제 장치들 데이터가 존재 {id, data, systemErrorList, troubleList}
   * @param {Array} dbTroubleList 
   * @param {string} deviceType 
   */
  async processErrorList(isSystemError, upsasDeviceDataGroup, dbTroubleList, deviceType) {
    const errorType = isSystemError === 1 ? 'systemErrorList' : 'troubleList';
    BU.CLI('processTroubleList');
    let updateList = [];
    upsasDeviceDataGroup.storage.forEach(deviceDataObj => {
      // systemError가 있을 경우에만 처리
      if(!_.isEmpty(deviceDataObj[errorType])){
        deviceDataObj[errorType].forEach(errorObj => {
          // dbTrouble에 해당 SystemError가 존재하는지 체크
          let hasNewError = true;
          // 기존 시스템 에러가 존재한다면 처리할 필요가 없으므로 dbTroubleList에서 삭제
          dbTroubleList = _.reject(dbTroubleList, dbTrouble => {
            if(dbTrouble.code === errorObj.code){
              hasNewError = false;

              return true;
            } else {
              return false;
            }
          });

          // 신규 에러라면 insertList에 추가
          if(hasNewError){
            upsasDeviceDataGroup.insertTroubleList.push(errorObj);
          } 
        });
      }
    });
    return Promise.map(updateList, update => {
      return this.BM.updateTable(update.tbName, update.whereObj, update.updateObj);
    });
  }


  // updateList.push({
  //   tbName:`${deviceType}_trouble_data`,
  //   whereObj: {
  //     key: `${deviceType}_trouble_data_seq`,
  //     value: dbTrouble[`${deviceType}_trouble_data_seq`]  
  //   },
  //   updateObj: {
  //     fix_date: BU.convertDateToText(new Date())
  //   }
  // });

  /**
   * 장치 그룹에서 해당 deviceType을 돌려줌(단, controller chaning 제외)
   * @param {string} deviceType 장치 Type 'inverter', 'connector'
   */
  getOnlyDeviceGroupData(deviceType) {
    let findUpsasDataListByDeviceType = _.findWhere(this.upmsDeviceDataList, {
      key: deviceType
    });

    if (_.isEmpty(findUpsasDataListByDeviceType)) {
      throw Error(`deviceType [${deviceType}]은 없습니다.`);
    }
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