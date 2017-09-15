const EventEmitter = require('events');
const _ = require('underscore');

const Model = require("./Model.js");

const GetterSmRainSensor = require('./GetterSmRainSensor/Control.js');
const GetterVantagePro2 = require('./GetterVantagePro2/Control.js');

class Control extends EventEmitter {
  constructor(config) {
    super();

    // 현재 Control 설정 변수
    this.config = {
      // dbInfo: {},
      // gcmInfo: {}
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // 자식 객체 선언 및 설정 변수
    this.getterSmRainSensor = new GetterSmRainSensor(config.GetterSmRainSensor);
    this.getterVantagePro2 = new GetterVantagePro2(config.GetterVantagePro2);
  }

  // Control을 호출하였을 경우 최초 실행되는 구문.
  init() {
    this.getterSmRainSensor.init();
    this.getterVantagePro2.init();
  }

  updateWeatherDevice() {
    let vantagePro2 = this.getterVantagePro2.getCalcAverageObj();
    let smRain = this.getterSmRainSensor.getCurrentRainLevel();

    this.model.onWeatherDeviceData(vantagePro2, smRain);

    // BU.CLI(this.model.weatherDeviceData)
    this.emit('updateWeatherDevice', this.model.weatherDeviceData);
  }

  // 기상장비 통합 날씨 추출
  get weatherDeviceData() {
    return this.model.weatherDeviceData;
  }

}
module.exports = Control;