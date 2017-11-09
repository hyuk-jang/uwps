const EventEmitter = require('events');
const _ = require('underscore');

const GcmSender = require('./GcmSender/Control.js');
const SocketServer = require('./SocketServer/Control.js')

const UPMS = require('./UPMS/Control');
const WMS = require('./WMS/Control');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      dbInfo: {},
      gcmInfo: {},
      UPMS: {},
      WMS: {}
    };
    Object.assign(this.config, config.current);

    // Procss

    // 자식 객체 선언 및 설정 변수
    this.gcmSender = new GcmSender(config.GcmSender);
    this.socketServer = new SocketServer(config.SocketServer);

    this.uPMS = new UPMS(config.UPMS);
    this.wMS = new WMS(config.WMS);
  }

  init() {
    return new Promise(resolve => {
      Promise.all([
        this.uPMS.init(),
        this.wMS.init()
      ])
      .then(r => {
        resolve(r);
      })
    })


    // this.getterWeather.init();
    this.socketServer.init();
  }

  // GCM을 사용하고자 할 경우
  sendAllGcmMsg(msg, msgStatus) {
    this.gcmSender.sendMsgAll(msg, msgStatus);
  }
}

module.exports = Control;