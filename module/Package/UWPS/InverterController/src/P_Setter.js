const EventEmitter = require('events');
const Control = require('./Control');
/**
 * @module
 * 장치별 Encoder, Decoder가 담겨 있는 Class
 */
const Converter = require('../Converter');
/** Class Protocol Converter Binding */
class P_Setter extends EventEmitter {
  /**
   * 계측 프로그램을 구동하기 위해서 필요한 설정 정보 
   * @param {Control} controller Controller 구동 객체
   * @param {Converter} controller.encoder Controller 에서 장치에게 보낼 명령을 만들어 주는 객체
   * @param {Converter} controller.decoder 장치에서 수신된 데이터를 Pasring 해주는 객체
   * @param {DummyInverter} controller.dummyInverter 개발용 가상 접속반 장치
   * @param {Object} controller.config Controller 객체 생성 구동 정보
   * @param {Object} controller.config.deviceSavedInfo 장치 설정 정보로 DB를 기초로 도출
   * @param {Object} controller.config.deviceSavedInfo.target_category 장치 Category --> 'dev', 's_hex' 
   * @param {Model} controller.model 컨트롤러 전반적인 정보 관리
   * @param {Object} controller.model.deviceSavedInfo Model 객체
   * @param {number} controller.model.deviceSavedInfo.port 접속할 장치의 port 번호
   */
  constructor(controller) {
    super();
    this.controller = controller;
    this.config = controller.config;
  }

  async settingConverter(dialing) {
    try {
      const parser = Converter[this.config.deviceSavedInfo.target_category].parser;
      const Encoder = Converter[this.config.deviceSavedInfo.target_category].Encoder;
      const Decoder = Converter[this.config.deviceSavedInfo.target_category].Decoder;

      this.controller.config.deviceSavedInfo.parser = parser;

      // 실제 Converter 객체 생성 및 덮어씌움
      this.controller.encoder = new Encoder(dialing);
      this.controller.decoder = new Decoder();

      // 개발용 버전일 경우 더미 인버터프로그램 구동
      if (this.config.hasDev) {
        let port = await this.controller.dummyInverter.init();
        this.controller.dummyInverter.runCronForMeasureInverter();
        // 개발용 버전이면서 접속 타입이 socket일 경우에는 서로 연결시킬 port 지정
        if (this.config.deviceSavedInfo.connect_type === 'socket') {
          this.controller.model.deviceSavedInfo.port = port;
        }

        // 개발용 버전이고 실제 인버터 프로토콜을 따른다면 Test Stub 장착
        if (this.config.deviceSavedInfo.target_category !== 'dev') {
          this.controller.testStubData = Converter[this.config.deviceSavedInfo.target_category].dummyDataGenerator;
        }
      }

      // BU.CLI(this.controller.model.deviceSavedInfo);

      return parser;
    } catch (error) {
      BU.CLI(error);
      throw Error(error);
    }
  }
}
module.exports = P_Setter;