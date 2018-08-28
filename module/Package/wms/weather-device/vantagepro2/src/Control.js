const _ = require('lodash');
const cron = require('node-cron');
const {BU} = require('base-util-jh');
// const AbstDeviceClient = require('device-client-controller-jh');
const Model = require('./Model');

const mainConfig = require('./config');

// const {AbstConverter, controlFormat} = require('../../../../../../module/device-protocol-converter-jh');
const {AbstConverter, BaseModel} = require('../../../../../module/device-protocol-converter-jh');
// const {AbstConverter} = require('device-protocol-converter-jh');

const {dccFlagModel} = require('../../../../../module/default-intelligence');

const Serial = require('./DeviceClient/Serial');

class Control {
  /** @param {mainConfig} config */
  constructor(config) {
    this.config = config.current || mainConfig.current;

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
  async init() {
    if (!this.config.hasDev) {
      this.serialClient = new Serial(this.config.deviceInfo, this.config.deviceInfo.connect_info);
      this.serialClient.attach(this);
      await this.serialClient.connect();
    } else {
      BU.CLI('생성기 호출', this.id);
      require('./dummy')(this);
    }
    this.converter.setProtocolConverter(this.config.deviceInfo);
    return true;
  }

  /**
   * Device Controller에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {string} eventName 'dcConnect' 연결, 'dcClose' 닫힘, 'dcError' 에러
   */
  async onEvent(eventName) {
    switch (eventName) {
      case dccFlagModel.definedControlEvent.CONNECT:
        await this.serialClient.write(this.baseModel.device.DEFAULT.COMMAND.WAKEUP);
        // 데이터 수신 체크 크론 동작
        this.runCronDiscoveryRegularDevice();
        break;
      case dccFlagModel.definedControlEvent.DISCONNECT:
        break;
      default:
        break;
    }
  }

  /**
   * 장치에서 데이터가 수신되었을 경우 해당 장치의 데이터를 수신할 Commander에게 전송
   * @param {*} data
   */
  onData(data) {
    const resultParsing = this.converter.parsingUpdateData({data});
    // BU.CLI(resultParsing);
    if (resultParsing.eventCode === dccFlagModel.definedCommanderResponse.DONE) {
      // 정상적인 데이터가 들어왔다고 처리
      this.hasReceivedData = true;

      this.model.onData(resultParsing.data);
      BU.CLIN(this.getDeviceOperationInfo().data[BaseModel.Weathercast.BASE_KEY.SolarRadiation]);
    }
  }

  // Cron 구동시킬 시간
  runCronDiscoveryRegularDevice() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 3초마다 데이터 수신 확인 (LOOP 명령은 2초 마다 전송하기 때문에 충분)
      this.cronScheduler = cron.schedule('*/3 * * * * *', () => {
        this.discoveryRegularDevice();
      });

      this.cronScheduler.start();
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 탐색
   */
  async discoveryRegularDevice() {
    // 정상적인 데이터가 들어왔을 경우
    if (this.hasReceivedData) {
      // 초기화
      this.errorCount = 0;
      this.hasReceivedData = false;
    } else {
      this.errorCount += 1;

      // 데이터가 2번 이상 들어오지 않는다면 문제가 있다고 판단
      if (this.errorCount === 2) {
        await this.serialClient.write(this.baseModel.device.DEFAULT.COMMAND.LOOP);
      } else if (this.errorCount === 4) {
        // 그래도 정상적인 데이터가 들어오지 않는다면
        await this.serialClient.write(this.baseModel.device.DEFAULT.COMMAND.LOOP_INDEX);
      } else if (this.errorCount === 6) {
        // 통제할 수 없는 에러라면
        this.errorCount = 0; // 새롭게 시작
        await this.serialClient.disconnect(); // 장치 재접속 요청
      } else {
        return false;
      }
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
      systemErrorList: [],
      troubleList: [],
      measureDate: new Date(),
    };
  }
}
module.exports = Control;
