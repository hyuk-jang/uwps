const EventEmitter = require('events');
const Promise = require('bluebird');

const BU = require('base-util-jh').baseUtil;

const Model = require('./Model.js');
const P_Scheduler = require('./P_Scheduler');

const InverterController = require('../InverterController');
const ConectorController = require('../ConnectorController');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      devOption: {
        hasCopyInverterData: false,
        hasInsertQuery: false,
      },
      deviceInfo: {
        typeList: []
      },
      inverterList: [],
      connectorList: [],
      dbInfo: {},
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
    this.p_Scheduler = new P_Scheduler(this);

    // Child
    // this.inverterController = this.createInverterController(config.InverterController);

  }

  /**
   * 인버터의 현재 동작상태를 가져옴
   * @param {String} targetId 인버터 id
   * @return {Boolean} 동작: True, 정지: False
   */
  hasOperationInverter(targetId) {
    try {
      let findTarget = this.model.findMeasureInverter(targetId);
      return findTarget.getHasOperation();
    } catch (error) {
      throw error;
    }
  }
  /**
   * 접속반의 현재 동작상태를 가져옴
   * @param {String} targetId 접속반 id
   * @return {Boolean} 동작: True, 정지: False
   */
  hasOperationConnector(targetId) {
    try {
      let findTarget = this.model.findMeasureConnector(targetId);
      return findTarget.getHasOperation();
    } catch (error) {
      throw error;
    }
  }

  /**
   * 인버터 현재 상태 데이터를 가져옴
   * @param {String} targetId 인버터 id
   * @return {Object} Converter에 정의된 getBaseInverterValue json 대입
   */
  getInverterData(targetId) {
    try {
      let findTarget = this.model.findMeasureInverter(targetId);
      return findTarget.inverterData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 인버터 현재 상태 데이터를 가져옴
   * @param {String} targetId 인버터 id
   * @return {Object} Converter에 정의된 getBaseInverterValue json 대입
   */
  getInverterTotalData() {

  }

  /**
   * 접속반 현재 상태 데이터를 가져옴
   * @param {String} targetId 접속반 id
   * @return {Object} {photovoltaic_seq, amp, vol, writedate}
   */
  getConnectorData(targetId) {
    // BU.CLI('getConnectorData', targetId)
    try {
      let findTarget = this.model.findMeasureConnector(targetId);
      return findTarget.connectorData;
    } catch (error) {
      throw error;
    }
  }

  /**
   * UnterWater Photovoltaic Controller Initialize 
   * EventHandler 등록, 인버터 컨트롤러 객체 및 접속반 컨트롤러 객체 생성
   * @return {Promise} true or exception
   */
  async init() {
    this.eventHandler();
    let result = await Promise.all([
      this.createInverterController(this.config.inverterList),
      // this.createConnectorController(this.config.connectorList)
    ]);

    return result;
  }

  /**
   * 접속반, 인버터 데이터 계측 스케줄러 시작
   */
  operationScheduler() {
    let a = this.model.getControllerGroup('inverter');
    console.log(a);
    // this.p_Scheduler.runCronForMeasureInverter(this.model.getControllerGroup('inverter'));
    // this.p_Scheduler.runCronForMeasureConnector(this.model.getControllerGroup('connector'));
  }

  /**
   * 인버터 설정 값에 따라 인버터 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @param {Object} inverterConfigList 인버터 설정 값
   * @returns {Promise} 인버터 계측 컨트롤러 생성 결과 Promise
   */
  async createInverterController(inverterConfigList) {
    let inverterControllerList = await Promise.map(inverterConfigList, ivtConfig => {
      const inverterObj = new InverterController(ivtConfig);
      return inverterObj.init();
    });

    // let troubleList = await this.model.getTroubleList('inverter');
    // BU.CLI(troubleList);

    this.model.setDeviceController('inverter', inverterControllerList);
    // this.model.inverterControllerList = inverterControllerList;

    return inverterControllerList;
  }

  /**
   * 접속반 설정 값에 따라 접속반 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @param {Object} connectorConfigList 인버터 설정 값
   * @returns {Promise} 접속반 계측 컨트롤러 생성 결과 Promise
   */
  async createConnectorController(connectorConfigList) {
    // BU.CLI('createConnectorController', connectorConfigList.length)
    // console.time('createConnectorController')
    let connectorControllerList = await Promise.map(connectorConfigList, cntConfig => {
      const connectorObj = new ConectorController(cntConfig);
      return connectorObj.init();
    });

    // let troubleList = await this.model.getTroubleList('inverter');

    this.model.setDeviceController('connector', connectorControllerList);
    // this.model.connectorControllerList = connectorControllerList;
    // console.timeEnd('createConnectorController')
    return connectorControllerList;
  }


  // 이벤트 핸들러
  eventHandler() {
    // BU.CLI('eventHandler')
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureInverter', (measureTime, inverterListData) => {
      try {
        // BU.CLI(measureTime, inverterListData);

        // 계측 데이터 대입
        // let res = this.model.onMeasureDeviceList(measureTime, inverterListData, 'inverter');

        // this.model.updateUpsas2Db('inverter');
        // BU.CLI(res);

        return;

        let dataList = this.model.onInverterDataList(measureTime, inverterListData);
        this.model.insertQuery('inverter_data', dataList)
          .then(resQuery => {})
          .catch(err => {
            BU.errorLog('insertErrorDB', err);
          });
      } catch (error) {
        BU.errorLog('completeMeasureInverter', error);
      }

    });
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureConnector', (measureTime, connectorListData) => {
      // BU.CLI(measureTime, connectorListData)
      // TEST 인버터 계측 데이터에 기반하여 수행함
      if (this.config.devOption.hasCopyInverterData) {
        return false;
      }
      let dataList = this.model.onConnectorDataList(measureTime, connectorListData);
      this.model.insertQuery('module_data', dataList)
        .then(resQuery => {})
        .catch(err => {
          BU.errorLog('insertErrorDB', err);
        });
    });
  }

}
module.exports = Control;