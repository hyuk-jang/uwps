'use strict';
const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');

const {Converter} = require('base-class-jh');

const P_Setter = require('./P_Setter.js');

const Model = require('./Model.js');


const P_ModbusClient = require('./P_ModbusClient');

// const t_Server = require('./t_server')
// const modbusTcpServer = require('./modbusTcpServer')

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
    this.p_Setter = new P_Setter(this);
    this.p_ModbusClient = new P_ModbusClient(this);
  }

  get connectorId() {
    return this.model.cntSavedInfo.target_id;
  }

  /**
   * DB 에 입력할 데이터 형태 반환
   */
  get refineConnectorData() {
    return this.model.refineConnectorData;
  }

  /**
   * Connector 원본 데이터
   * @return {Object} Connector Data Object
   */
  get connectorData() {
    return this.model.connectorData;
  }

  /**
   * DB 데이터 정제 결과물
   * @return {Object} config info
   */
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

    this.eventHandler();

    let dialing = this.config.cntSavedInfo.dialing;
    dialing = dialing.type === 'Buffer' ? Buffer.from(dialing) : dialing;
    let socketPort = await this.p_Setter.settingConverter(dialing);
    


    
    return true;

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

  /**
   * 접속반 장치 접속
   * @return {Object} Socket or Serial Object Client
   */
  async connectDevice(){

  }

  /**
   * 접속반 계측 데이터 요청 리스트 전송 및 응답 시 결과 데이터 반환
   * @returns {Promise} 정제된 Connector 계측 데이터 전송(DB 입력 용)
   */
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

  /**
   * 접속반에 데이터 요청명령 발송. 주어진 시간안에 명령에 대한 응답을 못 받을 경우 에러 처리
   * @param  cmd 요청할 명령
   */
  async send2Cmd(cmd) {

  }

  async msgSendController(cmd) {

  }

  /**
   * 메시지 이벤트 종료 이벤트 핸들러
   */
  async _receiveMsgHandler() {

  }

  /**
   * 
   * @param {Object} msg 접속반 객체(Serial or Socket)에서 수신받은 데이터
   */
  _onReceiveInverterMsg(msg) {

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