'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const Control = require('./Control');

const refinedDeviceDataConfig = require('../config/refinedDeviceDataConfig');

const DeviceDataStorage = require('./DeviceDataStorage');

class Model {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.controller = controller;
    this.dataStroageConfig = this.controller.config.controllerInfo;
    this.deviceCategory = this.dataStroageConfig.target_category;

    this.deviceDataStorage = new DeviceDataStorage(refinedDeviceDataConfig);

    this.deviceDataStorage.setDevice(this.dataStroageConfig, {id: 'target_id', deviceCategory: 'target_category'});


    this.systemErrorList = [];
    this.troubleList = [];
  }




  /**
   * 하부 기상 관측 장비 데이터 처리
   * @param {Date} measureTime 
   */
  getWeatherDeviceData(measureTime){
    BU.CLI('getWeatherDeviceData');
    let smInfraredData = this.controller.smInfrared.getDeviceStatus();
    let vantagepro2Data = this.controller.vantagepro2.getDeviceStatus();

    // 기상관측 장치에 문제가 있다면 저장하지 않음.
    // if(smInfraredData.systemErrorList !== undefined &&  smInfraredData.systemErrorList.length){
    //   BU.logFile('SM 기상관측 장비에 시스템 에러가 존재하여 저장할 수 없습니다.');
    //   return false;
    // } else if(vantagepro2Data.systemErrorList !== undefined && vantagepro2Data.systemErrorList.length){
    //   BU.logFile('VantagePro2 기상관측 장비에 시스템 에러가 존재하여 저장할 수 없습니다.');
    //   return false;
    // }
    BU.CLI(smInfraredData);
    this.systemErrorList = smInfraredData.systemErrorList.concat(vantagepro2Data.systemErrorList);
    this.troubleList = smInfraredData.troubleList.concat(vantagepro2Data.troubleList);


    // SM 적외선 데이터와 VantagePro2 객체 데이터를 합침
    this.deviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);
    // let weatherDeviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // BU.CLI(weatherDeviceData);

    // 데이터에 null이 포함되어있다면 아직 준비가 안된것으로 판단
    if(_.contains(this.deviceData, null)){
      BU.logFile('장치의 데이터 수집이 준비가 안되었습니다.');
      return false;
    }

    let returnValue =  this.deviceDataStorage.onMeasureDevice(new Date(), this.controller.getDeviceStatus(), this.deviceCategory);

    BU.CLIN(returnValue, 3);


    const convertDataList = this.deviceDataStorage.processMeasureData(this.deviceCategory);
    BU.CLI(convertDataList);
    // const convertDataList = this.processDeviceDataList(weatherDeviceData, null, this.deviceType);


    
    
    // BU.CLI(convertDataList);
  }




  /**
   * 
   * @param {*} measureTime 
   * @param {thiscontroller} smInfraredData 
   * @param {*} vantagepro2Data 
   */
  onData(measureTime, smInfraredData, vantagepro2Data){


  }

}

module.exports = Model;