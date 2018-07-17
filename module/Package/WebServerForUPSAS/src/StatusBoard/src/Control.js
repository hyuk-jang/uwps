'use strict';

const _ = require('lodash');
const cron = require('cron');
const { BU } = require('base-util-jh');

// const AbstDeviceClient = require('device-client-controller-jh');
const AbstDeviceClient = require('../../../../../module/device-client-controller-jh');

// const { AbstConverter, BaseModel } = require('device-protocol-converter-jh');

const config = require('./config');

const BiModule = require('../../../models/BiModule');
const webUtil = require('../../../models/web.util.js');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();

    this.config = config;
    this.biModule = new BiModule(this.config.dbInfo);
  }

  /** 
   * @desc Step 3
   * device client 설정 및 프로토콜 바인딩
   */
  init() {
    if (!this.config.hasDev) {
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      BU.CLI('생성기 호출', this.id);
      require('./dummy')(this);
    }
  }

  // Cron 구동시킬 시간
  runCronSubmitPowerStatus() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 현황판 데이터 전송
      this.cronScheduler = new cron.CronJob({
        cronTime: '* */1 * * * *',
        onTick: () => {
          this.submitStatusPowerData().then().catch();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
  }

  /** 현황판 데이터 생성 */
  async submitStatusPowerData() {
    try {
      // 수중 6kW급 발전 현황
      let invertersWater = {
        currKw: 0,
        dailyPower: 0,
        cumulativePower: 0
      };

      // 지상 3kW급 발전 현황
      let invertersEarth = {
        currKw: 0,
        dailyPower: 0,
        cumulativePower: 0
      };
      // 전체 발전 현황
      let invertersTotal = {
        cumulativePower: 0,
        solarRadiation: 0,
        temp: 0,
        co2: 0
      };
      // let searchRange = this.biModule.getSearchRange('min10');

      const EARTH = '육상';

      let vInverterDataList = await this.biModule.getTable('v_inverter_status');

      let groupingInverterDataList = _.groupBy(vInverterDataList, 'install_place');
      // BU.CLI(groupingInverterDataList);

      // 육상, 수중, 총합 누적 발전량 산출
      _.forEach(groupingInverterDataList, (inverterDataList, groupName) => {
        let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

        let currKwList = [];
        // 유효한 데이터 일 경우에만 배열에 저장
        validInverterDataList.forEach(currentItem => {
          if(currentItem.hasValidData){
            currKwList.push(currentItem.data.out_w);
          }
        });
      

        const cumulativePower = _.divide(_(inverterDataList).map('c_wh').sum(), 1000000); 
        const dailyPower = _.divide(_(inverterDataList).map('daily_power_wh').sum(), 1000); 
        const currKw = _.divide(_.sum(currKwList), 1000); 
        if(groupName === EARTH) {
          invertersEarth.cumulativePower = cumulativePower;
          invertersEarth.dailyPower = dailyPower;
          invertersEarth.currKw = currKw;
        } else {
          invertersWater.cumulativePower = cumulativePower;
          invertersWater.dailyPower = dailyPower;
          invertersWater.currKw = currKw;
        }
      });

    
      invertersTotal.cumulativePower = _.round( _.sum([invertersEarth.cumulativePower, invertersWater.cumulativePower]), 1);
      invertersTotal.co2 = _.round(invertersTotal.cumulativePower * 0.424, 1);
    
      let weatherDeviceStatus = await this.biModule.getWeather();
      // 인버터 발전 현황 데이터 검증
      let validWeatherDeviceStatus = webUtil.checkDataValidation(weatherDeviceStatus, new Date(), 'writedate');
      let validWeatherDevice = _.head(validWeatherDeviceStatus);
      invertersTotal.solarRadiation = _.get(validWeatherDevice, 'hasValidData') ? validWeatherDevice.data.solar : 0,
      invertersTotal.temp = _.get(validWeatherDevice, 'hasValidData') ? validWeatherDevice.data.temp : 0,
    
    
      // 소수점 처리
      _.forEach(invertersEarth, (data, key) => _.set(invertersEarth, key, _.round(data, 1)));
      _.forEach(invertersWater, (data, key) => _.set(invertersWater, key, _.round(data, 1)));
    
      // BU.CLIS(invertersWater, invertersEarth, invertersTotal);
      const STX = Buffer.from([0x02]);
      const ETX = Buffer.from([0x03]);

      const dataBodyList = [
        invertersWater.currKw, invertersWater.dailyPower, invertersWater.cumulativePower,
        invertersEarth.currKw, invertersEarth.dailyPower, invertersEarth.cumulativePower,
        invertersTotal.cumulativePower, invertersTotal.solarRadiation, invertersTotal.temp, invertersTotal.co2
      ];

      const strDataBodyList = [];
      dataBodyList.forEach((ele) => strDataBodyList.push(_.padStart(ele.toString(), 4, '0')));

      // BU.CLI(strDataBodyList);

      let bufDataBody = Buffer.from('');
      strDataBodyList.forEach(currentItem => {
        bufDataBody = Buffer.concat([bufDataBody, Buffer.from(currentItem)]);
      });

      bufDataBody = Buffer.concat([STX, bufDataBody, ETX]);


      // BU.CLI(bufDataBody);
      // 명령 생성
      const cmdInfo = this.generationAutoCommand(bufDataBody);
    
      // BU.CLIN(cmdInfo);

      // 현황판으로 메시지를 보냄
      this.executeCommand(cmdInfo);
    } catch (error) {
      BU.errorLog('statusBoard', '명령 전송 실패', error);
    }
  }


  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      nodeList: this.nodeList,
      // systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
      measureDate: new Date()
    };
  }

  /**
   * @override
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {dcEvent} dcEvent
   * @example 보통 장치 연결, 해제에서 발생
   * dcConnect --> 장치 연결,
   * dcDisconnect --> 장치 연결 해제
   */
  updatedDcEventOnDevice(dcEvent) {
    super.updatedDcEventOnDevice(dcEvent);

    switch (dcEvent.eventName) {
    case this.definedControlEvent.CONNECT:
      this.runCronSubmitPowerStatus();
      break;
    default:
      break;
    }

    // Error가 발생하면 추적 중인 데이타는 폐기
    this.converter.resetTrackingDataBuffer();
    // Observer가 해당 메소드를 가지고 있다면 전송
    _.forEach(this.observerList, observer => {
      if (_.get(observer, 'notifyDevicEvent')) {
        observer.notifyDevicEvent(this);
      }
    });
  }

  /**
   * @override
   * 장치에서 명령을 수행하는 과정에서 생기는 1:1 이벤트
   * @param {dcError} dcError 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcError(dcError) {
    super.onDcError(dcError);

    // Error가 발생하면 추적 중인 데이터는 폐기 (config.deviceInfo.protocol_info.protocolOptionInfo.hasTrackingData = true 일 경우 추적하기 때문에 Data를 계속 적재하는 것을 방지함)
    this.converter.resetTrackingDataBuffer();
    // Observer가 해당 메소드를 가지고 있다면 전송
    _.forEach(this.observerList, observer => {
      if (_.get(observer, 'notifyDeviceError')) {
        observer.notifyDeviceError(this, dcError);
      }
    });
  }

  /**
   * @override
   * 메시지 발생 핸들러
   * @param {dcMessage} dcMessage
   */
  onDcMessage(dcMessage) {
    super.onDcMessage(dcMessage);
    // Observer가 해당 메소드를 가지고 있다면 전송
    this.observerList.forEach(observer => {
      if (_.get(observer, 'notifyDeviceMessage')) {
        observer.notifyDeviceMessage(this);
      }
    });
  }

  /**
   * 장치로부터 데이터 수신
   * @override
   * @param {dcData} dcData 현재 장비에서 실행되고 있는 명령 객체
   */
  onDcData(dcData) {
    // BU.CLIN(dcData);
    super.onDcData(dcData);
  }
}
module.exports = Control;
