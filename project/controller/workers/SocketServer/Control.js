const EventEmitter = require('events');
const _ = require('underscore');

const PushServer = require('./PushServer/Control.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      dbInfo: {},
      gcmInfo: {}
    };
    Object.assign(this.config, config.current);

    // Procss

    // 자식 객체 선언 및 설정 변수
    this.pushServer = new PushServer(config.PushServer);
  }

  init() {
    this.pushServer.init();
  }

  // GCM을 사용하고자 할 경우
  sendAllGcmMsg(msg, msgStatus) {
    // this.gcmSender.sendMsgAll(msg, msgStatus);
  }
}

module.exports = Control;