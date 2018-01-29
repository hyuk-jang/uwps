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
      this.createConnectorController(this.config.connectorList)
    ]);

    return result;
  }

  /**
   * 접속반, 인버터 데이터 계측 스케줄러 시작
   */
  operationScheduler() {
    // let a = this.model.getControllerGroup('inverter');
    this.p_Scheduler.runCronForMeasureInverter(this.model.getControllerGroup('inverter'));
    this.p_Scheduler.runCronForMeasureConnector(this.model.getControllerGroup('connector'));
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
   * @param {Object} connectorConfigList 접속반 설정 값
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
    this.p_Scheduler.on('completeMeasureInverter', async (measureTime, measureDataList) => {
      try {
        let upsasDataGroup = this.model.onMeasureDeviceList(new Date(), measureDataList, 'inverter');
        // BU.CLI(upsasDataGroup);
        upsasDataGroup = await this.model.processMeasureData('inverter');
        // BU.CLI(upsasDataGroup);
        upsasDataGroup = await this.model.applyingMeasureDataToDb(upsasDataGroup);
        // BU.CLI(upsasDataGroup);

        // Measure Inverter 종료 이벤트 발생
        this.emit('completeProcessInverterData', upsasDataGroup);
      } catch (error) {
        BU.errorLog('measureDevice', error);
      }
    });
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureConnector', async (measureTime, measureDataList) => {
      try {
        // BU.CLIS(measureTime, measureDataList);
        let upsasDataGroup = this.model.onMeasureDeviceList(new Date(), measureDataList, 'connector');
        // BU.CLI(upsasDataGroup);
        upsasDataGroup = await this.model.processMeasureData('connector');
        // BU.CLI(upsasDataGroup);
        upsasDataGroup = await this.model.applyingMeasureDataToDb(upsasDataGroup);
        // BU.CLI(upsasDataGroup);

        // Measure Connector 종료 이벤트 발생
        this.emit('completeProcessConnectorData', upsasDataGroup);
      } catch (error) {
        BU.errorLog('measureDevice', error);
      }
    });
  }

}
module.exports = Control;