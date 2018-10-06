const _ = require('lodash');
const cron = require('node-cron');
const { BU } = require('base-util-jh');

const config = require('./config');

const BiModule = require('../../../../models/BiModule');
const webUtil = require('../../../../models/web.util.js');

/** 무안 6kW TB */
const MuanTB = require('./MuanTB');

class Control {
  /** @param {config} mainConfig */
  constructor(mainConfig) {
    this.config = mainConfig || config;
    this.biModule = new BiModule(this.config.dbInfo);

    this.cronScheduler = null;

    /**
     * Main Storage List에서 각각의 거점 별 모든 정보를 가지고 있을 객체 정보 목록
     * @type {Array.<msInfo>}
     */
    this.mainStorageList = [];

    this.webUtil = webUtil;
    this.muanTB = new MuanTB(this);
  }

  /**
   * @desc Step: 1
   * Set Main Storage List
   * @param {msInfo[]} mainStorageList
   */
  setMainStorageList(mainStorageList) {
    this.mainStorageList = mainStorageList;
  }

  // Cron 구동시킬 시간
  runCronCalcPowerStatus() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 현황판 데이터 갱신
      this.cronScheduler = cron.schedule('* * * * *', () => {
        this.requestCalcPowerStatus();
      });

      this.cronScheduler.start();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * FIXME: 6kW급만 현황판 데이터 처리함. Promise 예외 발생 시 대처도 하지 않음.
   * 각 Power Status Board에 맞는 데이터를 구함
   */
  requestCalcPowerStatus() {
    this.mainStorageList.forEach(msInfo => {
      /** 6kW TB */
      if (msInfo.msFieldInfo.uuid === 'aaaaa') {
        this.muanTB.calcPowerStatus(msInfo);
      }
    });
  }
}
module.exports = Control;
