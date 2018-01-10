'use strict';
const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const Model = require('./Model.js');
const DummyInverter = require('../DummyInverter');
const Converter = require('../Converter')

const P_Setter = require('./P_Setter.js');

const P_SocketClient = require('./P_SocketClient');
const P_SerialClient = require('./P_SerialClient');

/**
 * @class Control
 * @classdesc 인버터에 맞는 프로토콜 변환모듈 장착 및 접속 방법 수립, 장치 접속, 상태 요청 및 데이터 적재
 * @extends EventEmitter
 */
class Control extends EventEmitter {
  /**
   * Control Class 생성자
   * @param {Object} config 해당 컨트롤러 설정 객체
   * @example 
   * ` `` json
   * config: {
   * hasDev: true,
   * baseFormat: {},
   * ivtDummyData: {},
   * deviceSavedInfo: {},
   * }
   * ` ``
   */
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: true,
      baseFormat: {},
      ivtDummyData: {},
      deviceSavedInfo: {},
    };
    Object.assign(this.config, config.current);
    // Converter 에서 공통 Format 불러옴
    this.config.baseFormat = Converter.baseFormat;


    // 추상 클래스 정의 --> Intellicense Support
    this.encoder = null;
    this.decoder = null;
    this.testStubData = [];
    this.connectedDevice = null;


    /**
     * Data 저장
     * @member {Object} Control.Model
     */
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);
    this.p_SocketClient = new P_SocketClient(this);
    this.p_SerialClient = new P_SerialClient(this);

    // Child
    this.dummyInverter = new DummyInverter(this.config.ivtDummyData);

    this.setTimer = null;
  }

  /**
   * 인버터명
   * @return {String} ID
   */
  get inverterId() {
    return this.model.deviceSavedInfo.target_id;
  }

  /**
   * 명령 종류
   * @return {Array} 명령 리스트
   */
  get cmdList() {
    return this.model.cmdList;
  }


  /**
   * DB 에 입력할 데이터 형태 반환
   */
  get refineInverterData() {
    return this.model.refineInverterData;
  }

  /**
   * 인버터 동작 상태
   * @return {Object} {isRun, isError, temperature, errorList, warningList}
   */
  get operationInfo() {
    return this.model.operationInfo;
  }

  // DB 정보를 넣어둔 데이터 호출
  getInverterInfo() {
    return this.model.deviceSavedInfo;
  }

  /**
   * cmd에 맞는 데이터 값 요청
   * @param {String} cmd 얻고자 하는 key(operation, pv, grid, power). 키가 없을 경우 {}
   * @return {Object} INverter Data Object
   */
  getInverterData(cmd) {
    BU.CLI('getInverterData')
    return this.cmdList.includes(cmd) ? this.model.getInverterData(cmd) : {};
  }

  /**
   * inverter 원본 데이터
   * @param {String} 원본 데이터
   * @return {Object} INverter Data Object
   */
  get inverterData() {
    return this.model.inverterData;
  }

  // 배율 적용된 값 요청
  getScaleInverterData(cmd) {
    return this.cmdList.includes(cmd) ? this.model.getScaleInverterData(cmd) : {};
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   * Socket or Serial 연결이 되어있는 상태면 동작 중인걸로 판단
   * @return {Boolean}
   */
  getHasOperation() {}

  /**
   * Controller 을 설정하고 해당 객체를 반환
   * @return {Object} Controller
   */
  async init() {
    // BU.CLI('init InverterController')
    this.eventHandler();
    // 인버터 타입에 맞는 프로토콜을 바인딩
    let dialing = this.config.deviceSavedInfo.dialing;
    dialing = dialing.type === 'Buffer' ? Buffer.from(dialing) : dialing;
    // NOTE 인텔리전스를 위해 P_Setter에서 재정의함
    await this.p_Setter.settingConverter(dialing);
    await this.connectDevice();

    return this;
  }

  /**
   * 인버터 장치 접속
   * @return {Object} Socket or Serial Object Client
   */
  async connectDevice() {
    // BU.CLI('connectDevice')
    try {
      // 개발 버전일경우 자체 더미 인버터 소켓에 접속
      let deviceSavedInfo = this.config.deviceSavedInfo;
      if (deviceSavedInfo.connect_type === 'socket') { // TODO Serial Port에 접속하는 기능
        // NOTE Dev모드에서는 Socket Port를 재설정하므로 지정 경로로 접속기능 필요
        this.connectedDevice = await this.p_SocketClient.connect(deviceSavedInfo.port, deviceSavedInfo.ip);
        // BU.CLI('Socket에 접속하였습니다.  ' + deviceSavedInfo.port)
      } else {
        this.connectedDevice = await this.p_SerialClient.connect();
      }
      // BU.log('Sucess Connected to Inverter ', deviceSavedInfo.target_id);

      this.model.onTroubleData('Disconnected Inverter', false)
      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.retryConnectDeviceCount = 0;

      return this.connectedDevice;
    } catch (error) {
      BU.CLI(error)
      this.emit('disconnected', error);
    }
  }

  /**
   * 인버터 계측 데이터 요청 리스트 전송 및 응답 시 결과 데이터 반환
   * @returns {Promise} 정제된 Inverter 계측 데이터 전송(DB 입력 용)
   */
  measureDevice() {
    // BU.CLI('measureDevice')
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
        .then(() => {
          // BU.CLI(`${this.inverterId}의 명령 수행이 모두 완료되었습니다.`);
          resolve(this.model.refineInverterData)
        })
        .catch(err => {
          let msg = `${this.inverterId}의 ${this.model.processCmd}명령 수행 도중 ${err.message}오류가 발생하였습니다.`;
          BU.errorLog('measureDevice', msg);

          // 컨트롤 상태 초기화
          this.model.initControlStatus();

          // TODO 에러시 어떻게 처리할 지 고민 필요
          //에러가 발생할 경우 빈 객체 반환
          resolve({})
        })
    })
  }

  /**
   * 인버터에 데이터 요청명령 발송. 주어진 시간안에 명령에 대한 응답을 못 받을 경우 에러 처리
   * @param  cmd 요청할 명령
   */
  async send2Cmd(cmd) {
    // BU.CLI('send2Cmd', cmd)
    // console.time(this.config.deviceSavedInfo.target_id + cmd)
    this.model.controlStatus.retryChance = 3;
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
    // BU.CLI(resRace)
    clearTimeout(timeout);
    return this.model.refineInverterData;

  }

  async msgSendController(cmd) {
    // BU.CLI('msgSendController', cmd)
    if (BU.isEmpty(cmd)) {
      return new Error('수행할 명령이 없습니다.');
    }

    await this.p_Setter.writeMsg(cmd);
    let result = await this._receiveMsgHandler();
    // BU.CLI(result)

    return result;
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
  _onReceiveMsg(buffer) {
    // BU.CLI('_onReceiveMsg', buffer)
    // 명령 내리고 있는 경우에만 수신 메시지 유효
    if (!BU.isEmpty(this.model.processCmd)) {
      try {
        let result = this.decoder._receiveData(buffer);
        // BU.CLI('_onReceiveMsg result', result);
        this.model.onData(result);
        // _receiveMsgHandler Method 에게 알려줄 Event 발생
        return this.emit('completeSend2Msg', result);
      } catch (error) {
        // TEST 개발 버전이고, 일반 인버터 프로토콜을 사용, 테스트용 데이터가 있다면 
        if (this.model.controlStatus.retryChance-- && this.config.hasDev && this.config.deviceSavedInfo.target_category !== 'dev' && !BU.isEmpty(this.testStubData[this.model.controlStatus.sendIndex]())) {
          // BU.CLI('TEST Data Send')
          // BU.CLI(this.testStubData[this.model.controlStatus.sendIndex]())
          return this._onReceiveMsg(this.testStubData[this.model.controlStatus.sendIndex]())
        }
        // 데이터가 깨질 경우를 대비해 기회를 더 줌
        if (this.model.controlStatus.retryChance--) {
          // BU.CLI('기회 줌', this.model.controlStatus.retryChance)
          return Promise.delay(30).then(() => {
            return this.p_Setter.writeMsg(this.model.processCmd).catch(err => {
              BU.CLI(err)
            });
          });
        } else {
          // BU.CLI(error)
          // _receiveMsgHandler Method 에게 알려줄 Event 발생
          return this.emit('errorSend2Msg', error);
        }
      }
    }
  }

  // 이벤트 핸들러
  eventHandler() {
    // 인버터 접속 에러
    this.on('disconnected', error => {
      // BU.CLI('disconnectedInverter', error)
      this.model.onTroubleData('Disconnected Inverter', true)
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

    // 인버터 소켓 장치 데이터 수신 핸들러
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