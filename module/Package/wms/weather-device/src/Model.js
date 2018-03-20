'use strict';

const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const Control = require('./Control');

const keybinding = require('../config/keybinding');

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

    this.deviceDataStorage = new DeviceDataStorage(keybinding.binding);

    this.deviceDataStorage.setDevice(this.dataStroageConfig, {id: 'target_id', deviceCategory: 'target_category',  dbDataTableName: 'data_table_name' });
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
    if(smInfraredData.systemErrorList !== undefined &&  smInfraredData.systemErrorList.length){
      BU.logFile('SM 기상관측 장비에 시스템 에러가 존재하여 저장할 수 없습니다.');
      return false;
    } else if(vantagepro2Data.systemErrorList !== undefined && vantagepro2Data.systemErrorList.length){
      BU.logFile('VantagePro2 기상관측 장비에 시스템 에러가 존재하여 저장할 수 없습니다.');
      return false;
    }


    this.deviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // let weatherDeviceData = Object.assign(smInfraredData.data, vantagepro2Data.data);

    // BU.CLI(weatherDeviceData);

    // 데이터에 null이 포함되어있다면 아직 준비가 안된것으로 판단
    if(_.contains(this.deviceData, null)){
      BU.logFile('장치의 데이터 수집이 준비가 안되었습니다.');
      return false;
    }

    let returnValue =  this.deviceDataStorage.onMeasureDeviceList(new Date(), this.controller.getDeviceStatus(), this.deviceCategory);

    BU.CLIN(returnValue, 3);


    // const convertDataList = this.deviceDataStorage.processMeasureData(this.deviceCategory);
    // BU.CLI(convertDataList);
    // const convertDataList = this.processDeviceDataList(weatherDeviceData, null, this.deviceType);


    
    
    // BU.CLI(convertDataList);
  }


  /**
   * 장치 데이터 리스트 keyBinding 처리하여 반환
   * @param {Object|Array} deviceData 
   * @param {Object} deviceSavedInfo 
   * @param {string} deviceCategory 장치 타입 (inverter, connector)
   */
  processDeviceDataList(deviceData, deviceSavedInfo, deviceCategory) {
    // BU.CLI('processDeviceDataList', deviceData);
    // 배열 일 경우에는 재귀
    if (_.isArray(deviceData)) {
      let convertDataList = [];

      deviceData.forEach(data => {
        let result = this.processDeviceDataList(data, deviceSavedInfo, deviceCategory);
        convertDataList = convertDataList.concat(result);
      });
      return convertDataList;
    } else if (_.isObject(deviceData)) {
      let bindingObj = _.findWhere(keybinding.binding, {
        deviceCategory
      });


      if(_.isEmpty(bindingObj)){
        throw new Error('binding 객체가 없습니다.');
      }

      let convertData = {};
      const addParamList = bindingObj.addParamList;
      const matchingList = bindingObj.matchingList;

      // BU.CLI(matchingList);
      // 계산식 반영
      matchingList.forEach(matchingObj => {
        convertData[matchingObj.updateKey] = this.calculateMatchingData(deviceData, matchingObj);
      });

      addParamList.forEach(addParam => {
        convertData[addParam.updateKey] = deviceSavedInfo[addParam.baseKey];
      });

      return [convertData];
    }
  }

  /**
   * 
   * @param {Object} deviceData 장치 데이터
   * @param {{baseKey: string, updateKey: string, calculate: string|number, toFixed: number}} matchingBindingObj 
   * @return {number} 계산 결과
   */
  calculateMatchingData(deviceData, matchingBindingObj) {
    // BU.CLI('calculateMatchingData');
    // BU.CLI('calculateMatchingData', matchingBindingObj, deviceData);
    let resultCalculate = 0;
    try {
      let baseKey = matchingBindingObj.baseKey;
      let calculate = matchingBindingObj.calculate;
      let toFixed = matchingBindingObj.toFixed;
      var reg = /[a-zA-Z]/;
      // 계산식이 숫자일 경우는 eval 하지 않음
      if (_.isNumber(calculate)) {
        let data = deviceData[baseKey];
        data = typeof data === 'string' ? Number(data) : data;
        // 숫자가 아니거나 null일 경우 throw 반환
        if (_.isNumber(data)) {
          resultCalculate = Number((deviceData[baseKey] * calculate).toFixed(toFixed));
          // BU.CLI('resultCalculate', resultCalculate);
        } else {
          throw Error(`해당 데이터는 숫자가 아님: ${deviceData[baseKey]}`);
        }
      } else if(typeof calculate === 'string') { // 계산식이 문자일 경우 eval 계산식 생성
        let finalMsg = '';
        let tempBuffer = '';
        for (let i = 0; i < calculate.length; i += 1) {
          let thisChar = calculate.charAt(i);
          if (reg.test(thisChar)) {
            tempBuffer += thisChar;
          } else {
            if (tempBuffer !== '') {
              finalMsg += `deviceData['${tempBuffer}']`;
              tempBuffer = '';
            }
            finalMsg += thisChar;
          }
          if (calculate.length === i + 1 && tempBuffer !== '') {
            finalMsg += `deviceData['${tempBuffer}']`;
          }
        }
        resultCalculate = Number(Number(eval(finalMsg)).toFixed(toFixed));
        resultCalculate = isNaN(resultCalculate) ? 0 : resultCalculate;
      } else {
        // BU.CLI('deviceData[baseKey]', deviceData[baseKey]);
        resultCalculate = deviceData[baseKey];
      }
    } catch (error) {
      throw error;
    }

    return resultCalculate;
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