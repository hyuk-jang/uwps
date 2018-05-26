'use strict';

const _ = require('lodash');

const {BU} = require('base-util-jh');
const Control = require('./Control');

const refinedDeviceDataConfig = require('../config/refinedDeviceDataConfig');

const AbstDeviceClientModel = require('device-client-model-jh');

class Model extends AbstDeviceClientModel {
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

    this.init();
  }

  init() {
    // super.hasSaveToDB = true;
    this.setDevice( this.dataStroageConfig, {
      idKey: 'target_id',
      deviceCategoryKey: 'target_category'
    });

    this.setDbConnector(this.controller.config.dbInfo);
  }


  /**
   * 하부 기상 관측 장비 데이터 처리
   * @param {Date} measureDate 
   */
  async getWeatherDeviceData(measureDate) {
    BU.CLI('getWeatherDeviceData');
    
    let smInfraredData = this.controller.smInfrared.getDeviceOperationInfo();
    let vantagepro2Data = this.controller.vantagepro2.getDeviceOperationInfo();

    // 데이터를 추출한 후 평균 값 리스트 초기화
    this.controller.vantagepro2.model.averageStorage.init();

    this.systemErrorList = _.unionBy(smInfraredData.systemErrorList, vantagepro2Data.systemErrorList, 'code');
    this.troubleList = _.unionBy(smInfraredData.troubleList, vantagepro2Data.troubleList, 'code');

    // SM 적외선 데이터와 VantagePro2 객체 데이터를 합침
    this.deviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // BU.CLI(vantagepro2Data.data);
    /* 데이터에 null이 포함되어있다면 아직 준비가 안된것으로 판단 */
    if (_.includes(vantagepro2Data.data, null)) {
      BU.log('장치의 데이터 수집이 준비가 안되었습니다.');
      // BU.logFile('장치의 데이터 수집이 준비가 안되었습니다.');
      return false;
    }

    let returnValue = this.onDeviceOperationInfo(this.controller.getDeviceOperationInfo(), this.deviceCategory);
    
    // BU.CLIN(returnValue, 3);

    // DB에 입력
    const convertDataList = await this.refineTheDataToSaveDB(this.deviceCategory, measureDate);
    // BU.CLI(convertDataList);

    const resultSaveToDB = await this.saveDataToDB(this.deviceCategory);
    BU.CLI(resultSaveToDB);
  }
}

module.exports = Model;