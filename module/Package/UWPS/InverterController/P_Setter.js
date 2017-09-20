const cron = require('cron');
class P_Setter {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config;
    this.cronJob = null;
  }

  async settingConverter(dialing) {
    try {
      let returnValue = {
        encoder: {},
        decoder: {},
        socketPort: 0
      };
      let Encoder = null;
      let Decoder = null;

      // 개발용 버전일 경우 인버터 소켓 서버 구동 및 소켓 프로토콜 컨버터 바인딩
      if (this.config.hasDev) {
        Encoder = require('./EncodingMsgSocket.js')
        Decoder = require('./DecodingMsgSocket.js');

        let port = await this.controller.dummyInverter.init();
        returnValue.socketPort = port;
        // returnValue.socketPort = 6000;

      } else if (this.config.deviceInfo.deviceName === 'singleHexInverter') {
        Encoder = require('./EncodingMsgSingleHex.js')
        Decoder = require('./DecodingMsgSingleHex.js');
      } else {
        // BU.logFile('인버터 프로토콜 컨버터가 없습니다.');
        throw '인버터 프로토콜 컨버터가 없습니다.';
      }
      this.controller.encoder = new Encoder(dialing);
      this.controller.decoder = new Decoder(dialing);

      return returnValue;
    } catch (error) {
      console.trace(error);
      throw Error(error);
    }
  }

  // 인버터로 메시지 발송
  async writeMsg(msg) {
    // BU.CLI(msg)
    if (this.config.deviceInfo.hasSocket && this.controller.socketClient.client === {}) {
      BU.CLI('Socket Client 연결이되지 않았습니다.');
      this.controller.connectedInverter = {};
      throw Error('Socket Client 연결이 되지 않았습니다.');
    } else if (!this.config.deviceInfo.hasSocket && this.controller.p_SerialManager.serialClient === {}) {
      // BU.CLI('Serial Client 연결이되지 않았습니다.');
      this.controller.connectedInverter = {};
      throw Error('Serial Client 연결이 되지 않았습니다.');
    }

    // BU.CLI('Msg 발송', msg);
    await this.controller.connectedInverter.write(msg);
    return true;
  }

  // 스케줄러 설정
  runCronGetter() {
    if(this.controller.config.hasDev){
      this._occurRequestInverterData();
    }

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
    // BU.CLI(this.controller.cmdList)
    let cmdValues = Object.values(this.controller.cmdList);
    let returnValue = [];
    cmdValues.forEach(element => {
      if (!this.controller.model.reserveCmdList.includes(element)) {
        returnValue.push(element);
      }
    });

    return this.controller.emit('startGetter',returnValue);
  }

}
module.exports = P_Setter;