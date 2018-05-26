'use strict';

const cron = require('cron');

const SmInfrared = require('../sm-infrared');
const Vantagepro2 = require('../vantagepro2');

const Model = require('./Model');

const config = require('./config');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;

    this.model = new Model(this);

    this.smInfrared = new SmInfrared(config.smInfrared);
    this.vantagepro2 = new Vantagepro2(config.vantagepro2);


    this.scheduler = null;
  }
  
  /** 기상 장치 컨트롤러 객체를 초기화 하고 스케줄러를 호출. (장치 접속 및 프로그램 구동) */
  init(){
    // TODO 적외선 센서 달면 활성화 할 것
    // this.smInfrared.init();
    this.vantagepro2.init();

    this.runScheduler();
  }

  /** VantagePro2와 SmInfraredSensor 데이터를 가져올 스케줄러 */
  runScheduler(){
    // const scheduleIntervalSec = 10;
    const scheduleIntervalMin = 1;  // 1분마다
    try {
      if (this.scheduler !== null) {
        // BU.CLI('Stop')
        this.scheduler.stop();
      }
      // 1분마다 요청
      this.scheduler = new cron.CronJob({
        cronTime: `0 */${scheduleIntervalMin} * * * *`,
        // cronTime: '*/10 * * * * *',
        onTick: () => {
          return this.model.getWeatherDeviceData(new Date());
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }


  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {deviceOperationInfo} 
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.controllerInfo.target_id,
      config: this.config.controllerInfo,
      data: this.model.deviceData,
      systemErrorList: this.model.systemErrorList,
      troubleList: this.model.troubleList,
      measureDate: new Date()
    };
  }


}
module.exports = Control;