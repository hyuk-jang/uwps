const Promise = require('bluebird');
const { BU } = require('base-util-jh');
// const AbstDeviceClient = require('device-client-controller-jh');
const Model = require('./Model');

const mainConfig = require('./config');

// const {AbstConverter, controlFormat} = require('../../../../../../module/device-protocol-converter-jh');
const { AbstConverter, BaseModel } = require('../../../../../../../module/device-protocol-converter-jh');
// const {AbstConverter} = require('device-protocol-converter-jh');

const { dccFlagModel } = require('../../../../../../../module/default-intelligence');

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

    this.setInterval = null;
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
      // 라이브러리 로딩까지 초기 구동 시간을 부여
      await Promise.delay(100);
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
        this.runDeviceInquiryScheduler();
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
    const resultParsing = this.converter.parsingUpdateData({ data });
    // BU.CLI(resultParsing);
    if (resultParsing.eventCode === dccFlagModel.definedCommanderResponse.DONE) {
      // 정상적인 데이터가 들어왔다고 처리
      this.hasReceivedData = true;
      this.model.onData(resultParsing.data);
      // BU.CLI(
      //   'SolarRadiation',
      //   this.getDeviceOperationInfo().data[BaseModel.Weathercast.BASE_KEY.SolarRadiation],
      // );
    } else {
      // BU.CLI(resultParsing)
      // BU.logFile(JSON.stringify(resultParsing));
    }
  }

  // Cron 구동시킬 시간
  runDeviceInquiryScheduler() {
    try {
      if (this.setInterval !== null) {
        // BU.CLI('Stop')
        clearInterval(this.setInterval);
      }
      // 3초마다 데이터 수신 확인 (LOOP 명령은 2초 마다 전송하기 때문에 충분)
      this.setInterval = setInterval(() => {
        this.inquiryDevice();
      }, 3000);

      this.inquiryDevice();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 탐색
   */
  async inquiryDevice() {
    // 정상적인 데이터가 들어왔을 경우
    if (this.hasReceivedData) {
      // 초기화
      this.errorCount = 0;
      this.hasReceivedData = false;
    } else {
      this.errorCount += 1;

      // 데이터가 2번 이상 들어오지 않는다면 문제가 있다고 판단
      if (this.errorCount === 2) {
        BU.CLI('vantagePro: ECOUNT:2, LOOP 요청');
        await this.serialClient.write(this.baseModel.device.DEFAULT.COMMAND.LOOP);
        BU.CLI('vantagePro: ECOUNT:2, LOOP 완료');
      } else if (this.errorCount === 4) {
        // 그래도 정상적인 데이터가 들어오지 않는다면
        BU.CLI('vantagePro: ECOUNT:4, LOOP_INDEX 요청');
        await this.serialClient.write(this.baseModel.device.DEFAULT.COMMAND.LOOP_INDEX);
        BU.CLI('vantagePro: ECOUNT:4, LOOP_INDEX 완료');
      } else if (this.errorCount === 6) {
        // 통제할 수 없는 에러라면
        this.errorCount = 0; // 새롭게 시작
        BU.CLI('vantagePro: ECOUNT:6, disconnect 요청');
        // trackingDataBuffer 삭제
        this.converter.resetTrackingDataBuffer();
        await this.serialClient.disconnect(); // 장치 재접속 요청
        BU.CLI('vantagePro: ECOUNT:6, disconnect 완료');
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
