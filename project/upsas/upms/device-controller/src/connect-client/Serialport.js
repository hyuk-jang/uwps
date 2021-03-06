const bcjh = require('base-class-jh');

class SerialClient extends bcjh.serial.SerialClient {
  constructor(controller) {
    super(controller.config.deviceSavedInfo);

    // control 객체
    this.controller = controller;
    // 데이터 추출하기 위한 변수
  }

  async connect() {
    this.serialClient = await super.connect();
    this.serialClient.on('close', error => {
      this.serialClient = {};
      this.controller.emit('disconnected');
    });
    this.serialClient.on('error', error => {
      this.serialClient = {};
      this.controller.emit('disconnected');
    });

    return this.serialClient;
  }

  // 데이터 처리 핸들러
  processData(resData) {
    return this.controller.emit('data', null, resData);
  }
}

module.exports = SerialClient;