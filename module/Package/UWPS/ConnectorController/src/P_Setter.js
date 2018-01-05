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
      // BU.CLI(this.config.cntSavedInfo.target_category)
      const Encoder = Converter[this.config.cntSavedInfo.target_category].Encoder;
      const Decoder = Converter[this.config.cntSavedInfo.target_category].Decoder;

      // 실제 Converter 객체 생성 및 덮어씌움
      this.controller.encoder = new Encoder(dialing);
      this.controller.decoder = new Decoder();
      

      // 개발용 버전일 경우 더미 인버터프로그램 구동
      if (this.config.hasDev) {
        let port = await this.controller.dummyConnector.init();
        // 개발용 버전이면서 접속 타입이 socket일 경우에는 서로 연결시킬 port 지정
        if (this.config.cntSavedInfo.connect_type === 'socket') {
          this.controller.model.cntSavedInfo.port = port;
        }
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
    if(_.isEmpty(this.controller.connectedDevice)){
      throw Error('장치와 연결이 되지 않았습니다.');
    }

    BU.CLI('Msg 발송', msg);
    await this.controller.connectedDevice.write(msg);
    return true;
  }
}
module.exports = P_Setter;