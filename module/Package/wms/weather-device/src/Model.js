'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const Control = require('./Control');

const refinedDeviceDataConfig = require('../config/refinedDeviceDataConfig');

const DeviceDataStorage = require('./DeviceDataStorage');

const bmjh = require('base-model-jh');

class Model extends DeviceDataStorage {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    super(refinedDeviceDataConfig);
    this.controller = controller;
    this.dataStroageConfig = this.controller.config.controllerInfo;
    this.deviceCategory = this.dataStroageConfig.target_category;

    this.systemErrorList = [];
    this.troubleList = [];

    this.BM = new bmjh.BM(this.controller.config.dbInfo);

    this.init();
  }

  init() {
    // super.hasSaveToDB = true;
    this.setDevice(this.dataStroageConfig, {
      idKey: 'target_id',
      deviceCategoryKey: 'target_category'
    });
  }


  /**
   * 하부 기상 관측 장비 데이터 처리
   * @param {Date} measureDate 
   */
  async getWeatherDeviceData(measureDate) {
    BU.CLI('getWeatherDeviceData');
    let smInfraredData = this.controller.smInfrared.getDeviceOperationInfo();
    // BU.CLI(smInfraredData);
    let vantagepro2Data = this.controller.vantagepro2.getDeviceOperationInfo();

    // BU.CLI(smInfraredData);
    this.systemErrorList = smInfraredData.systemErrorList.concat(vantagepro2Data.systemErrorList);
    this.troubleList = smInfraredData.troubleList.concat(vantagepro2Data.troubleList);


    // SM 적외선 데이터와 VantagePro2 객체 데이터를 합침
    this.deviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // 데이터에 null이 포함되어있다면 아직 준비가 안된것으로 판단
    // if (_.contains(this.deviceData, null)) {
    //   BU.logFile('장치의 데이터 수집이 준비가 안되었습니다.');
    //   return false;
    // }

    let returnValue = this.onDeviceOperationInfo(this.controller.getDeviceOperationInfo(), this.deviceCategory);
    
    // BU.CLIN(returnValue, 3);


    // DB에 입력
    const convertDataList = await this.refineTheDataToSaveDB(this.deviceCategory, measureDate);
    // BU.CLI(convertDataList);

    const resultSaveToDB = await this.saveDataToDB(this.deviceCategory);
    // BU.CLI(resultSaveToDB);
  }
}

module.exports = Model;