const _ = require('underscore');
const Promise = require('bluebird');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const Model = require('./Model.js');
const DummyInverter = require('./DummyInverter/Control.js');

const P_Setter = require('./P_Setter.js');
const Converter = require('./Converter/Converter.js');

const P_SocketClient = require('./P_SocketClient');
const P_SerialClient = require('./P_SerialClient');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: true,
      controlOption: {},
      ivtSavedInfo: {},
      calculateOption: {}
    };
    Object.assign(this.config, config.current);



    // 추상 클래스 정의 --> Intellicense Support
    this.encoder = new Converter();
    this.decoder = new Converter();
    this.testStubData = [];
    this.connectedInverter = null;

    this.p_SocketClient = new P_SocketClient(this);

    // Model
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);
    this.p_SerialClient = new P_SerialClient(this);

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

  get refineInverterData() {
    return this.model.refineInverterData;
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
    return this.model.hasConnectedInverter;
  }

  async init() {

    BU.CLI('init InverterController')
    this.eventHandler();
    // try {
    // 인버터 타입에 맞는 프로토콜을 바인딩
    let dialing = this.config.ivtSavedInfo.dialing;
    let socketPort = await this.p_Setter.settingConverter(dialing);
    // NOTE 인텔리전스를 위해 P_Setter에서 재정의함
    await this.connectInverter();
    return this;
    // } catch (error) {
    //   // BU.CLI(error)
    //   throw Error(error);
    // }
  }

  // 인버터 접속 클라이언트 설정
  async connectInverter() {
    BU.CLI('connectInverter')
    try {
      // 개발 버전일경우 자체 더미 인버터 소켓에 접속
      // if (this.config.hasDev) {
      //   this.connectedInverter = await this.socketClient.connect(this.model.socketServerPort);
      // } else 

      if (this.config.ivtSavedInfo.connect_type === 'socket') { // TODO Serial Port에 접속하는 기능
        // BU.CLI('?????????')
        BU.CLI(this.config.ivtSavedInfo.port, this.config.ivtSavedInfo.ip)

        // NOTE Dev모드에서는 Socket Port를 재설정하므로 지정 경로로 접속기능 필요
        this.connectedInverter = await this.p_SocketClient.connect(this.config.ivtSavedInfo.port, this.config.ivtSavedInfo.ip);
        BU.CLI('Socket에 접속하였습니다.')
        // BU.CLI('TTTTT')
      } else {
        this.connectedInverter = await this.p_SerialClient.connect();
      }
      BU.log('Sucess Connected to Inverter ', this.config.ivtSavedInfo.target_id);

      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.model.hasConnectedInverter = true;
      this.retryConnectInverterCount = 0;

      // 데이터 가져오는 Cron 시작
      this.p_Setter.runCronGetter();

      return this.connectedInverter;
    } catch (error) {
      BU.CLI(error)
      this.emit('disconnectedInverter', error);
    }
  }

  measureInverter() {
    if (!BU.isEmpty(this.model.processCmd)) {
      return new Error('현재 진행중인 명령이 존재합니다.');
    } else {
      this.model.controlStatus.reserveCmdList = this.encoder.makeMsg();
      Promise.each(this.model.controlStatus.reserveCmdList, cmd => {
          this.model.controlStatus.reserveCmdList.shift();
          this.model.controlStatus.processCmd = cmd;
          return this.send2Cmd(cmd);
        })
        // .bind({})
        .then((result) => {
          BU.CLIS(result, this.model.refineInverterData)
          return this.model.refineInverterData;
        })
        .catch(err => {
          let msg = `${this.inverterId}의 ${this.model.processCmd}명령 수행 도중 ${error.message}오류가 발생하였습니다.`;
          // BU.errorLog('send2InverterErr', msg);
          BU.CLI(msg)
          throw err;
        })
    }
  }

  // 현재 진행중인 명령이 있는지 확인. 없다면 명령 지시 
  commander() {
    // BU.CLI(this.model.controlStatus)
    if (!BU.isEmpty(this.model.processCmd)) {
      return new Error('현재 진행중인 명령이 존재합니다.');
    } else {
      let cmd = this.model.reserveCmdList[0];
      if (cmd === undefined) {
        // BU.CLI(this.model.refineInverterData)
        BU.CLI(`${this.inverterId}의 명령 수행이 모두 완료되었습니다.`);
        return this.model.refineInverterData;
      } else {
        this.model.controlStatus.reserveCmdList.shift();
        this.model.controlStatus.processCmd = cmd;

        // BU.CLI(this.model.controlStatus)
        this.send2Cmd(cmd).then(r => {
          this.model.controlStatus.sendIndex++;
          // BU.CLI(this.model.controlStatus)
          return this.commander();
        }).catch(error => {
          // TODO 에러 처리 어떻게 할지 생각 필요
          let msg = `${this.inverterId}의 ${cmd}명령 수행 도중 ${error.message}오류가 발생하였습니다.`;
          BU.errorLog('send2InverterErr', msg);
          BU.CLI(msg)
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
    BU.CLI(cmd)
    return Promise.race(
        [
          this.msgSendController(cmd),
          new Promise((_, reject) => setTimeout(() => {
            // BU.CLI(this.config.controlOption.sendMsgTimeOutSec)
            reject(new Error('timeout'))
          }, 1000 * this.config.controlOption.sendMsgTimeOutSec))
        ]
      )
      .then(result => {
        BU.CLI(result)
        return result;
      })
      .catch(err => {
        BU.CLI(err)
        throw err;
      })
  }

  async msgSendController(cmd) {
    BU.CLI(this.model.controlStatus)
    if (BU.isEmpty(cmd)) {
      return new Error('수행할 명령이 없습니다.');
    }

    await this.p_Setter.writeMsg(cmd);
    await this._receiveMsgHandler();

    return true;
  }

  // 메시지 이벤트 종료 이벤트 핸들러
  async _receiveMsgHandler() {
    // BU.CLI('_receiveMsgHandler')
    let result =  await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    this.model.controlStatus.processCmd = {};
    return result;
  }

  _onReceiveInverterMsg(msg) {
    BU.CLI('_onReceiveInverterMsg', msg)
    // 명령 내리고 있는 경우에만 수신 메시지 유효
    if (!BU.isEmpty(this.model.processCmd)) {
      try {
        // BU.CLI('_onReceiveInverterMsg', msg);
        let result = this.decoder._receiveData(msg);
        this.model.onInverterData(result);
        // 인버터 데이터 송수신 종료 이벤트 발생
        return this.emit('completeSend2Msg', result);
      } catch (error) {
        if (this.config.hasDev && this.config.ivtSavedInfo.target_category !== 'dev' && !BU.isEmpty(this.testStubData[this.model.controlStatus.sendIndex])) {
          // BU.CLI(this.testStubData[this.model.controlStatus.sendIndex])
          return this._onReceiveInverterMsg(this.testStubData[this.model.controlStatus.sendIndex])
        } else {
          // BU.CLI(error)
          return this.emit('errorSend2Msg', error);
        }
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
      if (this.model.hasConnectedInverter) {
        this.model.hasConnectedInverter = false;
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
    this.p_Setter.on('startGetter', reserveList => {
      BU.log('startGetter')
      this.model.controlStatus.reserveCmdList = reserveList;
      this.model.controlStatus.sendIndex = 0;
      this.commander();
    });

    // 인버터 소켓 장치 데이터 수신 핸들러
    this.on('receiveSocketData', (err, result) => {
      // BU.CLI(err, result)
      if (err) {
        return BU.errorLog('receiveDataError', err)
      }
      return this._onReceiveInverterMsg(result);
    })

    // 인버터 시리얼 장치 데이터 수신 핸들러
    this.on('receiveInverterData', (err, result) => {
      // BU.CLI('receiveInverterData',err, result)
      if (err) {
        return BU.errorLog('receiveDataError', err)
      }
      return this._onReceiveInverterMsg(result);
    })


    // this.connectedInverter.on('disconnectedSocketClient', () => {
    //   return this.emit('disconnectedInverter');
    // })

  }

}
module.exports = Control;