const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const Model = require('./Model.js');
const DummyInverter = require('./DummyInverter/Control.js');

const P_Setter = require('./P_Setter.js');
const Converter = require('./Converter.js');

const SocketClient = require('./SocketClient.js');
const P_SerialManager = require('./P_SerialManager.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: true,
      controlOption: {},
      ivtSavedInfo: {},
      deviceInfo: {},
      calculateOption: {}
    };
    Object.assign(this.config, config.current);



    // 추상 클래스 정의 --> Intellicense Support
    this.encoder = new Converter();
    this.decoder = new Converter();
    this.connectedInverter = null;

    this.socketClient = new SocketClient(this);

    // Model
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);
    this.p_SerialManager = new P_SerialManager(this);

    // Child
    this.dummyInverter = new DummyInverter(config.DummyInverter);

    this.setTimer = null;
  }

  get inverterId() {
    return this.model.ivtSavedInfo.target_id;
  }

  get cmdList() {
    return this.model.cmdList;
  }

  get inverterTargetId() {
    return this.model.ivtSavedInfo.target_id;
  }

  // DB 정보를 넣어둔 데이터 호출
  getInverterInfo() {
    return this.model.ivtSavedInfo;
  }

  // cmd에 맞는 데이터 값 요청
  getInverterData(cmd) {
    return _.contains(this.cmdList, cmd) ? this.model.getInverterData(cmd) : {};
  }

  // 배율 적용된 값 요청
  getScaleInverterData(cmd) {
    return _.contains(this.cmdList, cmd) ? this.model.getScaleInverterData(cmd) : {};
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   */
  getHasOperation() {
    return this.model.hasOperation;
  }

  async init() {
    BU.CLI('init InverterController')
    this.eventHandler();
    // try {
    // 인버터 타입에 맞는 프로토콜을 바인딩
    let dialing = this.config.ivtSavedInfo.dialing;
    const settingObj = await this.p_Setter.settingConverter(dialing);
    // NOTE 인텔리전스를 위해 P_Setter에서 재정의함
    // this.encoder = settingObj.encoder;
    // this.decoder = settingObj.decoder;
    // 개발 버젼이라면 Socket 서버를 구동시키고 구동된 Port를 정의
    this.model.socketServerPort = settingObj.socketPort;
    // 개발 버젼이라면 Socket Client를 생성하고 Socket Server에 접속
    await this.connectInverter();
    return this;
    // } catch (error) {
    //   // BU.CLI(error)
    //   throw Error(error);
    // }
  }

  // 인버터 접속 클라이언트 설정
  async connectInverter() {
    try {
      if (this.config.hasDev) {
        this.connectedInverter = await this.socketClient.connect(this.model.socketServerPort);
      } else if (this.config.deviceInfo.hasSocket) { // TODO Serial Port에 접속하는 기능
        this.connectedInverter = await this.socketClient.connect(this.config.deviceInfo.port, this.config.deviceInfo.ip);
      } else {
        this.connectedInverter = await this.p_SerialManager.connect();
      }
      BU.CLI('Sucess Connected to Inverter', this.config.deviceInfo.deviceName);

      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.model.hasOperation = true;
      this.retryConnectInverterCount = 0;

      // 데이터 가져오는 Cron 시작
      this.p_Setter.runCronGetter();

      return this.connectedInverter;
    } catch (error) {
      // BU.CLI(error)
      this.emit('disconnectedInverter', error);
    }
  }


  // 현재 진행중인 명령이 있는지 확인. 없다면 명령 지시 
  commander() {
    // BU.CLI(this.model.controlStatus)
    if (this.model.processCmd !== '') {
      return new Error('현재 진행중인 명령이 존재합니다.');
    } else {
      let cmd = this.model.reserveCmdList[0];
      if (cmd === undefined) {
        BU.CLI(`${this.inverterId}의 명령 수행이 모두 완료되었습니다.`);
        return;
      } else {
        this.model.controlStatus.reserveCmdList.shift();
        this.send2Cmd(cmd).then(r => {
          return this.commander();
        }).catch(error => {
          // TODO 에러 처리 어떻게 할지 생각 필요
          let msg = `${this.inverterId}의 ${cmd}명령 수행 도중 ${error.message}오류가 발생하였습니다.`;
          BU.errorLog('send2InverterErr', msg, error);
          // BU.CLI(msg)
          // BU.CLI(this.model.controlStatus, error)
          return this.commander();
        })
      }
    }
  }

  /**
   * 인버터에 데이터 요청명령 발송. 주어진 시간안에 명령에 대한 응답을 못 받을 경우 에러 처리
   * @param  cmd 요청할 명령
   */
  async send2Cmd(cmd) {
    return Promise.race(
        [
          this.msgController(cmd),
          new Promise((_, reject) => setTimeout(() => {
            reject(new Error('timeout'))
          }, 1000 * this.config.controlOption.sendMsgTimeOutSec))
        ]
      )
      .then(result => {
        this.model.controlStatus.processCmd = '';
        this.model.controlStatus.processMsgList = [];
        return result;
      })
      .catch(err => {
        this.model.controlStatus.processCmd = '';
        this.model.controlStatus.processMsgList = [];
        // 저장되어 있는 값 초기화
        this.model.onInitInverterData(cmd);
        throw err;
      })
  }

  /**
   * 요청할 명령을 해당 프로토콜로 변환시키고 결과로 나온 요청 메시지들을 배열에 저장하고 첫번째 배열 인자를 실제로 요청.
   * 응답 핸들러의 결과를 기다리고 완료되었을 경우 해당 명령에 대한 값을 반환. 
   * @param {String} cmd 
   */
  async msgController(cmd) {
    if (this.model.processCmd === '') {
      // 메시지 인코딩
      let msg = this.encoder.makeMsg(cmd);
      // BU.CLI(msg)
      if(msg === '' || msg === null || msg === undefined){
        return new TypeError(cmd + '에 해당하는 명령은 존재하지 않습니다.');
      }
      // 현재 요청 중인 명령리스트에 추가
      this.model.controlStatus.processCmd = cmd;
      if (_.isArray(msg)) {
        this.model.controlStatus.processMsgList = msg;
      } else {
        this.model.controlStatus.processMsgList.push(msg);
      }

      await this.p_Setter.writeMsg(this.model.processMsgList[0]);
      await this._receiveMsgHandler();
      return this.model[cmd];
    } else {
      throw new RangeError('이미 진행중인 명령이 있습니다.');
    }

  }



  // 메시지 이벤트 종료 이벤트 핸들러
  async _receiveMsgHandler() {
    let result = await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트 첫번째 인자 삭제
    this.model.controlStatus.processMsgList.shift();
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    if (!this.model.processMsgList.length) {
      this.model.controlStatus.processCmd = '';
      return result;
    } else {
      // 요청 메시지가 남아있다면 요청
      this.p_Setter.writeMsg(this.model.processMsgList[0])
    }
  }

  _onReceiveInverterMsg(msg) {
    // 명령 내리고 있는 경우에만 수신 메시지 유효
    if (this.model.processCmd !== '') {
      try {
        // BU.CLI('_onReceiveInverterMsg', msg);
        let result = this.decoder._receiveData(msg);
        this.model.onInverterData(result);

        // 인버터 데이터 송수신 종료 이벤트 발생
        return this.emit('completeSend2Msg', result);
      } catch (error) {
        // BU.CLI(error)
        return this.emit('errorSend2Msg', error);
      }
    }
  }

  // 이벤트 핸들러
  eventHandler() {
    // 인버터 접속 에러
    this.on('disconnectedInverter', error => {
      // BU.CLI('disconnectedInverter', error)
      this.connectedInverter = {};
      // 인버터 문제 발생
      if(this.model.hasOperation){
        this.model.hasOperation = false;
        // TODO 현재 객체에 이벤트 발생 이벤트 핸들링 필요
        this.emit('errorDisconnectedInverter');
      }
      
      if (this.model.retryConnectInverterCount++ > 2) {
        // 장치 접속에 문제가 있다면 Interval을 10배로 함. (현재 10분에 한번 시도)
        this.setTimer = setTimeout(() => {
          this.connectInverter();
        }, this.config.controlOption.reconnectInverterInterval * 10);
      } else {
        // 인터벌에 따라 한번 접속 시도
        this.setTimer = setTimeout(() => {
          this.connectInverter();
        }, this.config.controlOption.reconnectInverterInterval);
      }
    })

    // 스케줄러 실행
    this.on('startGetter', reserveList => {
      BU.log('startGetter')
      this.model.controlStatus.reserveCmdList = reserveList;
      this.commander();

    })
  }

}
module.exports = Control;