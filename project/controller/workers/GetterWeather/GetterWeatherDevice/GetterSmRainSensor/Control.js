const EventEmitter = require('events');
const _ = require('underscore');


const P_SerialManager = require('./P_SerialManager.js');
const Model = require("./Model.js");

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: false,
      deviceInfo: {},
      calculateOption: {},
      rainAlarmBoundaryList: {}
    };
    Object.assign(this.config, config.current);

    // Processing
    this.p_SerialManager = new P_SerialManager(this);

    // Model
    this.model = new Model(this);
  }


  init() {
    // TODO 장치가 없을 경우 장치 접속 X (장치가 없이 테스트하고자 할 경우)
    // BU.CLI('GetterSmRainSensor init', this.config)
    if (this.config.hasDev) {

    } else {
      this.connSerial();
    }
  }

  // 시리얼 연결
  connSerial() {
    if (this.p_SerialManager === null) {
      console.log('선언이 잘못 됨.');
      return false;
    }
    this.p_SerialManager.connect();
  }

  // 레인센서 평균 값 가져오기
  getRainData() {
    return this.model.averageRain;
  }

  getCurrentRainLevel() {
    return this.model.currentRainLevel;
  }

  // P -> C 
  _onSmRainSensorData_P(rainData) {
    this.model.onSmRainData(rainData);
  }

  // M - C
  _onSmRainSensorData_M(rainObj) {
    this.emit('updateSmRainSensor', rainObj);
    // this.model.onSmRainData(rainData);
  }








}

module.exports = Control;