const EventEmitter = require('events');
const Model = require('./Model.js');

const GetterSmRainSensor = require('../GetterSmRainSensor/Control.js');

const Bi = require('./Bi.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {

    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Child
    this.getterNewSmRainSensor_1 = new GetterSmRainSensor(config.GetterSmRainSensor_1)
    this.getterOldSmRainSensor_2 = new GetterSmRainSensor(config.GetterSmRainSensor_2)

    this.bi = new Bi(this.config.dbInfo)
  }

  init() {
    this.getterNewSmRainSensor_1.init();
    this.getterOldSmRainSensor_2.init();

  }




}
module.exports = Control;