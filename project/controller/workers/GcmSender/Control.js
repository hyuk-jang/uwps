const EventEmitter = require('events');
const _ = require('underscore');
const GcmSender = require('./GcmSender');
const Model = require('./Model.js');


class Control extends EventEmitter {
  constructor(config) {
    super();
    // BU.CLI(config)
    // 현재 Control 설정 변수
    this.config = {
      dbInfo: {},
      gcmInfo: {}
    };
    Object.assign(this.config, config.current);

    // Procss
    this.gcmSender = new GcmSender(this.config.gcmInfo);

    // Model
    this.model = new Model(this);
  }

  init() {
  
  }

  // App에 접속한 이력이 있는 사용자에게 GCM 전송
  sendMsgAll(msg, sendStatus) {
    this.model.selectRegistrationList((err, resultRegistrationIdList) => {
      this.gcmSender.sendAll(msg, sendStatus, resultRegistrationIdList, (err, result) => {
        // TODO: GCM 보낸 이력 DB에 저장할 필요 있다면 작업 필요
        // BU.CLI(err, result);
      });
    });
  }
}

module.exports = Control;