const Promise = require('bluebird');
const EventEmitter = require('events');
const cron = require('cron');

class P_Setter extends EventEmitter {
  constructor(controller) {
    super();
    this.controller = controller;
    this.config = controller.config;
    this.cronJob = null;
  }

  async settingConverter(dialing) {
    try {
      let Encoder = null;
      let Decoder = null;

      // 개발용 버전일 경우 더미 인버터프로그램 구동
      if (this.config.hasDev) {
        let port = await this.controller.dummyInverter.init();
        // 개발용 버전이면서 접속 타입이 socket일 경우에는 서로 연결시킬 port 지정
        if (this.config.ivtSavedInfo.connect_type === 'socket') {
          this.controller.model.ivtSavedInfo.port = port;
        }

        // 개발용 버전이고 실제 인버터 프로토콜을 따른다면 Test Stub 장착
        if(this.config.ivtSavedInfo.target_category !== 'dev') {
          let testStubDataPath = `./Converter/${this.config.ivtSavedInfo.target_category}/t_Decoder`;
          this.controller.testStubData = require(testStubDataPath);
        }
      } 
      
      

      // 컨버터를 붙임
      let encoderPath = `./Converter/${this.config.ivtSavedInfo.target_category}/Encoder`;
      let decoderPath = `./Converter/${this.config.ivtSavedInfo.target_category}/Decoder`;


      Encoder = require(encoderPath);
      Decoder = require(decoderPath);

      this.controller.encoder = new Encoder(dialing);
      this.controller.decoder = new Decoder(dialing);


      return true;
    } catch (error) {
      BU.CLI(error);
      throw Error(error);
    }
  }

  // 인버터로 메시지 발송
  async writeMsg(msg) {
    // BU.CLI(msg)
    console.time(msg)
    Promise.delay(500);
    console.timeEnd(msg)
    if (this.config.ivtSavedInfo.connect_type === 'socket' && this.controller.p_SocketClient.client === {}) {
      BU.CLI('Socket Client 연결이되지 않았습니다.');
      this.controller.connectedInverter = {};
      throw Error('Socket Client 연결이 되지 않았습니다.');
    } else if (this.controller.p_SerialClient.serialClient === {}) {
      // BU.CLI('Serial Client 연결이되지 않았습니다.');
      this.controller.connectedInverter = {};
      throw Error('Serial Client 연결이 되지 않았습니다.');
    }

    BU.CLI('Msg 발송', msg);
    await this.controller.connectedInverter.write(msg);
    return true;
  }

  // 스케줄러 설정
  runCronGetter() {
    // if(this.controller.config.hasDev){
    this._occurRequestInverterData();
    // }

    try {
      if (this.cronJob !== null) {
        // BU.CLI('Stop')
        this.cronJob.stop();
      }
      // BU.CLI('Setting Cron')
      // 1분마다 요청
      this.cronJob = new cron.CronJob({
        cronTime: '0 * * * * *',
        onTick: () => {
          // console.log('job 1 ticked');
          // BU.CLI(BU.convertDateToText(new Date()))
          this._occurRequestInverterData();
        },
        start: true,
        // timeZone: 'America/Los_Angeles'
      });
    } catch (error) {
      throw error;
    }
  }

  // 정기적인 인버터 데이터 요청 메시지 이벤트 발생 메소드
  _occurRequestInverterData() {
    // BU.CLI(this.controller.encoder.makeMsg())
    // return this.emit('startGetter', this.controller.encoder.makeMsg());
  }

}
module.exports = P_Setter;