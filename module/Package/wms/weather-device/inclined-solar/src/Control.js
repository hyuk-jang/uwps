const _ = require('lodash');

const cron = require('cron');
const {BU} = require('base-util-jh');

const AbstDeviceClient = require('../../../../../module/device-client-controller-jh');
const Model = require('./Model').default;

const mainConfig = require('./config');

class Control extends AbstDeviceClient {
  /** @param {mainConfig} config */
  constructor(config) {
    super();
    this.config = config.current || mainConfig.current;

    /** 주기적으로 LOOP 명령을 내릴 시간 인터벌 */
    this.executeCommandInterval = null;

    this.cronScheduler = null;

    this.model = new Model(this);
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init() {
    this.setDeviceClient(this.config.deviceInfo);
  }

  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {{id: string, config: Object, data: {smRain: number}, systemErrorList: Array, troubleList: Array}}
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code22223', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
    };
  }

  // Cron 구동시킬 시간
  runCronDiscoveryRegularDevice() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 3초 마다 데이터 수신 확인
      this.cronScheduler = new cron.CronJob({
        cronTime: '*/3 * * * * *',
        onTick: () => {
          this.requestData();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /** 경사 일사량 센서로 데이터를 요청하는 명령 발송 */
  requestData() {
    const cmdFormat = this.MODBUS.readInputRegisters;
    cmdFormat.unitId = this.config.incliendSolarInfo.unitId;
    cmdFormat.params.address = this.config.incliendSolarInfo.address;
    cmdFormat.params.length = this.config.incliendSolarInfo.length;

    const commandSet = this.generationAutoCommand(cmdFormat);
    this.executeCommand(commandSet);
  }

  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent 'dcConnect', 'dcClose', 'dcError'
   */
  updatedDcEventOnDevice(dcEvent) {
    BU.log('updateDcEvent\t', dcEvent.eventName);
    switch (dcEvent.eventName) {
      case this.definedControlEvent.CONNECT:
        this.runCronDiscoveryRegularDevice();
        break;
      default:
        break;
    }
  }

  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {dcData} dcData 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcData(dcData) {
    super.onDcData(dcData);

    BU.CLI(dcData.data);

    this.requestTakeAction(this.definedCommanderResponse.DONE);

    // BU.CLI(dcData.data.toString());

    this.model.onData(dcData.data);
    // BU.CLIN(this.getDeviceOperationInfo());
  }
}
module.exports = Control;
