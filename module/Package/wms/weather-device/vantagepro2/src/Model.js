const _ = require('lodash');

// const {BU, CU} = require('../../../../../module/base-util-jh');
const { BU, CU } = require('base-util-jh');

const Control = require('./Control');

const { BaseModel } = require('../../../../../../../module/device-protocol-converter-jh');

const { BASE_MODEL } = BaseModel.Weathercast;

class Model {
  /**
   * @param {Control} controller
   */
  constructor(controller) {
    this.controller = controller;

    this.deviceData = BASE_MODEL;

    this.tempDeviceData = BASE_MODEL;

    const averConfig = {
      maxStorageNumber: 30, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
    this.averageStorage.hasCenterAverage = true;
  }

  /**
   * 저장소를 깨끗이 비우고 현재 값을 초기화 시킴
   */
  init() {
    this.averageStorage.init();
    this.deviceData = BASE_MODEL;
  }

  /**
   * @param {BASE_MODEL} weathercastData
   */
  onData(weathercastData) {
    // BU.CLI(weathercastData);
    BU.CLI(
      'SolarRadiation',
      this.averageStorage.dataStorage[BaseModel.Weathercast.BASE_KEY.SolarRadiation],
    );
    weathercastData = this.averageStorage.onData(weathercastData);

    this.deviceData = weathercastData;
  }
}

module.exports = Model;
