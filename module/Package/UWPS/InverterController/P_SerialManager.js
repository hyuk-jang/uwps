const SerialConnector = require(process.cwd().concat('/class/SerialConnector.js'));

class P_SerialManager extends SerialConnector {
  constructor(controller) {
    super(controller.config.deviceInfo);

    // control 객체
    this.controller = controller;
    // 데이터 추출하기 위한 변수
  }

  async connect() {
    await super.connect();
    this.serialClient.on('close', error => {
      this.serialClient = {};
      this.controller.emit('disconnectedInverter')
    });
    this.serialClient.on('error', error => {
      this.serialClient = {};
      this.controller.emit('disconnectedInverter')
    });

    return this.serialClient;
  }

  // 데이터 처리 핸들러
  processData(resData) {
    return this.controller._onReceiveInverterMsg(resData);
  }
}

module.exports = P_SerialManager;