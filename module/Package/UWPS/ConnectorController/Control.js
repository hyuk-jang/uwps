const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const Model = require('./Model.js');
const P_ModbusClient = require('./P_ModbusClient');

const t_Server = require('./t_server')

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: false,
      devPort: 0,
      cntSavedInfo: {}
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
    this.p_ModbusClient = new P_ModbusClient(this);
  }

  get inverterId() {
    return this.model.cntSavedInfo.target_id;
  }

  get cmdList() {
    return this.model.cmdList;
  }

  get connectorTargetId() {
    return this.model.cntSavedInfo.target_id;
  }

  get refineConnectorData() {
    return this.model.refineConnectorData;
  }

  // DB 정보를 넣어둔 데이터 호출
  getConnectorInfo() {
    return this.model.cntSavedInfo;
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   */
  getHasOperation() {
    return this.model.hasConnectedConnector;
  }

  async init() {
    BU.CLI('init ConnectorController', this.config.devPort)
    try {
      if (this.config.hasDev) {
        t_Server(this.config.devPort);
        this.config.cntSavedInfo.port = this.config.devPort;
      }
      this.eventHandler();
      this.p_ModbusClient.init(this.config.cntSavedInfo);
      return this;
    } catch (err) {
      BU.CLI(err)
      return err;

    }
  }

  // 접속반 modbus 프로토콜로 접속하여 데이터 추출
  async measureConnector() {
    try {
      let res = await this.p_ModbusClient.measure();
      // BU.CLI('res', res)
      this.model.onData(res[0]);
      return this.model.refineConnectorData;
    } catch (error) {
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