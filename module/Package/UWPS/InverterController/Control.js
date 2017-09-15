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

    this.cmdList = {
      getFault: 'fault',
      getPv: 'pv',
      getGrid: 'grid',
      getPower: 'power',
      getSysInfo: 'sysInfo',
      getWeather: 'weather'
    }

    this.reconnectInverterInterval = 1000 * 6; // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
    this.sendMsgTimeOutSec = 10; // 10초안에 응답메시지 못 받을 경우 해당 에러처리
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
  getHasOperation(){
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
      this.model.hasOperation = true;
      this.retryConnectInverterCount = 0;

      return this.connectedInverter;
    } catch (error) {
      BU.CLI(error)
      this.emit('disconnectedInverter', error);
    }
  }

  /**
   * 인버터에 데이터 요청명령 발송
   * @param {String} cmd 메시지 요청
   */
  async send2Cmd(cmd) {
    return Promise.race(
        [
          this.msgController(cmd),
          new Promise((_, reject) => setTimeout(() => {
            reject(new Error('timeout'))
          }, 1000 * this.sendMsgTimeOutSec))
        ]
      )
      .then(result => {
        this.model.requestCmdList = [];
        this.model.requestMsgList = [];
        return result;
      })
      .catch(err => {
        BU.CLI(err);
        throw err;
      })
  }

  async msgController(cmd) {
    // try {
    if (_.isEmpty(this.model.requestCmdList)) {
      // 메시지 인코딩
      let msg = this.encoder.makeMsg(cmd);
      // 현재 요청 중인 명령리스트에 추가
      this.model.requestCmdList.push(cmd);
      if (_.isArray(msg)) {
        // this.model.requestBufferList = this.model.requestBufferList.concat(msg);
        this.model.requestMsgList = msg;
      } else {
        this.model.requestMsgList.push(msg);
      }

      await this.p_Setter.writeMsg(this.model.requestMsgList[0]);
      await this._receiveMsgHandler();
      return this.model[cmd];
    } else {
      throw new RangeError('이미 진행중인 명령이 있습니다.');
    }
    // } catch (error) {
    //   BU.CLI(error)
    //   this.model.requestCmdList = [];
    //   this.model.requestMsgList = [];
    //   throw error;
    // }
  }



  // 메시지 이벤트 종료 이벤트 핸들러
  async _receiveMsgHandler() {
    let result = await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트 첫번째 인자 삭제
    this.model.requestMsgList.shift();
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    if (!this.model.requestMsgList.length) {
      this.model.requestCmdList = [];
      return result;
    } else {
      // 요청 메시지가 남아있다면 요청
      this.p_Setter.writeMsg(this.model.requestMsgList[0])
    }
  }

  _onReceiveInverterMsg(msg) {
    // 명령 내리고 있는 경우에만 수신 메시지 유효
    if (this.model.requestCmdList.length) {
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

  // 예외처리 핸들러
  eventHandler() {

    this.on('disconnectedInverter', error => {
      BU.CLI('disconnectedInverter', error)
      this.connectedInverter = {};
      // 재시도 횟수 추가시 인버터 구동 중지처리
      if (this.model.retryConnectInverterCount++ > 2) {
        this.model.hasOperation = false;
      } else {
        setTimeout(() => {
          this.connectInverter();
        }, this.reconnectInverterInterval);
      }
    })
  }

}
module.exports = Control;