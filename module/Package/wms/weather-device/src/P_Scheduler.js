const Promise = require('bluebird');
const EventEmitter = require('events');
const cron = require('cron');

const Control = require('./Control');

class P_Scheduler extends EventEmitter {
  /** @param {Control} controller */
  constructor(controller) {
    super();
    this.controller = controller;

    this.scheduler = null;
    this.scheduleIntervalMin = 1; // 10 분마다
  }

  runCronForMeasureConnector(controllerList) {
    this._measureWeatherDevice(new Date(), controllerList);
    try {
      if (this.cronJobMeasureConnector !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureConnector.stop();
      }
      // 10분마다 요청
      this.cronJobMeasureConnector = new cron.CronJob({
        cronTime: `0 */${this.scheduleIntervalMin} * * * *`,
        onTick: () => {
          this._measureWeatherDevice(new Date());
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 정기적인 접속반 데이터 요청 메시지 이벤트 발생
  async _measureWeatherDevice(measureTime) {
    // BU.CLI('_measureConnector', measureTime);

    let returnValue = {
      vantagepro2Data: this.controller.vantagepro2.getDeviceStatus(),
      smInfraredData: this.controller.vantagepro2.getDeviceStatus(),
    };


    let connectorListData = await Promise.map(connectorControllerList, connectorController => {
      return connectorController.measureDevice();
    });
    // 접속반 리스트 모듈 단위 2차원 배열을 1차원 배열로 바꿈
    let flatList = _.flatten(connectorListData);
    // BU.CLI(flatList);

    this.emit('completeMeasureConnector', measureTime, flatList);
    return flatList;
  }


}
module.exports = P_Scheduler;