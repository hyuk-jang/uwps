'use strict';
const _ = require('lodash')
const {
  BU
} = require('base-util-jh');
const cron = require('cron');
// const AbstDeviceClient = require('device-client-controller-jh');
const AbstDeviceClient = require('../../../../../module/device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

// const {AbstConverter, controlFormat} = require('../../../../../../module/device-protocol-converter-jh');
const {
  AbstConverter,
  BaseModel
} = require('../../../../../module/device-protocol-converter-jh');
// const {AbstConverter} = require('device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    this.config = _.get(config, 'current', {})

    this.converter = new AbstConverter(this.config.deviceInfo.protocol_info);
    this.baseModel = new BaseModel.Weathercast(this.config.deviceInfo.protocol_info);

    this.model = new Model(this);
    /** 주기적으로 LOOP 명령을 내릴 시간 인터벌 */
    this.executeCommandInterval = null;

    this.cronScheduler = null;
    this.hasReceivedData = false;
    this.errorCount = 0;
  }

  get id() {
    return this.config.deviceInfo.target_id;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init() {
    if (!this.config.hasDev) {
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      BU.CLI('생성기 호출', this.id);
      require('./dummy')(this);
    }
    this.converter.setProtocolConverter(this.config.deviceInfo);
  }

  // Cron 구동시킬 시간
  runCronDiscoveryRegularDevice() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 3초마다 데이터 수신 확인 (LOOP 명령은 2초 마다 전송하기 때문에 충분)
      this.cronScheduler = new cron.CronJob({
        cronTime: '*/3 * * * * *',
        onTick: () => {
          this.discoveryRegularDevice();
          // /** @type {Array.<commandInfo>} */
          // let cmdList = this.converter.generationCommand();


          // this.discoveryRegularDevice();


        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 탐색
   */
  discoveryRegularDevice() {
    // 정상적인 데이터가 들어왔을 경우
    if (this.hasReceivedData) {
      // 초기화
      this.errorCount = 0;
      this.hasReceivedData = false;
    } else {
      this.errorCount++;

      // 데이터가 2번 이상 들어오지 않는다면 문제가 있다고 판단
      if (this.errorCount === 2) {
        var commandSet = this.generationAutoCommand(this.baseModel.DEFAULT.COMMAND.LOOP)
        this.executeCommand(commandSet);
        this.requestTakeAction(this.definedCommanderResponse.NEXT);
      } else if (this.errorCount === 4) { // 그래도 정상적인 데이터가 들어오지 않는다면
        var commandSet = this.generationAutoCommand(this.baseModel.DEFAULT.COMMAND.LOOP_INDEX)
        this.executeCommand(commandSet);
        this.requestTakeAction(this.definedCommanderResponse.NEXT);
      } else if (this.errorCount === 6){ // 통제할 수 없는 에러라면
        this.requestTakeAction(this.definedCommanderResponse.NEXT);
        this.errorCount = 0;  // 새롭게 시작
        this.manager.disconnect();  // 장치 재접속 요청
      } else {
        return false;
      }
      this.converter.resetTrackingDataBuffer();
    }
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
      measureDate: new Date()
    };
  }


  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent 
   */
  updatedDcEventOnDevice(dcEvent) {
    BU.log('updateDcEvent\t', dcEvent.eventName);
    try {
      /** @type {Array.<commandInfo>} */
      switch (dcEvent.eventName) {
        case this.definedControlEvent.CONNECT:
          var cmdWakeUp = this.generationAutoCommand(this.baseModel.DEFAULT.COMMAND.WAKEUP)
          this.executeCommand(cmdWakeUp)
          this.runCronDiscoveryRegularDevice();
          break;
        default:
          break;
      }

    } catch (error) {
      BU.CLI(error);
    }
  }

  /**
   * 장치에서 명령을 수행하는 과정에서 생기는 1:1 이벤트
   * @param {dcError} dcError 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcError(dcError) {
    // BU.CLI('dcError', dcError.errorInfo);
    if (dcError.errorInfo.message === this.definedOperationError.E_TIMEOUT) {
      // BU.CLI('E_UNHANDLING_DATA');
      // controlInfo.hasReconnect 옵션이 켜져있기 때문에 장치 재접속으로 데이터 미수신 처리
      this.manager.disconnect();
    }
  }


  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcData(dcData) {
    try {

      BU.CLI('data', dcData.data.toString());

      if (this.config.deviceInfo.connect_info.type === 'socket') {
        dcData.data = JSON.parse(dcData.data.toString());
        dcData.data.data = Buffer.from(dcData.data.data);
      }

      const resultParsing = this.converter.parsingUpdateData(dcData);
      // BU.CLI(resultParsing);
      if (resultParsing.eventCode === this.definedCommanderResponse.DONE) {
        // 정상적인 데이터가 들어왔다고 처리
        this.hasReceivedData = true;

        this.model.onData(resultParsing.data);
        BU.CLIN(this.getDeviceOperationInfo().data[BaseModel.Weathercast.BASE_KEY.SolarRadiation]);
      }
    } catch (error) {
      // BU.CLI(error);
      BU.logFile(error);
    }
  }
}
module.exports = Control;