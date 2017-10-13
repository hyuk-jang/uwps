const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');
const Promise = require('bluebird');

const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const Model = require('./Model.js');
const P_Scheduler = require('./P_Scheduler');

const InverterController = require('./InverterController/Control.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      inverterList:[],
      dbInfo: {},
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
    this.p_Scheduler = new P_Scheduler(this);

    // Child
    // this.inverterController = this.createInverterController(config.InverterController);

  }

  async init() {
    this.eventHandler();
    return await this.createInverterController(this.config.inverterList);
  }

  /**
   * 인버터 설정 값에 따라 인버터 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @param {Object} inverterConfigList 인버터 설정 값
   * @returns {Promise} 인버터 계측 컨트롤러 생성 결과 Promise
   */
  async createInverterController(inverterConfigList){
    // BU.CLI('createInverterController, configList)
    return await Promise.map(inverterConfigList, ivtConfig => {
      const inverterObj =  new InverterController(ivtConfig);
      return inverterObj.init();
    }).then(inverterControllerList => {
      this.model.inverterControllerList = inverterControllerList;
      return this.p_Scheduler.runCronForMeasureInverter(inverterControllerList);
    }).catch(err => {
      BU.errorLog('createInverterController', err)
      console.error(err)
    })
  }

  // 이벤트 핸들러
  eventHandler() {
    // BU.CLI('eventHandler')
    // 스케줄러 실행
    this.p_Scheduler.on('completeMeasureInverter', (measureTime, inverterListData) => {
      // BU.CLI(measureTime, inverterListData)
      this.model.completeMeasureInverter(measureTime, inverterListData)
    });
  }

}
module.exports = Control;