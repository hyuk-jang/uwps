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


  }

  runCronForMeasureInverter(inverterControllerList) {
    this._measureInverter(new Date(), inverterControllerList);
    try {
      if (this.cronJobMeasureInverter !== null) {
        // BU.CLI('Stop')
        this.cronJobMeasureInverter.stop();
      }
      // 1분마다 요청
      this.cronJobMeasureInverter = new cron.CronJob({
        cronTime: '0 * * * * *',
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
    // try {
    //   if (this.cronJobMeasureInverter !== null) {
    //     // BU.CLI('Stop')
    //     this.cronJobMeasureInverter.stop();
    //   }
    //   // 1분마다 요청
    //   this.cronJobMeasureInverter = new cron.CronJob({
    //     cronTime: '0 * * * * *',
    //     onTick: () => {
    //       this._measureConnector(new Date(), connectorControllerList);
    //     },
    //     start: true,
    //   });
    //   return true;
    // } catch (error) {
    //   throw error;
    // }
  }

  // 정기적인 인버터 데이터 요청 메시지 이벤트 발생 메소드
  _measureInverter(measureTime, inverterControllerList) {
    // BU.CLI('_measureInverter', measureTime)
    Promise.map(inverterControllerList, inverterController => {
      return inverterController.measureInverter();
    })
    // 데이터 수집 완료시 해당 데이터 반환
    .then(inverterListData => {
      // BU.CLI(inverterListData);
      return this.emit('completeMeasureInverter', measureTime, inverterListData);
    })
    // TODO 오류가 있을 경우 처리 필요
    .catch(err => {
      BU.CLI(err);
    })
  }

  // 정기적인 접속반 데이터 요청 메시지 이벤트 발생
  _measureConnector(measureTime, connectorControllerList) {
    BU.CLI('_measureConnector', measureTime);

    Promise.map(connectorControllerList, connectorController => {
      return connectorController.measureConnector();
    })
    // 데이터 수집 완료시 해당 데이터 반환
    .then(connectorListData => {
      BU.CLI(connectorListData);
      return this.emit('completeMeasureConnector', measureTime, connectorListData);
    })
    // TODO 오류가 있을 경우 처리 필요
    .catch(err => {
      BU.CLI(err);
    })

  }


}
module.exports = P_Scheduler;