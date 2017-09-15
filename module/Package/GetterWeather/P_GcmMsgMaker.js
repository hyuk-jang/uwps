const cron = require('cron');
const path = require('path');

// const GcmSender = require(path.resolve(process.cwd(), '..') + '/GcmSender/Control.js');
require('./prototypeDate.js');

class AppSender {
  constructor(controller) {
    this.controller = controller;

    this.cronJob = null;
  }

  runCronTomorrowPop() {
    // 오후 6시에 강수확율 알림
    let sendTimePOP = 18;

    if (this.cronJob !== null) {
      this.cronJob.stop();
    }

    this.cronJob = cron.job('0 0 ' + sendTimePOP + ' * * *', function () {
      let tomorrowPop = this.controller.getterWeatherCast.getTomorrowPop();
      BU.CLI(tomorrowPop)
      this.sendTomorrowPop(tomorrowPop);
    });
  }

  // 내일 최고 강수확율 App으로 전송
  sendTomorrowPop(tomorrowPop) {
    var tomorrow = BU.convertDateToText(new Date().addDays(1), "kor", 2);
    var msg = tomorrow.concat("의 강수확률은 " + tomorrowPop + "% 입니다.");

    this.controller.sendAllGcmMsg(msg, 'tomorrowPOP')
  }


  sendStartedRain(rainObj) {
    if (rainObj.sendStatus === 0) {
      console.log('비가 안오네용');
      return false;
    } else {
      this.controller.sendAllGcmMsg(rainObj.msg, rainObj.sendStatus)
    }
  }
}

module.exports = AppSender;