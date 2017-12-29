'use strict';
const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const {Converter} = require('base-class-jh');

const P_Setter = require('./P_Setter.js');
const Model = require('./Model.js');


const P_ModbusClient = require('./P_ModbusClient');

const DummyConnector = require('../DummyConnector');

const P_SocketClient = require('./P_SocketClient');
const P_SerialClient = require('./P_SerialClient');

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

    // 추상 클래스 정의 --> Intellicense Support
    this.encoder = new Converter();
    this.decoder = new Converter();
    // this.testStubData = [];
    this.connectedDevice = null;

    // Model
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);
    this.p_SocketClient = new P_SocketClient(this);
    this.p_SerialClient = new P_SerialClient(this);
    // this.p_ModbusClient = new P_ModbusClient(this);

    // Child
    this.dummyConnector = new DummyConnector();
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
    return this.model.hasConnectedDevice;
  }

  /**
   * 접속반 계측 컨트롤러 초기화.
   * 개발 모드일 경우 modbus tcp server 구동
   * @return {Promise} true, exception
   */
  async init() {
    // BU.CLI('init ConnectorController', this.config.devPort)

    // this에 Event Emitter Binding
    this.eventHandler();
    // 국번 정의
    let dialing = this.config.cntSavedInfo.dialing;
    dialing = dialing.type === 'Buffer' ? Buffer.from(dialing) : dialing;
    // 접속반 종류별 프로토콜 장착
    // NOTE 인텔리전스를 위해 P_Setter에서 재정의함
    await this.p_Setter.settingConverter(dialing);

    await this.connectDevice();

    return this;
  }

  /**
   * 접속반 장치 접속
   * @return {Object} Socket or Serial Object Client
   */
  async connectDevice() {
    try {
      // 개발 버전일경우 자체 더미 인버터 소켓에 접속
      let cntSavedInfo = this.model.cntSavedInfo;
      // BU.CLI(cntSavedInfo)
      if (cntSavedInfo.connect_type === 'socket') { // TODO Serial Port에 접속하는 기능
        // NOTE Dev모드에서는 Socket Port를 재설정하므로 지정 경로로 접속기능 필요
        this.connectedDevice = await this.p_SocketClient.connect(cntSavedInfo.port, cntSavedInfo.ip);
        // BU.CLI('Socket에 접속하였습니다.  ' + cntSavedInfo.port)
      } else {
        this.connectedDevice = await this.p_SerialClient.connect();
      }
      BU.log('Sucess Connected to Connector ', cntSavedInfo.target_id);

      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.model.hasConnectedDevice = true;
      this.retryConnectDeviceCount = 0;

      return this.connectedDevice;
    } catch (error) {
      BU.CLI(error)
      this.emit('disconnectedDevice', error);
    }
  }

  /**
   * 접속반 계측 데이터 요청 리스트 전송 및 응답 시 결과 데이터 반환
   * @returns {Promise} 정제된 Connector 계측 데이터 전송(DB 입력 용)
   */
  async measureDevice() {
    return new Promise((resolve, reject) => {
      if (!BU.isEmpty(this.model.processCmd)) {
        reject('현재 진행중인 명령이 존재합니다.\n' + this.model.processCmd)
        // return new Error('현재 진행중인 명령이 존재합니다.\n' + this.model.processCmd);
      }

      this.model.initControlStatus();
      // BU.CLI(this.encoder)
      this.model.controlStatus.reserveCmdList = this.encoder.makeMsg();

      // BU.CLI(this.model.controlStatus.reserveCmdList)
      Promise.each(this.model.controlStatus.reserveCmdList, cmd => {
          this.model.controlStatus.reserveCmdList.shift();
          this.model.controlStatus.processCmd = cmd;
          this.model.controlStatus.sendIndex++;
          return this.send2Cmd(cmd);
        })
        // .bind({})
        .then((result) => {
          // BU.CLI(`${this.connectorId}의 명령 수행이 모두 완료되었습니다.`);
          resolve(this.model.refineConnectorData)
        })
        .catch(err => {
          let msg = `${this.connectorId}의 ${this.model.processCmd}명령 수행 도중 ${err.message}오류가 발생하였습니다.`;
          BU.errorLog('measureInverter', msg);

          // 컨트롤 상태 초기화
          this.model.initControlStatus();

          reject(err)

          // TODO 에러시 어떻게 처리할 지 고민 필요
          //에러가 발생할 경우 빈 객체 반환
          // resolve({})
        })
    })
  }

  /**
   * 접속반에 데이터 요청명령 발송. 주어진 시간안에 명령에 대한 응답을 못 받을 경우 에러 처리
   * @param  cmd 요청할 명령
   */
  async send2Cmd(cmd) {
    // BU.CLI('send2Cmd', cmd)
    let timeout = {};
    let resRace = await Promise.race(
      [
        this.msgSendController(cmd),
        new Promise((_, reject) => {
          timeout = setTimeout(() => {
            // BU.CLI(this.model.controlStatus.sendMsgTimeOutSec)
            reject(new Error('timeout'))
          }, this.model.controlStatus.sendMsgTimeOutSec)
        })
      ]
    )
    clearTimeout(timeout);
    return this.model.refineConnectorData;

  }

  async msgSendController(cmd) {
    // BU.CLI('msgSendController', this.model.controlStatus)
    if (BU.isEmpty(cmd)) {
      return new Error('수행할 명령이 없습니다.');
    }

    await this.p_Setter.writeMsg(cmd);
    await this._receiveMsgHandler();

    return true;
  }

  /**
   * 메시지 이벤트 종료 이벤트 핸들러
   */
  async _receiveMsgHandler() {
    // BU.CLI('_receiveMsgHandler')
    let result = await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    this.model.controlStatus.processCmd = {};
    return result;
  }

  /**
   * 
   * @param {Object} msg 접속반 객체(Serial or Socket)에서 수신받은 데이터
   */
  _onReceiveMsg(msg) {
    // BU.CLI('_onReceiveMsg', msg)
    // 명령 내리고 있는 경우에만 수신 메시지 유효
    if (!BU.isEmpty(this.model.processCmd)) {
      try {
        let result = this.decoder._receiveData(msg);
        // BU.CLI('_onReceiveInverterMsg result', result);
        this.model.onData(result);
        // 인버터 데이터 송수신 종료 이벤트 발생
        return this.emit('completeSend2Msg', result);
      } catch (error) {
        // BU.CLI(error)
        // 개발 버전이고, 일반 인버터 프로토콜을 사용, 테스트용 데이터가 있다면 
        if (this.config.hasDev && this.config.cntSavedInfo.target_category !== 'dev') {
          this.model.onData(this.model.testData);
          return this.emit('completeSend2Msg', this.model.testData);
        }
        // 데이터가 깨질 경우를 대비해 기회를 더 줌
        if (this.model.controlStatus.retryChance--) {
          //  BU.CLI('기회 줌', this.model.controlStatus.retryChance)
          return Promise.delay(30).then(() => {
            return this.p_Setter.writeMsg(this.model.processCmd).catch(err => {
              BU.CLI(err)
            });
          });
        } else {
          // BU.CLI(error)
          return this.emit('errorSend2Msg', error);
        }
      }
    }
  }

  eventHandler() {
    this.on('disconnected', error => {
      // BU.CLI('disconnectedInverter', error)
      this.connectedDevice = {};
      this.model.hasConnectedDevice = false;
    })

    this.on('connected', () => {
      this.model.hasConnectedDevice = true;
    })

    // 데이터 수신 핸들러
    this.on('data', (err, result) => {
      // BU.CLI(err, result)
      if (err) {
        return BU.errorLog('receiveDataError', err)
      }
      return this._onReceiveMsg(result);
    })

  }

}
module.exports = Control;