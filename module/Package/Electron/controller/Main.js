
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

// let PowerModel = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

let excelUtil = require('../models/excel.util');
const PowerModel = require('../models/PowerModel');

const config = require('../config/config');


const defaultRangeFormat = 'min';
class Main {
  constructor(dbInfo) {
    
    BU.CLI(config.dbInfo);
    this.powerModel = new PowerModel(config.dbInfo);
  }

  async getWeather() {
    BU.CLI('getMain');
    BU.CLIN(this.powerModel);
    let currWeatherCastList = await this.powerModel.getCurrWeatherCast();
    BU.CLI('getMain');
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    return webUtil.convertWeatherCast(currWeatherCastInfo);
  }

  /**
   * 
   * @param {Object} ipcRender 
   */
  async getMain(ipcRender){
    let weatherCastInfo = await this.getWeather();

    // console.time('0');
    let searchRange = this.powerModel.getSearchRange('day');
    // 검색 조건이 일 당으로 검색되기 때문에 금월 날짜로 date Format을 지정하기 위해 day --> month 로 변경
    searchRange.searchType = 'month';
    let inverterPowerByMonth = await this.powerModel.getInverterPower(searchRange);
    let monthPower = webUtil.calcValue(webUtil.reduceDataList(inverterPowerByMonth, 'interval_power'), 0.001, 1) ;
 
    // 오늘자 발전 현황을 구할 옵션 설정(strStartDate, strEndDate 를 오늘 날짜로 설정하기 위함)
    // 검색 조건이 시간당으로 검색되기 때문에 금일 날짜로 date Format을 지정하기 위해 hour --> day 로 변경
    let cumulativePowerList = await this.powerModel.getInverterCumulativePower();
    let cumulativePower = webUtil.calcValue(webUtil.reduceDataList(cumulativePowerList, 'max_c_wh'), 0.000001, 3) ;
    BU.CLI('getMain');
    // console.timeEnd('0');
    // console.time('0.5');
    // 금일 발전 현황 데이터
    // searchRange = this.powerModel.getSearchRange('min10');
    searchRange = this.powerModel.getSearchRange('min10', '2018-05-22');
 
    let inverterTrend = await this.powerModel.getInverterTrend(searchRange);
 
    // 하루 데이터(10분 구간)는 특별히 데이터를 정제함.
    if (searchRange.searchType === 'min' || searchRange.searchType === 'min10' || searchRange.searchType === 'hour') {
      let maxRequiredDateSecondValue = 0;
      switch (searchRange.searchType) {
      case 'min':
        maxRequiredDateSecondValue = 120;
        break;
      case 'min10':
        maxRequiredDateSecondValue = 1200;
        break;
      case 'hour':
        maxRequiredDateSecondValue = 7200;
        break;
      default:
        break;
      }
      let calcOption = {
        calcMaxKey: 'max_c_wh',
        calcMinKey: 'min_c_wh',
        resultKey: 'interval_power',
        groupKey: 'inverter_seq',
        rangeOption: {
          dateKey: 'group_date',
          maxRequiredDateSecondValue,
          minRequiredCountKey: 'total_count',
          minRequiredCountValue: 9
        }
      };
      webUtil.calcRangePower(inverterTrend, calcOption);
    }    
    BU.CLI('getMain');
    let dailyPower = _.round(webUtil.reduceDataList(inverterTrend, 'interval_power') * 0.001, 2) ;
     
    let chartOption = { selectKey: 'interval_power', dateKey: 'view_date', hasArea: true };
    let chartData = webUtil.makeDynamicChartData(inverterTrend, chartOption);
     
    // BU.CLI(chartData);
    // BU.CLI(inverterPowerList);
    webUtil.applyScaleChart(chartData, 'day');
    webUtil.mappingChartDataName(chartData, '인버터 시간별 발전량');
 
    // console.timeEnd('0.5');


 
 
    // let weatherDeviceStatus = await this.biModule.getWeather();
    // // 인버터 발전 현황 데이터 검증
    // let validWeatherDeviceStatus = webUtil.checkDataValidation(weatherDeviceStatus, new Date(), 'writedate');
    // let validWeatherDevice = _.head(validWeatherDeviceStatus);
    // console.timeEnd('1');
    // BU.CLI(validModuleStatusList);
    // console.time('2');
    let v_upsas_profile = await this.powerModel.getTable('v_upsas_profile');
    // console.timeEnd('2');
    // 금일 발전 현황
    // 인버터 현재 발전 현황
    let inverterDataList = await this.powerModel.getTable('v_inverter_status');
    // 인버터 발전 현황 데이터 검증
    let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

    /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedInverterStatus = webUtil.refineSelectedInverterStatus(validInverterDataList);
 
    // 설치 인버터 총 용량
    let pv_amount = _(v_upsas_profile).map('pv_amount').sum();
    let powerGenerationInfo = {
      currKw: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'out_w', false), 0.001, 3),
      currKwYaxisMax: _.round(_.multiply(pv_amount, 0.001)),
      dailyPower : dailyPower === '' ? 0 : dailyPower,
      monthPower,
      cumulativePower,
      co2: _.round(cumulativePower * 0.424, 3),
      hasOperationInverter: _.every(_.values(_.map(validInverterDataList, data => data.hasValidData))),
      hasAlarm: false // TODO 알람 정보 작업 필요
    };

    const returnValue = {
      weatherCastInfo,
      dailyPowerChartData: chartData,
      powerGenerationInfo: powerGenerationInfo,
      inverterStatus: refinedInverterStatus
    };

    ipcRender.sender.send('main-reply', returnValue);
  }

  /**
   * 
   * @param {Object} ipcRender 
   * @param {{device_type: string, device_list_type: string, device_seq: string, search_type: string, start_date: string, end_date: string}} trendOption 
   */
  async getTrend(ipcRender, trendOption){
    BU.CLI(trendOption);
    BU.logFile(trendOption);
    if(_.isString(trendOption)){
      trendOption = JSON.parse(trendOption);
    }
    let weatherCastInfo = await this.getWeather();

    // 장비 종류 여부 (전체, 인버터, 접속반)
    let deviceType = _.get(trendOption, 'device_type')  === 'inverter' || _.get(trendOption, 'device_type') === 'connector' ? _.get(trendOption, 'device_type') : _.get(trendOption, 'device_type') === undefined ? 'inverter' : 'all';
    // 장비 선택 타입 (전체, 인버터, 접속반)
    let deviceListType = _.get(trendOption, 'device_list_type') === 'inverter' || _.get(trendOption, 'device_list_type') === 'connector' ? _.get(trendOption, 'device_list_type') : 'all';
    // 장비 선택 seq (all, number)
    let deviceSeq = !isNaN(_.get(trendOption, 'device_seq')) && _.get(trendOption, 'device_seq') !== '' ? Number(_.get(trendOption, 'device_seq')) : 'all';
    // BU.CLIS(deviceType, deviceListType, deviceSeq);
    // Search 타입을 지정
    
    let searchType = _.get(trendOption, 'search_type') ? _.get(trendOption, 'search_type') : defaultRangeFormat;
    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = this.powerModel.getSearchRange(searchType, _.get(trendOption, 'start_date'), _.get(trendOption, 'end_date'));
    // BU.CLI(searchRange);
    // 검색 조건이 기간 검색이라면 검색 기간의 차를 구하여 실제 searchType을 구함.
    if (searchType === 'range') {
      let realSearchType = searchType === 'range' ? this.powerModel.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;
      if (realSearchType === 'hour') {
        searchRange = this.powerModel.getSearchRange(defaultRangeFormat, _.get(trendOption, 'start_date'), _.get(trendOption, 'end_date'));
      } else {
        searchRange.searchInterval = searchRange.searchType = realSearchType;
      }
    }

    // BU.CLI('@', searchRange);
    // 장비 선택 리스트 가져옴
    let deviceList = await this.powerModel.getDeviceList(deviceType);
    // BU.CLI(deviceList);

    let device_type_list = [
      { type: 'all', name: '전체' },
      { type: 'inverter', name: '인버터' },
      { type: 'connector', name: '접속반' }
    ];

    // 차트 제어 및 자질 구래한 데이터 모음
    let searchOption = {
      device_type: deviceType,
      device_type_list: device_type_list,
      device_list_type: deviceListType,
      device_seq: deviceSeq,
      device_list: deviceList,
      search_range: searchRange,
      search_type: searchType
    };
    // BU.CLI(searchOption);

    /** searchRange를 기준으로 검색 Column Date를 정함  */
    let betweenDatePoint = BU.getBetweenDatePoint(searchRange.strBetweenEnd, searchRange.strBetweenStart, searchRange.searchInterval);
    // 인버터 차트
    let {inverterPowerChartData, inverterTrend, viewInverterPacketList} = await this.powerModel.getInverterChart(searchOption, searchRange, betweenDatePoint);
    // 차트 Range 지정
    let powerChartData = { range: betweenDatePoint.shortTxtPoint, series: [] };
    // 차트 합침
    powerChartData.series = inverterPowerChartData.series;

    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartDecoration = webUtil.makeChartDecoration(searchRange);
    let weatherCastRowDataPacketList =  await this.powerModel.getWeatherCastAverage(searchRange);
    // BU.CLI(viewInverterPacketList);
    let createExcelOption = {
      viewInverterPacketList,
      inverterTrend,
      powerChartData, 
      powerChartDecoration: chartDecoration, 
      weatherCastRowDataPacketList,
      searchRange
    };

    let workSheetInfo = excelUtil.makeChartDataToExcelWorkSheet(createExcelOption);
    let excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);
    // let excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);

    // powerChartData.series = _.concat(powerChartData.series, _.pullAt(weatherChartData.series, 0));
    

    // // TEST Water Level Add Chart Code Start *****************
    // let chartOption = {
    //   selectKey: 'water_level',
    //   dateKey: 'group_date',
    //   groupKey: 'target_name',
    //   colorKey: 'chart_color',
    //   sortKey: 'chart_sort_rank'
    // };

    // webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'chart_color', 'inverter_seq');
    // webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'chart_sort_rank', 'inverter_seq');
    // webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'target_name', 'inverter_seq');
    // let testWeatherInfoPacketList = [];
    // if(['min', 'min10', 'hour'].includes(searchRange.searchType)){
    //   betweenDatePoint.fullTxtPoint.forEach(date => {
    //     waterLevelDataPacketList.forEach(currentItem => {
    //       let addObj = {
    //         target_name: currentItem.target_name,
    //         water_level: currentItem.water_level,
    //         chart_color: currentItem.chart_color,
    //         chart_sort_rank: currentItem.chart_sort_rank,
    //         group_date: date,
    //       };
    //       testWeatherInfoPacketList.push(addObj);
    //     });
    //   });
    // } else {
    //   testWeatherInfoPacketList = waterLevelDataPacketList;
    // }
    // let testWeatherInfoChart = webUtil.makeStaticChartData(testWeatherInfoPacketList, betweenDatePoint, chartOption);

    // testWeatherInfoChart.series = _.concat(testWeatherInfoChart.series, weatherChartData.series);

    let returnValue = {
      searchOption,
      powerChartData,
      chartDecorator: chartDecoration,
      workBook: excelContents
    };
    BU.CLI('@', returnValue.searchOption);
    // BU.CLIN(searchOption);
    ipcRender.sender.send('trend-replay', returnValue);
  }

}
module.exports = Main;