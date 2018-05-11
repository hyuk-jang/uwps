'use strict';
const _ = require('lodash');
const cron = require('cron');


const Promise = require('bluebird');

const BU = require('base-util-jh').baseUtil;

const SalternDevice = require('../SalternDevice'); 


const Model = require('./Model');

let SocketServer = require('./SocketServer');

let config = require('./config');

const map = require('../config/map');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;

    // BU.CLI(this.config);
    
    this.map = map;
    
    /** @type {Array.<SalternDevice>} */
    this.routerList = [];
    this.model = new Model(this);
    this.socketServer = new SocketServer(this);


    this.hasOperationScenario_1 = false;
    this.cronScheduler = null;
  }

  init(){
    this.map.setInfo.connectInfoList.forEach(deviceConnectInfo => {
      let connectInfo = {
        type: deviceConnectInfo.type,
        subType: deviceConnectInfo.subType,
        port: deviceConnectInfo.port,
        baudRate: deviceConnectInfo.baudRate
      };
      deviceConnectInfo.deviceRouterList.forEach(routerInfo => {
        if(routerInfo.nodeModelList.length){
          const salternDevice = new SalternDevice({current:{
            hasDev: false,
            deviceInfo: {
              target_id: routerInfo.targetId,
              target_category: this.config.deviceInfo.protocol_info.mainCategory,
              logOption:{
                hasCommanderResponse: true,
                hasDcError: true,
                hasDcEvent: true,
                hasReceiveData: true,
                hasDcMessage: true,
                hasTransferCommand: true
              },
              controlInfo: this.config.deviceInfo.controlInfo,
              protocol_info: {
                mainCategory: this.config.deviceInfo.protocol_info.mainCategory,
                subCategory: this.config.deviceInfo.protocol_info.subCategory,
                deviceId: routerInfo.deviceId,
              },
              connect_info: connectInfo,
              nodeModelList: routerInfo.nodeModelList
            }
          }});
          salternDevice.init();
          salternDevice.attch(this);
          this.routerList.push(salternDevice);
        }
      });
    });


    // 시스템 초기화 후 5초 후에 장치 탐색 스케줄러 실행
    Promise.delay(1000 * 5)
      .then(() => {
        this.runCronDiscoveryRegularDevice();
      });


  }

  // Cron 구동시킬 시간
  runCronDiscoveryRegularDevice() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 요청
      this.cronScheduler = new cron.CronJob({
        cronTime: '0 */1 * * * *',
        onTick: () => {
          this.discoveryRegularDevice();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /** 정기적인 Router Status 탐색 */
  discoveryRegularDevice(){
    this.routerList.forEach(router => {
      router.orderOperation({commandType: 'ADD', commandId: 'regularDiscovery'});
    });
  }


  getAllStatus(){
    return this.model.salternDeviceDataStorage;
  }

  /**
   * 
   * @param {boolean} hasRun 시나리오 모드 실행 / 정지
   */
  async scenarioMode_1(hasRun){
    if(hasRun === false){
      return this.hasOperationScenario_1 = false;
    }
    if(this.hasOperationScenario_1){
      return false;
    }

    

    this.hasOperationScenario_1 = true;
    let scenario_1 = _.find(this.map.controlList, {cmdName: '저수조 → 증발지 1'});  
    let scenario_2 = _.find(this.map.controlList, {cmdName: '증발지 1 → 해주 1'});  
    let scenario_3 = _.find(this.map.controlList, {cmdName: '해주 1 → 증발지 1'});  
    let scenario_4 = _.find(this.map.controlList, {cmdName: '증발지 1 → 해주 2'});  
    let scenario_5 = _.find(this.map.controlList, {cmdName: '해주 2 → 증발지 2, 3, 4'});  
    let scenario_6 = _.find(this.map.controlList, {cmdName: '증발지 4 → 해주3'});  
    let scenario_7 = _.find(this.map.controlList, {cmdName: '해주 3 → 결정지'});  
    let scenario_8 = _.find(this.map.controlList, {cmdName: '결정지 → 해주 3'});  
    
    // scenario_1: 저수조 → 증발지 1
    if(!this.hasOperationScenario_1) return false;
    this.excuteAutomaticControl(scenario_1);
    // 10초 딜레이 40 초 동안 급수 진행
    await Promise.delay(1000 * 50);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_1);



    // 밸브 닫는 시간 + 염수 증발 시간 할애
    await Promise.delay(1000 * 10);
    if(!this.hasOperationScenario_1) return false;



    // scenario_2: 증발지 1 → 해주 1
    this.excuteAutomaticControl(scenario_2);
    // 20 초 동안 염수 이동
    await Promise.delay(1000 * 20);
    if(!this.hasOperationScenario_1) return false;
    // 수로 수문을 너무 일찍 닫기 때문에 사용하지 않음.
    // this.cancelAutomaticControl(scenario_2);

    // 시나리오 3을 진행하면 자동으로 증발지 1 수문이 닫히므로 명령 내리지 않음
    // this.excuteSingleControl({modelId: 'V_101', hasTrue: 'false'});
    // this.excuteSingleControl({modelId: 'V_102', hasTrue: 'false'});
    // this.excuteSingleControl({modelId: 'V_103', hasTrue: 'false'});
    // this.excuteSingleControl({modelId: 'V_104', hasTrue: 'false'});
    // this.excuteSingleControl({modelId: 'WD_005', hasTrue: 'false'});
    


    // scenario_3: 해주 1 → 증발지 1
    this.excuteAutomaticControl(scenario_3);
    // 10초 딜레이 40 초 동안 급수 진행
    await Promise.delay(1000 * 50);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_3);



    // 밸브 닫는 시간 + 염수 증발 시간 할애
    await Promise.delay(1000 * 10);
    if(!this.hasOperationScenario_1) return false;



    // scenario_4: 증발지 1 → 해주 2
    this.excuteAutomaticControl(scenario_4);
    // 30 초 동안 염수 이동 진행
    await Promise.delay(1000 * 20);
    if(!this.hasOperationScenario_1) return false;
    // 수로 수문을 너무 일찍 닫기 때문에 사용하지 않음.
    // this.cancelAutomaticControl(scenario_4);
    // 염판 수문 닫기
    this.excuteSingleControl({modelId: 'V_101', hasTrue: false});
    this.excuteSingleControl({modelId: 'V_102', hasTrue: false});
    this.excuteSingleControl({modelId: 'V_103', hasTrue: false});
    this.excuteSingleControl({modelId: 'V_104', hasTrue: false});
    this.excuteSingleControl({modelId: 'WD_005', hasTrue: false});
    


    // // 명령 사이의 딜레이
    // await Promise.delay(1000 * 5);
    // if(!this.hasOperationScenario_1) return false;


    // scenario_5: 해주 2 → 증발지 2, 3, 4
    this.excuteAutomaticControl(scenario_5);
    // 40 초 동안 염수 이동 진행
    await Promise.delay(1000 * 40);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_5);



    // 염수 증발 시키기
    await Promise.delay(1000 * 5);
    if(!this.hasOperationScenario_1) return false;

    
    // scenario_6: 증발지 4 → 해주3
    this.excuteAutomaticControl(scenario_6);
    // 30 초 동안 염수 이동 진행
    await Promise.delay(1000 * 20);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_6);



    // // 명령 사이의 딜레이
    // await Promise.delay(1000 * 5);
    // if(!this.hasOperationScenario_1) return false;
    

    // scenario_7: 해주 3 → 결정지
    this.excuteAutomaticControl(scenario_7);
    // 30 초 동안 염수 이동 진행
    await Promise.delay(1000 * 40);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_7);
    

    
    // scenario_8: 결정지 → 해주 3
    this.excuteAutomaticControl(scenario_8);
    // 30 초 동안 염수 이동 진행
    await Promise.delay(1000 * 30);
    if(!this.hasOperationScenario_1) return false;
    this.cancelAutomaticControl(scenario_8);



    

    this.hasOperationScenario_1 = false;

    return true;
  }


  /**
   * Saltern Device로 부터 데이터 갱신이 이루어 졌을때 자동 업데이트 됨.
   * @param {SalternDevice} salternController 
   */
  notifyData(salternController) {
    this.model.onData(salternController);

    // this.socketServer.
    let commandStorage = this.model.commandStorage;
    let deviceStorage = this.model.getAllDeviceModelStatus();
    BU.CLI(commandStorage);
    BU.CLI(deviceStorage);

    this.socketServer.emitToClientList({commandStorage, deviceStorage});
  }

  /**
   * Device Client로부터 Error 수신
   * @param {dcError} dcError 명령 수행 결과 데이터
   */
  notifyError(dcError){

  }

  /**
   * 
   * @param {{modelId: string, hasTrue: boolean, rank: number=}} orderInfo 
   */
  excuteSingleControl(orderInfo){
    let foundRouter = this.model.findRouter(orderInfo.modelId);
    foundRouter.orderOperation(orderInfo);
  }

  /**
   * 
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo 
   */
  excuteAutomaticControl(controlInfo) {
    BU.CLI(controlInfo);
    let orderList = [];
    controlInfo.trueList.forEach(modelId => {
      let orderInfo = {
        commandType: 'ADD',
        hasTrue: true,
        modelId,
        commandId: controlInfo.cmdName
      };
      let foundRouter = this.model.findRouter(modelId);
      // BU.CLIN(foundRouter);
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    controlInfo.falseList.forEach(modelId => {
      let orderInfo = {
        commandType: 'ADD',
        hasTrue: false,
        modelId,
        commandId: controlInfo.cmdName
      };
      let foundRouter = this.model.findRouter(modelId);
      orderList.push(foundRouter.orderOperation(orderInfo));
    });
    BU.CLI(controlInfo);
    return orderList;
  }

  /**
   * 
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo 
   */
  cancelAutomaticControl(controlInfo){
    let orderList = [];
    controlInfo.trueList = _.reverse(controlInfo.trueList);
    controlInfo.trueList.forEach(modelId => {
      let orderInfo = {
        commandType: 'CANCEL',
        hasTrue: false,
        modelId,
        commandId: controlInfo.cmdName,

      };
      let foundRouter = this.model.findRouter(modelId);
      orderList.push(foundRouter.orderOperation(orderInfo));
    });

    // controlInfo.falseList.forEach(modelId => {
    //   let orderInfo = {
    //     hasTrue: true,
    //     modelId: '' ,
    //     commandId: controlInfo.cmdName
    //   };
    //   let {foundRouter, modelInfo} = this.findRouterAndModel(modelId);
    //   orderInfo.modelId = modelInfo.targetId;
    //   orderList.push(foundRouter.orderOperation(orderInfo));
    // });

    return orderList;
  }
}
module.exports = Control;


/**
 * @typedef {Object} deviceOperationInfo
 * @prop {SalternDevice} controller
 * @prop {string} id
 * @prop {Object} config
 * @prop {Object} data
 * @prop {Array.<systemError>} systemErrorList
 * @prop {Array.<systemError>} troubleList
 */

/**
 * @typedef {Object} systemError
 * @prop {string} code
 * @prop {string} msg
 * @prop {Date} occur_date
 */ 