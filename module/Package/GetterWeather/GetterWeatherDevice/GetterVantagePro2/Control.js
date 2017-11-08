const EventEmitter = require('events');
const _ = require('underscore');

const P_SerialClient = require('./P_SerialClient');
const Model = require("./Model.js");

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: false,
      deviceInfo: {},
      calculateOption: {}
    };
    Object.assign(this.config, config.current);

    this.connectedDevice = {};
    this.setTimer = {};

    // Processing
    this.p_SerialClient = new P_SerialClient(this);

    // Model
    this.model = new Model(this);
  }

  init() {
    // TODO 장치가 없을 경우 장치 접속 X (장치가 없이 테스트하고자 할 경우)
    if (this.config.hasDev) {
      return false;
    }

    this.eventHandler();

    return new Promise(resolve => {
      this.connectDevice()
        .then(r => {
          resolve(r)
          // return r;
        })
        .catch(err => {
          BU.CLI(err)
          throw err;
        })
    })

  }

  // 시리얼 연결
  async connectDevice() {
    if (!_.isEmpty(this.connectedDevice)) {
      BU.CLI('이미 접속');
      return false;
    }

    this.connectedDevice = await this.p_SerialClient.connect();


    // 운영 중 상태로 변경
    clearTimeout(this.setTimer);
    this.model.hasConnectedDevice = true;
    this.model.retryConnectDeviceCount = 0;

    return this.connectedDevice;
  }

  // 평균 값 데이터 반환
  getCalcAverageObj() {
    return this.model.calcAverageObj;
  }

  eventHandler() {
    this.p_SerialClient.on('receiveData', (err, data) => {
      // BU.CLI('receiveData', rainData)
      let rainStatus = this.model.onSmRainData(data);
      if (!_.isEmpty(rainStatus)) {
        return this.emit('updateVantagePro2', rainStatus);
      }
    })

    // 장치 접속 에러
    this.p_SerialClient.on('disconnectedDevice', err => {
      // BU.CLI('disconnectedDevice', err)
      this.connectDevice = {};
      // 장치 문제 발생
      if (this.model.hasConnectedDevice) {
        this.model.hasConnectedDevice = false;
        // TODO 현재 객체에 이벤트 발생 이벤트 핸들링 필요
        return this.emit('errorDisconnectedDevice');
      }

      if (this.model.retryConnectDeviceCount++ > 2) {
        // 장치 접속에 문제가 있다면 Interval을 10배로 함. (현재 10분에 한번 시도)
        this.setTimer = setTimeout(() => {
          this.connectDevice();
        }, this.model.controlStatus.reconnectDeviceInterval * 10);
      } else {
        // 인터벌에 따라 한번 접속 시도
        this.setTimer = setTimeout(() => {
          this.connectDevice();
        }, this.model.controlStatus.reconnectDeviceInterval * 10);
      }
    })
  }
}

module.exports = Control;