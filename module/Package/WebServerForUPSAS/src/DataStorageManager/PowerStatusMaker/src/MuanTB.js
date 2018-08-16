const _ = require('lodash');
const {BU} = require('base-util-jh');

const Control = require('./Control');

class MuanTB {
  /** @param {Control} controller */
  constructor(controller) {
    this.webUtil = controller.webUtil;
    this.biModule = controller.biModule;
  }

  /**
   */
  init() {}

  /**
   * 현황판
   * @param {msInfo} msInfo
   */
  async calcPowerStatus(msInfo) {
    try {
      // 수중 6kW급 발전 현황
      const invertersWater = {
        currKw: 0,
        dailyPower: 0,
        cumulativePower: 0,
      };

      // 지상 3kW급 발전 현황
      const invertersEarth = {
        currKw: 0,
        dailyPower: 0,
        cumulativePower: 0,
      };
      // 전체 발전 현황
      const invertersTotal = {
        cumulativePower: 0,
        solarRadiation: 0,
        temp: 0,
        co2: 0,
      };
      // let searchRange = this.biModule.getSearchRange('min10');

      const EARTH = '육상';

      const vInverterDataList = await this.biModule.getTable('v_inverter_status');

      const groupingInverterDataList = _.groupBy(vInverterDataList, 'install_place');
      // BU.CLI(groupingInverterDataList);

      // 육상, 수중, 총합 누적 발전량 산출
      _.forEach(groupingInverterDataList, (inverterDataList, groupName) => {
        const validInverterDataList = this.webUtil.checkDataValidation(
          inverterDataList,
          new Date(),
          'writedate',
        );

        const currKwList = [];
        // 유효한 데이터 일 경우에만 배열에 저장
        validInverterDataList.forEach(currentItem => {
          if (currentItem.hasValidData) {
            currKwList.push(currentItem.data.out_w);
          }
        });

        const cumulativePower = _.divide(
          _(inverterDataList)
            .map('c_wh')
            .sum(),
          1000000,
        );
        const dailyPower = _.divide(
          _(inverterDataList)
            .map('daily_power_wh')
            .sum(),
          1000,
        );
        const currKw = _.divide(_.sum(currKwList), 1000);
        if (groupName === EARTH) {
          invertersEarth.cumulativePower = cumulativePower;
          invertersEarth.dailyPower = dailyPower;
          invertersEarth.currKw = currKw;
        } else {
          invertersWater.cumulativePower = cumulativePower;
          invertersWater.dailyPower = dailyPower;
          invertersWater.currKw = currKw;
        }
      });

      invertersTotal.cumulativePower = _.round(
        _.sum([invertersEarth.cumulativePower, invertersWater.cumulativePower]) * 10,
      );
      invertersTotal.co2 = _.round(invertersTotal.cumulativePower * 0.424 * 10);

      const weatherDeviceStatus = await this.biModule.getWeather();
      // 인버터 발전 현황 데이터 검증
      const validWeatherDeviceStatus = this.webUtil.checkDataValidation(
        weatherDeviceStatus,
        new Date(),
        'writedate',
      );
      const validWeatherDevice = _.head(validWeatherDeviceStatus);
      invertersTotal.solarRadiation = _.get(validWeatherDevice, 'hasValidData')
        ? validWeatherDevice.data.solar
        : 0;
      invertersTotal.temp = _.get(validWeatherDevice, 'hasValidData')
        ? _.round(validWeatherDevice.data.temp * 10)
        : 0;
      // 소수점 처리
      _.forEach(invertersEarth, (data, key) => _.set(invertersEarth, key, _.round(data * 10)));
      _.forEach(invertersWater, (data, key) => _.set(invertersWater, key, _.round(data * 10)));

      BU.CLIS(invertersWater, invertersEarth, invertersTotal);
      const dataBodyList = [
        invertersWater.currKw,
        invertersWater.dailyPower,
        invertersWater.cumulativePower,
        invertersEarth.currKw,
        invertersEarth.dailyPower,
        invertersEarth.cumulativePower,
        invertersTotal.cumulativePower,
        invertersTotal.solarRadiation,
        invertersTotal.temp,
        invertersTotal.co2,
      ];

      const strDataBodyList = [];
      dataBodyList.forEach(ele => strDataBodyList.push(_.padStart(ele.toString(), 4, '0')));

      // BU.CLI(strDataBodyList);

      let bufDataBody = Buffer.from('');
      strDataBodyList.forEach(currentItem => {
        bufDataBody = Buffer.concat([bufDataBody, Buffer.from(currentItem)]);
      });

      // TEST
      // bufDataBody = Buffer.from([
      //   0x30,0x38,0x38,0x38,
      //   0x30,0x38,0x38,0x38,
      //   0x30,0x38,0x38,0x38,
      //   0x30,0x38,0x38,0x38,
      //   0x32,0x38,0x38,0x38,
      //   0x38,0x38,0x38,0x38,
      //   0x38,0x38,0x38,0x38,
      //   0x38,0x38,0x38,0x38,
      //   0x38,0x38,0x38,0x38,
      //   0x38,0x38,0x38,0x38,
      // ])
      // for (let index = 0; index < 10; index++) {

      //   // bufDataBody = Buffer.concat([bufDataBody, Buffer.from([0x38,0x38,0x38,0x38])]);
      //   if(index === 7){
      //     bufDataBody = Buffer.concat([bufDataBody, Buffer.from([0x30,0x38,0x38,0x38])]);
      //   } else {
      //     bufDataBody = Buffer.concat([bufDataBody, Buffer.from([0x38,0x38,0x38,0x38])]);
      //   }
      // }

      BU.CLI(bufDataBody);
      // msInfo에 직접적으로 데이터를 넣음
      _.set(msInfo, 'msDataInfo.statusBoard', bufDataBody);
      return bufDataBody;
    } catch (error) {
      _.set(msInfo, 'msDataInfo.statusBoard', null);
      throw error;
    }
  }
}
module.exports = MuanTB;