'use strict';

/** Promise를 더욱 풍부하게 사용하기 위한 Library */
const Promise = require('bluebird');
/** Event 처리 Library */
const EventEmitter = require('events');
/** Event 처리 Listener --> Promise로 반환 */
const eventToPromise = require('event-to-promise');

/** Device Connect, Write 처리 Middleware */
const dcm = require('device-connect-manager');
/** 자주쓰는 Util 모음 */
const BU = require('base-util-jh').baseUtil;

// Converter 매칭
const P_Setter = require('./P_Setter.js');
// Class Controller 데이터 관리
const Model = require('./Model.js');

/**
 * @class
 * 가상 Socket Server Listen 및 요청시 접속반 데이터 반환
 */
const DummyConnector = require('../DummyConnector');


/** Class 접속반을 계측하는 프로그램 */
class Control extends EventEmitter {
  /**
   * 계측 프로그램을 구동하기 위해서 필요한 설정 정보 
   * @param {Object} config Controller 구동 설정 정보
   * @param {boolean} config.hasDev 개발용인지 여부. 개발용일 경우 Dummy Socket Server를 구동함.
   * @param {object[]} config.troubleCodeList 해당 장치에 대한 자체 Trouble 추적을 할 경우 사용. {is_error: number, code: string, msg: string}
   * @param {object} config.deviceSavedInfo 컨트롤러 객체를 생성하기 위한 설정 정보로 DB를 참조하여 내려줌. {connector_seq, target_id, target_category, dialing, ip, port, baud_rate, address, ...etc}
   * @param {object[]} config.moduleList 접속반 ch별 module seq를 설정하기 위한 관계 정보 {photovoltaic_seq, connector_ch, ...etc}
   */
  constructor(config) {
    super();
    this.config = {
      hasDev: false,
      troubleCodeList: [],
      deviceSavedInfo: {},
      moduleList: []
    };
    Object.assign(this.config, config.current);

    /** Converter Encoder Binding 객체  */
    this.encoder;
    /** Converter Decoder Binding 객체  */
    this.decoder;

    // NOTE 연결된 장치 객체 -> P_Setter 에서 사용됨.
    this.hasConnect = false;

    /** Class Model 객체로 컨트롤러 데이터 관리(Chaining) */
    this.model = new Model(this);

    /** Class P_Setter 객체로 Converter Binding 처리(Chaining) */
    this.p_Setter = new P_Setter(this);

    /** Class DummyConnector 객체로 config.HasDev === true 일 경우 구동 (Chaining) */
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
  getDeviceSavedInfo() {
    // BU.CLI(this.model.deviceSavedInfo)
    return this.model.deviceSavedInfo;
  }

  /**
   * 현재 인버터 컨트롤러가 작동하는지 여부
   * FIXME 접속반의 이상유무를 어떻게 체크해야할지 논의 필요(모듈 이상 검출 장치?)
   */
  getHasOperation() {}

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
    // 국번 정의
    let dialing = this.config.deviceSavedInfo.dialing;
    dialing = dialing.type === 'Buffer' ? Buffer.from(dialing) : dialing;


    // 접속반 종류별 프로토콜 장착 (개발용이고 socket 일 경우 port 자동 변경)
    await this.p_Setter.settingConverter(dialing);

    // device connector 객체 연결
    BU.CLI(this.model.deviceSavedInfo);
    dcm.init(this.model.deviceSavedInfo, this);

    // this에 Event Emitter Binding
    this.eventHandler();

    await this.connectDevice();

    return this;
  }

  /**
   * 접속반 장치 접속
   * @return {object} Socket or Serial Object Client
   */
  async connectDevice() {
    try {
      // 개발 버전일경우 자체 더미 인버터 소켓에 접속
      let deviceSavedInfo = this.model.deviceSavedInfo;
      // 장치 접속 객체에 connect 요청
      this.hasConnect = await dcm.connect();

      BU.log('Sucess Connected to Connector ', deviceSavedInfo.target_id);

      // 운영 중 상태로 변경
      clearTimeout(this.setTimer);
      this.model.onTroubleData('Disconnected Connector', false);
      this.retryConnectDeviceCount = 0;

      return this.hasConnect;
    } catch (error) {
      BU.CLI(error);
      this.emit('dcDisconnected', error);
    }
  }

