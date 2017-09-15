const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

const Model = require('./Model.js');
const ProcessTest = require('./ProcessTest.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
	this.processTest = new ProcessTest(this);

    // Child
  }

  async init() {
    
  }
}
module.exports = Control;