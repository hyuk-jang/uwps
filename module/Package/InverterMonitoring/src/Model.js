'use strict';

const _ = require('lodash');

const {BU} = require('base-util-jh');
const Control = require('./Control');

const refinedDeviceDataConfig = require('../config/refinedDeviceDataConfig');

const AbstDeviceClientModel = require('../../../module/device-client-model-jh');
 
const Inverter = require('../Inverter');

class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.deviceClientModel = new AbstDeviceClientModel(refinedDeviceDataConfig);


    this.controller = controller;

    this.systemErrorList = [];
    this.troubleList = [];

    this.init();
  }

  init() {
    // super.hasSaveToDB = true;

    this.controller.config.inverterList.forEach(inverterInfo => {
      this.deviceClientModel.setDevice(inverterInfo.current.deviceInfo, {idKey: 'target_id', deviceCategoryKey: 'target_category'});
    });

    this.deviceClientModel.setDbConnector(this.controller.config.dbInfo);
  }


  /**
   * @param {Inverter} inverter 
   */
  onInverterData(inverter){
    // 인버터 컨트롤러의 동작 상태 정보를 가져옴
    let deviceOperationInfo = inverter.getDeviceOperationInfo();
    // 모델에 데이터 갱신
    this.deviceClientModel.onDeviceOperationInfo(deviceOperationInfo, 'inverter');
  }


  /**
   * DB에 집어 넣을 수 있도록 데이터를 정제함. 
   * 장치 데이터는 InsertDataList에 기입
   * 에러 데이터는 DB에 저장되어 있는 현재 에러와 비교 후 InsertTroubleList, UpdateTroubleList로 각각 계산 후 기입
   * 정제 테이블을 기초로 계산하며 DB 업데이트가 완료되면 Storage의 데이터는 초기화 됨.
   * @param {Date} measureDate Update 가 된 시각
   * @param {string} category Update 처리 할 카테고리
   */
  async updateDeviceCategory(measureDate, category) {
    // Storage에 저장되어 있는 데이터(장치 데이터,)
    const convertDataList = await this.deviceClientModel.refineTheDataToSaveDB(category, measureDate);
    BU.CLIN(convertDataList);

    // const resultSaveToDB = await this.deviceClientModel.saveDataToDB(category);
    // BU.CLIN(resultSaveToDB);

    return true;
  }


  /**
   * 하부 기상 관측 장비 데이터 처리
   * @param {Date} measureDate 
   */
  async getWeatherDeviceData(measureDate) {
    BU.CLI('getWeatherDeviceData');
    
    let smInfraredData = this.controller.smInfrared.getDeviceOperationInfo();
    let vantagepro2Data = this.controller.vantagepro2.getDeviceOperationInfo();

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

    let returnValue = this.deviceClientModel.onDeviceOperationInfo(this.controller.getDeviceOperationInfo(), this.deviceCategory);
    
    // BU.CLIN(returnValue, 3);

    // DB에 입력
    const convertDataList = await this.deviceClientModel.refineTheDataToSaveDB(this.deviceCategory, measureDate);
    // BU.CLI(convertDataList);

    const resultSaveToDB = await this.deviceClientModel.saveDataToDB(this.deviceCategory);
    BU.CLI(resultSaveToDB);
  }
}

module.exports = Model;