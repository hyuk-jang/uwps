const Promise = require('bluebird');
const EventEmitter = require('events');
const cron = require('cron');


class P_Scheduler extends EventEmitter {
  constructor(controller) {
    super();
    this.controller = controller;

    this.config = controller.config;
    this.cronJobMeasureInverter = null;
    this.cronJobMeasureConnector = null;

    this.scheduleIntervalMin = 10; // 10 분마다

  }

  runCronForMeasureInverter(inverterControllerList) {
    this._measureInverter(new Date(), inverterControllerList);
    try {
      if (this.cronJobMeasureInverter !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureInverter.stop();
      }
      // 10분마다 요청
      this.cronJobMeasureInverter = new cron.CronJob({
        cronTime: `0 */${this.scheduleIntervalMin} * * * *`,
        onTick: () => {
          this._measureInverter(new Date(), inverterControllerList);
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  runCronForMeasureConnector(connectorControllerList) {
    this._measureConnector(new Date(), connectorControllerList);
    try {
      if (this.cronJobMeasureInverter !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureInverter.stop();
      }
      // 10분마다 요청
      this.cronJobMeasureInverter = new cron.CronJob({
        cronTime: `0 */${this.scheduleIntervalMin} * * * *`,
        onTick: () => {
          this._measureConnector(new Date(), connectorControllerList);
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  // 정기적인 인버터 데이터 요청 메시지 이벤트 발생 메소드
  async _measureInverter(measureTime, inverterControllerList) {
    // BU.CLI('_measureInverter', measureTime)
    let inverterListData = await Promise.map(inverterControllerList, inverterController => {
      return inverterController.measureInverter();
    })

    return this.emit('completeMeasureInverter', measureTime, inverterListData);


    // // 데이터 수집 완료시 해당 데이터 반환
    // .then(inverterListData => {
    //   // BU.CLI(inverterListData);
    //   return this.emit('completeMeasureInverter', measureTime, inverterListData);
    // })
    // // TODO 오류가 있을 경우 처리 필요
    // .catch(err => {
    //   BU.CLI(err);
    // })
  }

  // 정기적인 접속반 데이터 요청 메시지 이벤트 발생
  async _measureConnector(measureTime, connectorControllerList) {
    // BU.CLI('_measureConnector', measureTime);

    let connectorListData = await Promise.map(connectorControllerList, connectorController => {
      return connectorController.measureConnector();
    })

    // BU.CLI(connectorListData);
    return this.emit('completeMeasureConnector', measureTime, connectorListData);

    // // 데이터 수집 완료시 해당 데이터 반환
    // .then(connectorListData => {
      
    // })
    // // TODO 오류가 있을 경우 처리 필요
    // .catch(err => {
    //   BU.CLI(err);
    // })

  }


}
module.exports = P_Scheduler;