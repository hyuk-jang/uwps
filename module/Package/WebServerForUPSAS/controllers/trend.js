const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

// const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');
let excelUtil = require('../models/excel.util');
const PowerModel = require('../models/PowerModel');

/**
   * searchRange Type
   * @typedef {Object} searchRange
   * @property {string} searchType day, month, year, range
   * @property {string} strStartDate sql writedate range 사용
   * @property {string} strEndDate sql writedate range 사용
   * @property {string} rangeStart Chart 위에 표시될 시작 날짜
   * @property {string} rangeEnd Chart 위에 표시될 종료 날짜
   * @property {string} strStartDateInputValue input[type=text] 에 표시될 시작 날짜
   * @property {string} strEndDateInputValue input[type=text] 에 표시될 종료 날짜
   * @property {string} strBetweenStart static chart 범위를 표현하기 위한 시작 날짜
   * @property {string} strBetweenEnd static chart 범위를 표현하기 위한 종료 날짜
   */

/**
 * @typedef {{range: [], series: Array.<{name: string, data: []}>}} chartData 차트 그리기 위한 데이터 형태
 */

/**
 * 인버터 현황 정보
 * @typedef {Object} viewInverterDataPacket
 * @property {number} inverter_seq 
 * @property {string} target_id 
 * @property {string} target_type 
 * @property {string} target_category 
 * @property {string} chart_sort_rank 
 * @property {string} chart_sort_rank 
 */ 

const defaultRangeFormat = 'min10';
module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const powerModel = new PowerModel(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 5);
    let currWeatherCastList = await powerModel.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async (req, res) => {
    // 장비 종류 여부 (전체, 인버터, 접속반)
    let deviceType = req.query.device_type === 'inverter' || req.query.device_type === 'connector' ? req.query.device_type : req.query.device_type === undefined ? 'inverter' : 'all';
    // 장비 선택 타입 (전체, 인버터, 접속반)
    let deviceListType = req.query.device_list_type === 'inverter' || req.query.device_list_type === 'connector' ? req.query.device_list_type : 'all';
    // 장비 선택 seq (all, number)
    let deviceSeq = !isNaN(req.query.device_seq) && req.query.device_seq !== '' ? Number(req.query.device_seq) : 'all';
    // BU.CLIS(deviceType, deviceListType, deviceSeq);
    // Search 타입을 지정
    let searchType = req.query.search_type ? req.query.search_type : defaultRangeFormat;
    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = powerModel.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    // BU.CLI(searchRange);
    // 검색 조건이 기간 검색이라면 검색 기간의 차를 구하여 실제 searchType을 구함.
    if (searchType === 'range') {
      let realSearchType = searchType === 'range' ? powerModel.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;
      if (realSearchType === 'hour') {
        searchRange = powerModel.getSearchRange(defaultRangeFormat, req.query.start_date, req.query.end_date);
      } else {
        searchRange.searchInterval = searchRange.searchType = realSearchType;
      }
    }
    // BU.CLIS(req.query, searchRange);

    

    // 장비 선택 리스트 가져옴
    let deviceList = await powerModel.getDeviceList(deviceType);
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
    let {inverterPowerChartData, inverterTrend, viewInverterPacketList} = await powerModel.getInverterChart(searchOption, searchRange, betweenDatePoint);
    // 차트 Range 지정
    let powerChartData = { range: betweenDatePoint.shortTxtPoint, series: [] };
    // 차트 합침
    powerChartData.series = inverterPowerChartData.series;

    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartDecoration = webUtil.makeChartDecoration(searchRange);

    let {weatherChartData, weatherTrend, weatherChartOptionList} = await powerModel.getWeatherChart(searchRange, betweenDatePoint);
    let weatherCastRowDataPacketList =  await powerModel.getWeatherCastAverage(searchRange);
    let waterLevelDataPacketList = await powerModel.getWaterLevel(searchRange);

    // BU.CLI(viewInverterPacketList);
    let createExcelOption = {
      viewInverterPacketList,
      inverterTrend,
      powerChartData, 
      powerChartDecoration: chartDecoration, 
      waterLevelDataPacketList,
      weatherCastRowDataPacketList,
      weatherTrend, 
      weatherChartOptionList,
      searchRange
    };

    let workSheetInfo = excelUtil.makeChartDataToExcelWorkSheet(createExcelOption);
    let excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);
    // let excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);



    powerChartData.series = _.concat(powerChartData.series, _.pullAt(weatherChartData.series, 0));
    

    // TEST Water Level Add Chart Code Start *****************
    let chartOption = {
      selectKey: 'water_level',
      dateKey: 'group_date',
      groupKey: 'target_name',
      colorKey: 'chart_color',
      sortKey: 'chart_sort_rank'
    };

    webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'chart_color', 'inverter_seq');
    webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'chart_sort_rank', 'inverter_seq');
    webUtil.addKeyToReport(waterLevelDataPacketList, viewInverterPacketList, 'target_name', 'inverter_seq');
    let testWeatherInfoPacketList = [];
    if(['min', 'min10', 'hour'].includes(searchRange.searchType)){
      betweenDatePoint.fullTxtPoint.forEach(date => {
        waterLevelDataPacketList.forEach(currentItem => {
          let addObj = {
            target_name: currentItem.target_name,
            water_level: currentItem.water_level,
            chart_color: currentItem.chart_color,
            chart_sort_rank: currentItem.chart_sort_rank,
            group_date: date,
          };
          testWeatherInfoPacketList.push(addObj);
        });
      });
    } else {
      testWeatherInfoPacketList = waterLevelDataPacketList;
    }
    let testWeatherInfoChart = webUtil.makeStaticChartData(testWeatherInfoPacketList, betweenDatePoint, chartOption);

    testWeatherInfoChart.series = _.concat(testWeatherInfoChart.series, weatherChartData.series);
    // TEST Water Level Add Chart Code End *****************

    req.locals.searchOption = searchOption;
    req.locals.powerChartData = powerChartData;
    req.locals.chartDecorator = chartDecoration;
    req.locals.weatherChartData = testWeatherInfoChart;
    req.locals.workBook = excelContents;
    return res.render('./trend/trend.html', req.locals);
  }));


  // router.use(wrap(async (err, req, res) => {
  //   // BU.log('Err', err);
  //   res.status(500).send(err);
  // }));

  return router;
};