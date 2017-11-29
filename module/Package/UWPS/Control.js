const EventEmitter = require('events');
const Promise = require('bluebird');

const BU = require('base-util-jh').baseUtil;

const Model = require('./Model.js');
const P_Scheduler = require('./P_Scheduler');

const InverterController = require('./InverterController/Control.js');
const ConectorController = require('./ConnectorController/Control');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      devOption: {
        hasCopyInverterData: false,
        hasInsertQuery: false,
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
   * @return {Promise} true or exceptino
   */
  async init() {
    console.time('init')
    
    this.eventHandler();
    
    await Promise.all([
      this.createInverterController(this.config.inverterList),
      this.createConnectorController(this.config.connectorList)
    ])
    console.timeEnd('init')
    // BU.CLI('??????????')
    return true;
  }

  /**
   * 인버터 설정 값에 따라 인버터 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @param {Object} inverterConfigList 인버터 설정 값
   * @returns {Promise} 인버터 계측 컨트롤러 생성 결과 Promise
   */
  async createInverterController(inverterConfigList) {
    // BU.CLI('createInverterController, configList)

    console.time('createInverterController')
    let inverterControllerList = await Promise.map(inverterConfigList, ivtConfig => {
      const inverterObj = new InverterController(ivtConfig);
      return inverterObj.init()
    })
    
    this.model.inverterControllerList = inverterControllerList;
    this.p_Scheduler.runCronForMeasureInverter(inverterControllerList);
    
    console.timeEnd('createInverterController')
    return true;
  }

  /**
   * 접속반 설정 값에 따라 접속반 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @param {Object} connectorConfigList 인버터 설정 값
   * @returns {Promise} 접속반 계측 컨트롤러 생성 결과 Promise
   */
  async createConnectorController(connectorConfigList) {
    // BU.CLI('createConnectorController', connectorConfigList.length)
    console.time('createConnectorController')
    let connectorControllerList = await Promise.map(connectorConfigList, cntConfig => {
      const connectorObj = new ConectorController(cntConfig);
      return connectorObj.init();
    })
    
    this.model.connectorControllerList = connectorControllerList;
    this.p_Scheduler.runCronForMeasureConnector(connectorControllerList);
    
    console.timeEnd('createConnectorController')
    return true;
  }


  // 이벤트 핸들러
  eventHandler() {
    // BU.CLI('eventHandler')
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureInverter', (measureTime, inverterListData) => {
      // BU.CLI(measureTime, inverterListData)
      this.model.completeMeasureInverter(measureTime, inverterListData)
    });
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureConnector', (measureTime, connectorListData) => {
      // BU.CLI(measureTime, connectorListData)
      // TEST 접속반 더미 프로그램이 없는 관계로 
      if (this.config.devOption.hasCopyInverterData) {
        return false;
      }
      this.model.completeMeasureConnector(measureTime, connectorListData)
    });

  }

}
module.exports = Control;