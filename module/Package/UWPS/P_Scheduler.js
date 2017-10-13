const Promise = require('bluebird');
const EventEmitter = require('events');
const cron = require('cron');


class P_Scheduler extends EventEmitter {
  constructor(controller) {
    super();
    this.controller = controller;

    this.config = controller.config;
    this.cronJobMeasureInverter = null;


  }

  runCronForMeasureInverter(inverterControllerList) {
    this._measureInverter(new Date(), inverterControllerList);

    try {
      if (this.cronJobMeasureInverter !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureInverter.stop();
      }
      // BU.CLI('Setting Cron')
      // 1분마다 요청
      this.cronJobMeasureInverter = new cron.CronJob({
        cronTime: '0 * * * * *',
        onTick: () => {
          // console.log('job 1 ticked');
          // BU.CLI(BU.convertDateToText(new Date()))
          this._measureInverter(new Date(), inverterControllerList);
        },
        start: true,
        // timeZone: 'America/Los_Angeles'
      });
    } catch (error) {
      throw error;
    }
  }

  // 정기적인 인버터 데이터 요청 메시지 이벤트 발생 메소드
  _measureInverter(measureTime, inverterControllerList) {
    BU.CLI('_measureInverter', measureTime)
    Promise.map(inverterControllerList, inverterController => {
      return inverterController.measureInverter();
    })
    // 데이터 수집 완료시 해당 데이터 반환
    .then(inverterListData => {
      BU.CLI(inverterListData);
      return this.emit('completeMeasureInverter', measureTime, inverterListData);
    })
    // TODO 오류가 있을 경우 처리 필요
    .catch(err => {
      BU.CLI(err);
    })
  }


}
module.exports = P_Scheduler;