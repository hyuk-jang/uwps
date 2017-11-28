const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');

const Model = require('./Model.js');
const P_ModbusClient = require('./P_ModbusClient');

// const t_Server = require('./t_server')
const modbusTcpServer = require('./modbusTcpServer')

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: false,
      devPort: 0,
      cntSavedInfo: {},
      moduleList: []
    };
    Object.assign(this.config, config.current);
    
    // Model
    this.model = new Model(this);

    // Process
    this.p_ModbusClient = new P_ModbusClient(this);
  }

  get connectorId() {
    return this.model.cntSavedInfo.target_id;
  }

  get refineConnectorData() {
    return this.model.refineConnectorData;
  }

  get connectorData() {
    return this.model.connectorData;
  }

  // DB 정보를 넣어둔 데이터 호출
  getConnectorInfo() {
    // BU.CLI(this.model.cntSavedInfo)
    return this.model.cntSavedInfo;
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   * FIXME 접속반의 이상유무를 어떻게 체크해야할지 논의 필요(모듈 이상 검출 장치?)
   */
  getHasOperation() {
    return this.model.hasConnectedConnector;
  }

  /**
   * 접속반 계측 컨트롤러 초기화.
   * 개발 모드일 경우 modbus tcp server 구동
   * @return {Promise} true, exception
   */
  async init() {
    // BU.CLI('init ConnectorController', this.config.devPort)
    
    try {
      if (this.config.hasDev) {
        // BU.CLI(server)
        modbusTcpServer.startServer(this.config.devPort)
        this.config.cntSavedInfo.port = this.config.devPort;
      }
      this.eventHandler();
      // Module List에 맞는 데이터 저장소 정의
      this.model.initModule();
      await this.p_ModbusClient.init(this.config.cntSavedInfo);
      return this;
    } catch (err) {
      BU.CLI(err)
      return err;

    }
  }

  // 접속반 modbus 프로토콜로 접속하여 데이터 추출
  async measureConnector() {
    try {
      let moduleDat = await this.p_ModbusClient.measure();
      // BU.CLI('res', moduleDat)
      this.model.onData(moduleDat);
      return this.model.refineConnectorData;
    } catch (error) {
      console.error(error)
      return {};
    }
  }

  eventHandler() {
    this.on('disconnected', error => {
      // BU.CLI('disconnectedInverter', error)
      this.connectedInverter = {};
      this.model.hasConnectedConnector = false;
    })

    this.on('connected', () => {
      this.model.hasConnectedConnector = true;
    })

  }

}
module.exports = Control;