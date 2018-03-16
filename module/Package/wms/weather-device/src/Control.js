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
  
  init(){
    this.smInfrared.init();
    this.vantagepro2.init();

    this.runScheduler();
  }

  runScheduler(){
    const scheduleIntervalSec = 10;
    const scheduleIntervalMin = 1;
    try {
      if (this.scheduler !== null) {
        // BU.CLI('Stop')
        this.scheduler.stop();
      }
      // 10분마다 요청
      this.scheduler = new cron.CronJob({
        cronTime: `*/${scheduleIntervalSec} * * * * *`,
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


}
module.exports = Control;