  /**
   * 접속반 계측 데이터 요청 리스트 전송 및 응답 시 결과 데이터 반환
   * @returns {Promise} 정제된 Connector 계측 데이터 전송(DB 입력 용)
   */
  async measureDevice() {
    return new Promise((resolve, reject) => {
      if (!BU.isEmpty(this.model.processCmd)) {
        reject('현재 진행중인 명령이 존재합니다.\n' + this.model.processCmd);
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
          resolve(this.model.refineConnectorData);
        })
        .catch(err => {
          let msg = `${this.connectorId}의 ${this.model.processCmd}명령 수행 도중 ${err.message}오류가 발생하였습니다.`;
          BU.errorLog('measureInverter', msg);

          // 컨트롤 상태 초기화
          this.model.initControlStatus();

          reject(err);

          // TODO 에러시 어떻게 처리할 지 고민 필요
          //에러가 발생할 경우 빈 객체 반환
          // resolve({})
        });
    });
  }

  /**
   * 접속반에 데이터 요청명령 발송. 주어진 시간안에 명령에 대한 응답을 못 받을 경우 에러 처리
   * @param  cmd 요청할 명령
   */
  async send2Cmd(cmd) {
    // BU.CLI('send2Cmd', cmd)
    let timeout = {};
    await Promise.race(
      [
        this.msgSendController(cmd),
        new Promise((_, reject) => {
          timeout = setTimeout(() => {
            // BU.CLI(this.model.controlStatus.sendMsgTimeOutSec)
            // 명전 전송 후 제한시간안에 응답이 안올 경우 에러 
            reject(new Error('timeout'));
          }, this.model.controlStatus.sendMsgTimeOutSec);
        })
      ]
    );
    clearTimeout(timeout);
    return this.model.refineConnectorData;

  }

  /**
   * 장치로 명령 발송 --> 명령 수행 후 응답 결과 timeout 처리를 위함
   * @param {Buffer} cmd 
   * @param {Promise} 정상 처리라면 true, 아닐 경우 throw error
   */
  async msgSendController(cmd) {
    // BU.CLI('msgSendController', this.model.controlStatus)
    if (BU.isEmpty(cmd)) {
      return new Error('수행할 명령이 없습니다.');
    }
    // 장치로 명령 전송
    await dcm.write(cmd);
    // 수신된 메시지의 유효성 검증
    // TODO File Logging 하고싶다면 여기서 파일 저장
    let originalMsg = await eventToPromise.multi(this, ['completeSend2Msg'], ['errorSend2Msg']);
    // 요청 메시지 리스트가 비어있다면 명령 리스트를 초기화하고 Resolve
    this.model.controlStatus.processCmd = {};
    return true;
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
        this.model.onData(result);
        // 인버터 데이터 송수신 종료 이벤트 발생
        return this.emit('completeSend2Msg', msg);
      } catch (error) {
        // BU.CLI(error)
        // 개발 버전이고, 개발용 Category가 아니라면 가상 데이터 반환하고 완료 처리함
        if (this.config.hasDev && this.config.deviceSavedInfo.target_category !== 'dev') {
          this.model.onData(this.model.testData);
          return this.emit('completeSend2Msg', this.model.testData);
        }
        // 데이터가 깨질 경우 현재 진행중인 명령 재 요청
        else if (this.model.controlStatus.retryChance--) {
          return Promise.delay(30).then(() => {
            dcm.write(this.model.processCmd).catch(err => {
              BU.CLI(err);
            });
          });
        } else {
          return this.emit('errorSend2Msg', error);
        }
      }
    }
  }

  /**
   * Controller 객체에 발생한 Event 처리
   */
  eventHandler() {
    /** 장치의 연결이 끊겼을 경우 */
    this.on('dcDisconnected', () => {
      this.model.onTroubleData('Disconnected Connector', true);
      // BU.CLI('disconnected', error)
      this.hasConnect = false;

      let reconnectInterval = this.model.controlStatus.reconnectDeviceInterval;
      // 장치 접속을 2회 시도했는데도 안된다면  Interval을 10배로 함. (현재 10분에 한번 시도)
      if (this.model.retryConnectDeviceCount++ > 2) {
        reconnectInterval *= 10;
      }
      // setTimeout 걸어둠. 해당 시점에서 접속이 되면 timeout을 해제하고 아니라면 수행
      this.setTimer = setTimeout(() => {
        if (this.hasConnect) {
          clearTimeout(this.setTimer);
        } else {
          this.connectDevice();
        }
      }, reconnectInterval);
    });

    /** 장치에서 Error가 발생하였을 경우 */
    this.on('dcError', err => {
      return BU.errorLog('dcError', err);
    });


    /** 장치에서 수신된 데이터 처리 */
    this.on('dcData', data => {
      // BU.CLI(data);
      return this._onReceiveMsg(data);
    });

  }

}
module.exports = Control;