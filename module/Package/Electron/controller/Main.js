
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

// let PowerModel = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

let excelUtil = require('../models/excel.util');
const PowerModel = require('../models/PowerModel');

const config = require('../config/config');


const defaultRangeFormat = 'min10';
class Main {
  constructor() {
    
    // BU.CLI(config.dbInfo);
    this.powerModel = new PowerModel(config.dbInfo);
  }

  /**
   * 
   * @param {Object} ipcRender 
   * @param {{device_seq: string, search_type: string, start_date: string, end_date: string}} trendOption 
   */
  async getMain(ipcRender, trendOption){
    // BU.CLI('getMain', trendOption);
    if(_.isString(trendOption)){
      trendOption = JSON.parse(trendOption);
    }
    let searchType = _.get(trendOption, 'search_type') ? _.get(trendOption, 'search_type') : defaultRangeFormat;
    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = this.powerModel.getSearchRange(searchType, _.get(trendOption, 'start_date'), _.get(trendOption, 'end_date'));
    
    const {chartData, chartDecoration} = await this.getPowerChart(trendOption);
    
    // 금일 발전 현황
    // 인버터 현재 발전 현황
    let inverterDataList = await this.powerModel.getTable('v_inverter_status');
    // 인버터 발전 현황 데이터 검증
    let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

    /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedInverterStatus = webUtil.refineSelectedInverterStatus(validInverterDataList);

    // BU.CLI(refinedInverterStatus);
    webUtil.convertOperationMode(refinedInverterStatus.dataList);
    webUtil.convertOperationStatus(refinedInverterStatus.dataList);

    let smallInverter = _.find(refinedInverterStatus.dataList, {amount: 0.6});
    let largeInverter = _.find(refinedInverterStatus.dataList, {amount: 3.3});


 
    // 장비 선택 리스트 가져옴
    let deviceList = await this.powerModel.getDeviceList();

    // 차트 제어 및 자질 구래한 데이터 모음
    let searchOption = {
      search_range: searchRange,
      search_type: searchType,
      device_list: deviceList,
    };

    const returnValue = {
      deviceList,
      searchOption,
      chartData,
      chartDecoration,
      // powerGenerationInfo: powerGenerationInfo,
      smallInverter,
      largeInverter,
    };

    ipcRender.sender.send('main-reply', returnValue);
  }

  /**
   * 출력 차트를 그림
   * @param {{device_seq: string, search_type: string, start_date: string, end_date: string}} trendOption 
   * @return {{chartData: chartData, chartDecoration: chartDecoration}}
   */
  async getPowerChart(trendOption) {
    if(_.isString(trendOption)){
      trendOption = JSON.parse(trendOption);
    }

    let deviceSeq = _.get(trendOption, 'device_seq') ? _.get(trendOption, 'device_seq') : 'all';
    let searchType = _.get(trendOption, 'search_type') ? _.get(trendOption, 'search_type') : defaultRangeFormat;
    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = this.powerModel.getSearchRange(searchType, _.get(trendOption, 'start_date'), _.get(trendOption, 'end_date'));
    // const searchRange = this.powerModel.getSearchRange('min10');
    let inverterPowerList = await this.powerModel.getInverterPower(searchRange, deviceSeq);
    
    // BU.CLI(inverterPowerList);
    let chartOption = {selectKey: 'out_kw', dateKey: 'view_date', groupKey: 'ivt_target_id', colorKey: 'chart_color', sortKey: 'chart_sort_rank' };

    let chartData = webUtil.makeDynamicChartData(inverterPowerList, chartOption);

    chartData.series.forEach((info) => {
      if(info.name === 'PCS_001'){
        info.yAxis = 1;
      } else {
        info.yAxis = 0;
      }
    });
    let inverterDataList = await this.powerModel.getTable('v_inverter_status');
    webUtil.mappingChartDataName(chartData, inverterDataList, 'target_id', 'target_name');
    // BU.CLI(chartData);
    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartDecoration = webUtil.makeChartDecoration(searchRange);

    return {
      chartData,
      chartDecoration,
      searchRange
    };
  }

  /**
   * 
   * @param {Object} ipcRender 
   * @param {{device_type: string, device_list_type: string, device_seq: string, search_type: string, start_date: string, end_date: string}} trendOption 
   */
  async getTrend(ipcRender, trendOption){
    // BU.CLI(trendOption);
    // BU.logFile(trendOption);
    if(_.isString(trendOption)){
      trendOption = JSON.parse(trendOption);
    }
    // let weatherCastInfo = await this.getWeather();

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
    // TEST
    // let searchRange = this.powerModel.getSearchRange('min10', '2018-05-22');
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

    // BU.logFile(searchRange);

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
    // BU.CLI('@', excelContents);
    // BU.CLIN(searchOption);
    ipcRender.sender.send('trend-replay', returnValue);
  }

  /**
   * 
   * @param {*} ipcRender 
   * @param {{search_type: string, start_date: string, device_seq: string}} excelOption 
   */
  async makeExcel(ipcRender, excelOption){
    // BU.CLI('makeExcel', excelOption);
    if(_.isString(excelOption)){
      excelOption = JSON.parse(excelOption);
    }

    let searchRange = this.powerModel.getSearchRange(excelOption.search_type, excelOption.start_date);
    // 1분단위로 출력
    searchRange.searchInterval = 'min';

    let excelWorkBook = await this.powerModel.makeExcelSheet(searchRange, _.get(excelOption, 'device_seq'));

    ipcRender.sender.send('download-excel', excelWorkBook);
  }

}
module.exports = Main;



// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  let main = new Main();

  main.getMain();

}