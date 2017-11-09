const EventEmitter = require('events');
const _ = require('underscore');

const P_GcmMsgMaker = require('./P_GcmMsgMaker.js');

const GetterWeatherCast = require('./GetterWeatherCast/Control.js');
const GetterWeatherDevice = require('./GetterWeatherDevice/Control.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
    };
    Object.assign(this.config, config.current);

    // Procss
    this.p_GcmMsgMaker = new P_GcmMsgMaker(this);

    // 자식 객체 선언 및 설정 변수
    this.getterWeatherCast = new GetterWeatherCast(config.GetterWeatherCast);
    this.getterWeatherDevice = new GetterWeatherDevice(config.GetterWeatherDevice);
  }

  init() {
    this.eventHandler();
    return new Promise(resolve => {
      Promise.all([
        this.getterWeatherCast.init(),
        this.getterWeatherDevice.init()
      ])
        .then(result => {
          resolve(result);
        })
    })
    // this.getterWeatherCast.init();
    // this.getterWeatherDevice.init();
    // this.runCronTomorrowPop();
  }

  // 내일 강수확율 GCM 전송 스케줄러 실행
  runCronTomorrowPop() {
    this.p_GcmMsgMaker.runCronTomorrowPop();
  }

  // 즉시 내일 강수확률 GCM 전송
  sendGcmTomorrowPop(tomorrowPop) {
    // BU.CLI('sendGcmTomorrowPop',tomorrowPop)
    this.p_GcmMsgMaker.sendTomorrowPop(tomorrowPop);
  }

  sendAllGcmMsg(msg, msgStatus) {
    this.emit('sendAllGcmMsg', msg, msgStatus);
  }


  // 현재 강수 내용 GCM 전송
  sendGcmStartedRain(rainObj) {
    // BU.CLI(rainObj)
    this.p_GcmMsgMaker.sendStartedRain(rainObj);
  }


  eventHandler() {
    this.getterWeatherDevice.on('updateWeatherDevice', (err, data) => {
      BU.CLI('updateWeatherDevice')
    })

    this.getterWeatherDevice.getterSmRainSensor.on('updateSmRainSensor', (err, data) => {
      BU.CLI('updateSmRainSensor')
      return this.sendGcmStartedRain(data);
    })

    this.getterWeatherCast.on('updateWeatherCast', (err, data) => {
      BU.CLI('updateWeatherCast')
    })

  }

}

module.exports = Control;