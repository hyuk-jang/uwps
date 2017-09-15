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
      calculateOption: {}
    };
    Object.assign(this.config, config.current);

    // Processing
    this.p_SerialManager = new P_SerialManager(this);

    // Model
    this.model = new Model(this);
  }

  init() {
    // TODO 장치가 없을 경우 장치 접속 X (장치가 없이 테스트하고자 할 경우)
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

  // 평균 값 데이터 반환
  getCalcAverageObj() {
    return this.model.calcAverageObj;
  }

  // P -> C 
  _onVantagePro2Data_P(vantagePro2Data) {
    this.model.onVantageData(vantagePro2Data);
  }

    // P -> C, 기상 관측 센서 업데이트 알림 이벤트
  _onVantagePro2Data_M(calcAverageObj) {
    this.emit('updateVantagePro2',calcAverageObj);
  }
}

module.exports = Control;