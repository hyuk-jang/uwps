const Promise = require('bluebird');
const EventEmitter = require('events');
const Converter = require('../Converter')

class P_Setter extends EventEmitter {
  constructor(controller) {
    super();
    this.controller = controller;
    this.config = controller.config;
  }

  async settingConverter(dialing) {
    try {
      BU.CLI(this.config)
      console.log('T_T')
      const Encoder = Converter[this.config.cntSavedInfo.target_category].Encoder;
      const Decoder = Converter[this.config.cntSavedInfo.target_category].Decoder;

      // 실제 Converter 객체 생성 및 덮어씌움
      this.controller.encoder = new Encoder(dialing);
      this.controller.decoder = new Decoder();

      // 개발용 버전일 경우 더미 인버터프로그램 구동
      if (this.config.hasDev) {
        // let port = await this.controller.dummyInverter.init();
        // this.controller.dummyInverter.runCronForMeasureInverter();
        // // 개발용 버전이면서 접속 타입이 socket일 경우에는 서로 연결시킬 port 지정
        // if (this.config.cntSavedInfo.connect_type === 'socket') {
        //   this.controller.model.cntSavedInfo.port = port;
        // }

        // // 개발용 버전이고 실제 인버터 프로토콜을 따른다면 Test Stub 장착
        // if(this.config.cntSavedInfo.target_category !== 'dev') {
        //   this.controller.testStubData = Converter[this.config.cntSavedInfo.target_category].dummyDataGenerator;
        // }
      } 

      return true;
    } catch (error) {
      BU.CLI(error);
      throw Error(error);
    }
  }

  // 메시지 발송
  async writeMsg(msg) {
    // BU.CLI(msg)
    if (this.config.cntSavedInfo.connect_type === 'socket' && this.controller.p_SocketClient.client === {}) {
      BU.CLI('Socket Client 연결이되지 않았습니다.');
      this.controller.connectedConnector = {};
      throw Error('Socket Client 연결이 되지 않았습니다.');
    } else if (this.controller.p_SerialClient.serialClient === {}) {
      // BU.CLI('Serial Client 연결이되지 않았습니다.');
      this.controller.connectedConnector = {};
      throw Error('Serial Client 연결이 되지 않았습니다.');
    }

    // BU.CLI('Msg 발송', msg);
    await this.controller.connectedConnector.write(msg);
    return true;
  }
}
module.exports = P_Setter;