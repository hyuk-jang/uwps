const _ = require('lodash');
const cron = require('cron');
const {BU} = require('base-util-jh');

const config = require('./config');

const BiModule = require('../../../../models/BiModule');
const webUtil = require('../../../../models/web.util.js');

const {
  BaseModel,
} = require('../../../../../module/device-protocol-converter-jh');

/** 무안 6kW TB */

class Control {
  /** @param {config} mainConfig */
  constructor(mainConfig) {
    this.config = mainConfig || config;
    this.biModule = new BiModule(this.config.dbInfo);

    this.defaultConverter = BaseModel.defaultModule;

    /**
     * Main Storage List에서 각각의 거점 별 모든 정보를 가지고 있을 객체 정보 목록
     * @type {Array.<msInfo>}
     */
    this.mainStorageList = [];

    this.webUtil = webUtil;
  }

  /**
   * @desc Step: 1
   * Set Main Storage List
   * @param {msInfo[]} mainStorageList
   */
  setMainStorageList(mainStorageList) {
    this.mainStorageList = mainStorageList;
  }

  /**
   * Web Socket 설정
   * @param {Object} pramHttp
   */
  setSocketIO(pramHttp) {
    this.io = require('socket.io')(pramHttp);
    this.io.on('connection', socket => {
      socket.on('excuteSalternControl', msg => {
        const encodingMsg = this.defaultConverter.encodingMsg(msg);

        !_.isEmpty(this.client) &&
          this.write(encodingMsg).catch(err => {
            BU.logFile(err);
          });
      });

      if (this.stringfySalternDevice.length) {
        socket.emit('initSalternDevice', this.stringfySalternDevice);
        // socket.emit('initSalternCommand', this.stringfyStandbyCommandSetList);
        socket.emit(
          'initSalternCommand',
          this.stringfyCurrentCommandSet,
          this.stringfyStandbyCommandSetList,
          this.stringfyDelayCommandSetList,
        );
      }

      socket.on('disconnect', () => {});
    });
  }

  // Cron 구동시킬 시간
  runCronCalcPowerStatus() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 현황판 데이터 갱신
      this.cronScheduler = new cron.CronJob({
        cronTime: '* */1 * * * *',
        onTick: () => {
          this.requestCalcPowerStatus();
        },
        start: true,
      });
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
      if (msInfo.msFieldInfo.main_seq === 1) {
        this.muanTB.calcPowerStatus(msInfo);
      }
    });
  }
}
module.exports = Control;
