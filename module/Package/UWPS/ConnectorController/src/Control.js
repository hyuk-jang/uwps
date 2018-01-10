'use strict';
const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const {Converter} = require('base-class-jh');

const P_Setter = require('./P_Setter.js');
const Model = require('./Model.js');

const DummyConnector = require('../DummyConnector');

const P_SocketClient = require('./P_SocketClient');
const P_SerialClient = require('./P_SerialClient');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // BU.CLI(config)
    // 현재 Control 설정 변수
    this.config = {
      hasDev: false,
      troubleCodeList: [],
      deviceSavedInfo: {},
      moduleList: []
    };
    Object.assign(this.config, config.current);

    // 추상 클래스 정의 --> Intellicense Support
    this.encoder = new Converter();
    this.decoder = new Converter();
    
    // NOTE 연결된 장치 객체 -> P_Setter 에서 사용됨.
    this.connectedDevice = null;

    // Model
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);
    this.p_SocketClient = new P_SocketClient(this);
    this.p_SerialClient = new P_SerialClient(this);

    // Child
    this.dummyConnector = new DummyConnector();
  }

  get connectorId() {
    return this.model.deviceSavedInfo.target_id;
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
    // BU.CLI(this.model.deviceSavedInfo)
    return this.model.deviceSavedInfo;
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   * FIXME 접속반의 이상유무를 어떻게 체크해야할지 논의 필요(모듈 이상 검출 장치?)
   */
  getHasOperation() {
  }

  /**
   * 현재 진행중인 Trouble List를 가져옴
   */
  getTroubleList() {
    return this.model.currTroubleList;
  }

  /**
   * 접속반 계측 컨트롤러 초기화.
   * 개발 모드일 경우 modbus tcp server 구동
   * @return {Promise} true, exception
   */
  async init() {
    // this에 Event Emitter Binding
    this.eventHandler();
    // 국번 정의
    let dialing = this.config.deviceSavedInfo.dialing;
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
      let deviceSavedInfo = this.model.deviceSavedInfo;
      // BU.CLI(deviceSavedInfo)
      if (deviceSavedInfo.connect_type === 'socket') { // TODO Serial Port에 접속하는 기능
        // NOTE Dev모드에서는 Socket Port를 재설정하므로 지정 경로로 접속기능 필요
        this.connectedDevice = await this.p_SocketClient.connect(deviceSavedInfo.port, deviceSavedInfo.ip);
        // BU.CLI('Socket에 접속하였습니다.  ' + deviceSavedInfo.port)
      } else {
        this.connectedDevice = await this.p_SerialClient.connect();
      }
      BU.log('Sucess Connected to Connector ', deviceSavedInfo.target_id);

      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.model.onTroubleData('Disconnected Connector', false)
      this.retryConnectDeviceCount = 0;

      return this.connectedDevice;
    } catch (error) {
      BU.CLI(error)
      this.emit('disconnected', error);
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
          return this.send2Cmd(cmd);
        })
        .then(() => {
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
            // 명전 전송 후 제한시간안에 응답이 안올 경우 에러 
            reject(new Error('timeout'))
          }, this.model.controlStatus.sendMsgTimeOutSec)
        })
      ]
    )
    clearTimeout(timeout);
    return this.model.refineConnectorData;

  }

  /**
   * 장치로 명령 발송 --> 명령 수행 후 응답 결과 timeout 처리를 위함
   * @param {Buffer} cmd 
   */
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
   * _onReceiveMsg Method 에서의 Event를 기다림
   * Event 결과에 따라 Resolve or Reject. Resolve 일 경우 processCmd 초기화
   */
  async _receiveMsgHandler() {
    // BU.CLI('_receiveMsgHandler')
    let result = await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    this.model.controlStatus.processCmd = {};
    return result;
  }

  /**
   * eventHandler로 부터 넘겨받은 data 처리
   * @param {Buffer} buffer 
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
        if (this.config.hasDev && this.config.deviceSavedInfo.target_category !== 'dev') {
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
    // 장치 접속 끊김
    this.on('disconnected', error => {
      this.model.onTroubleData('Disconnected Connector', true)
      // BU.CLI('disconnected', error)
      this.connectedDevice = {};

      let reconnectInterval = this.model.controlStatus.reconnectDeviceInterval;
      // 장치 접속을 2회 시도했는데도 안된다면  Interval을 10배로 함. (현재 10분에 한번 시도)
      if (this.model.retryConnectDeviceCount++ > 2) {
        reconnectInterval *= 10;
      }
      // setTimeout 걸어둠. 해당 시점에서 접속이 되면 timeout을 해제하고 아니라면 수행
      this.setTimer = setTimeout(() => {
        if (_.isEmpty(this.connectedDevice)) {
          this.connectDevice();
        } else {
          clearTimeout(this.setTimer)
        }
      }, reconnectInterval);
    })


    // 접속반 데이터 수신 핸들러
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