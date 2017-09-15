const EventEmitter = require('events');
const _ = require('underscore');

const GcmSender = require('./GcmSender/Control.js');
const GetterWeather = require('./GetterWeather/Control.js');
const SocketServer = require('./SocketServer/Control.js')

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
    this.gcmSender = new GcmSender(config.GcmSender);
    this.getterWeather = new GetterWeather(config.GetterWeather);
    this.socketServer = new SocketServer(config.SocketServer);
  }

  init() {
    this.getterWeather.init();
    this.socketServer.init();
  }

  // GCM을 사용하고자 할 경우
  sendAllGcmMsg(msg, msgStatus) {
    this.gcmSender.sendMsgAll(msg, msgStatus);
  }
}

module.exports = Control;