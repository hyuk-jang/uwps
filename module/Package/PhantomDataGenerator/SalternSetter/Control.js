const EventEmitter = require('events');

const Model = require('./Model.js');
const P_Setter = require('./P_Setter.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      device_structure: [],
      dbInfo: {},
      UWPS: {
        photovoltaic: [],
        connector: [],
        inverter: []
      }
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
    this.p_Setter = new P_Setter(this);

    // Child
  }

  async init() {
    await this.p_Setter.init();

    return true;

  }
}
module.exports = Control;