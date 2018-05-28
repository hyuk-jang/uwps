'use strict';

const _ = require('lodash');
const cron = require('cron');
const Promise = require('bluebird');

const {BU} = require('base-util-jh');

const Model = require('./Model');
const config = require('./config');

const moment = require('moment');


const Inverter = require('../Inverter');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;

    this.model = new Model(this);

    // 인버터를 계측하기 위한 스케줄러 객체
    this.cronScheduler = null;

    /** @type {Array.<Inverter>} */
    this.inverterList = [];
    // 인버터 계측이 완료되었는지 체크하기 위한 배열
    this.cronInverterList = [];
  }

  /**
   * 인버터 컨트롤러 리스트 생성
   */
  init() {
    this.createInverterController();
  }

  /**
   * 인버터 설정 값에 따라 인버터 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @returns {Promise} 인버터 계측 컨트롤러 생성 결과 Promise
   */
  async createInverterController() {
    BU.CLI('createInverterController');
    this.config.inverterList.forEach(inverterInfo => {
      const inverter = new Inverter(inverterInfo);
      inverter.init();
      inverter.attach(this);
      this.inverterList.push(inverter);
    });

    // 시스템 초기화 후 5초 후에 장치 계측 스케줄러 실행
    // Promise.delay(1000 * 5)
    //   .then(() => {
    //     this.runCronMeasure();
    //   });
  }

  /**
   * 인버터로부터 계측 명령을 완료했다고 알려옴
   * @param {Inverter} inverter 
   */
  notifyInverterData(inverter){
    BU.CLI('notifyInverterData', inverter.id);
    // 알려온 Inverter 데이터가 
    _.remove(this.cronInverterList, cronInverter => {
      if(_.isEqual(cronInverter, inverter)){
        // BU.CLIN(inverter.getDeviceOperationInfo().systemErrorList);
        // 인버터 데이터 모델에 반영
        this.model.onInverterData(inverter);
        return true;
      }
    });

    // 모든 인버터의 계측이 완료되었다면 
    // BU.CLI(this.cronInverterList.length);
    if(this.cronInverterList.length === 0){
      this.model.updateDeviceCategory(this.measureDate, 'inverter');
    }

  }

  /**
   * 인버터로부터 계측 명령을 완료했다고 알려옴
   * TODO 에러 처리 필요할 경우 기입
   * @param {Inverter} inverter 
   * @param {dcError} dcError 
   */
  notifyInverterError(inverter, dcError) {

  }

  // Cron 구동시킬 시간
  runCronMeasure() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 요청
      this.cronScheduler = new cron.CronJob({
        cronTime: '0 */1 * * * *',
        onTick: () => {
          this.measureDate = moment();
          this.measureRegularInverter();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /** 정기적인 Inverter Status 탐색 */
  measureRegularInverter(){
    BU.CLI('measureRegularInverter');
    // 응답을 기다리는 인버터 초기화
    this.cronInverterList = _.clone(this.inverterList);

    // Promise.map(this.inverterList, inverter => {
    //   BU.CLI('@@@@@@@@@@@@@@@@@@@', this.inverterList.length);
    //   BU.CLIN(inverter, 2);
    //   let commandInfoList = inverter.converter.generationCommand(inverter.baseModel.BASE.DEFAULT.COMMAND.STATUS);
    //   return inverter.orderOperation(commandInfoList);
    // });
    
    // 모든 인버터에 계측 명령 요청
    this.inverterList.forEach(inverter => {
      let commandInfoList = inverter.converter.generationCommand(inverter.baseModel.BASE.DEFAULT.COMMAND.STATUS);
      inverter.orderOperation(commandInfoList);
    });

  }





}
module.exports = Control;