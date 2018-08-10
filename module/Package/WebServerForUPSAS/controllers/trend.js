const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const {BU, DU} = require('base-util-jh');

// const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');
const excelUtil = require('../models/excel.util');
const PowerModel = require('../models/PowerModel');

const defaultRangeFormat = 'min10';
module.exports = app => {
  const initSetter = app.get('initSetter');
  const powerModel = new PowerModel(initSetter.dbInfo);

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      if (app.get('auth')) {
        if (!req.user) {
          return res.redirect('/auth/login');
        }
      }
      req.locals = DU.makeBaseHtml(req, 5);
      const currWeatherCastList = await powerModel.getCurrWeatherCast();
      const currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
      const weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
      req.locals.weatherCastInfo = weatherCastInfo;
      next();
    }),
  );

  // Get
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      // 장비 종류 여부 (전체, 인버터, 접속반)
      let deviceType = 'all';
      if (req.query.device_type === 'inverter' || req.query.device_type === 'connector') {
        deviceType = req.query.device_type;
      } else if (req.query.device_type === undefined) {
        deviceType = 'inverter';
      }

      let deviceListType = 'all';
      if (req.query.device_list_type === 'inverter' || req.query.device_list_type === 'connector') {
        deviceListType = req.query.device_list_type;
      }

      // 장비 선택 seq (all, number)
      let deviceSeq = 'all';
      if (_.isNaN(req.query.device_seq) === false && req.query.device_seq !== '') {
        deviceSeq = Number(req.query.device_seq);
      }

      // BU.CLIS(deviceType, deviceListType, deviceSeq);
      // Search 타입을 지정
      const searchType = req.query.search_type ? req.query.search_type : defaultRangeFormat;
      // 지정된 SearchType으로 설정 구간 정의
      let searchRange = powerModel.getSearchRange(
        searchType,
        req.query.start_date,
        req.query.end_date,
      );
      // BU.CLI(searchRange);
      // 검색 조건이 기간 검색이라면 검색 기간의 차를 구하여 실제 searchType을 구함.
      if (searchType === 'range') {
        const realSearchType =
          searchType === 'range'
            ? powerModel.convertSearchTypeWithCompareDate(
                searchRange.strEndDate,
                searchRange.strStartDate,
              )
            : searchType;
        if (realSearchType === 'hour') {
          searchRange = powerModel.getSearchRange(
            defaultRangeFormat,
            req.query.start_date,
            req.query.end_date,
          );
        } else {
          searchRange.searchType = realSearchType;
          searchRange.searchInterval = realSearchType;
        }
      }
      // BU.CLIS(req.query, searchRange);

      // 장비 선택 리스트 가져옴
      const deviceList = await powerModel.getDeviceList(deviceType);
      // BU.CLI(deviceList);

      const device_type_list = [
        {type: 'all', name: '전체'},
        {type: 'inverter', name: '인버터'},
        {type: 'connector', name: '접속반'},
      ];

      // 차트 제어 및 자질 구래한 데이터 모음
      const searchOption = {
        device_type: deviceType,
        device_type_list,
        device_list_type: deviceListType,
        device_seq: deviceSeq,
        device_list: deviceList,
        search_range: searchRange,
        search_type: searchType,
      };
      // BU.CLI(searchOption);

      /** searchRange를 기준으로 검색 Column Date를 정함  */
      const betweenDatePoint = BU.getBetweenDatePoint(
        searchRange.strBetweenEnd,
        searchRange.strBetweenStart,
        searchRange.searchInterval,
      );
      // 인버터 차트
      const {
        inverterPowerChartData,
        inverterTrend,
        viewInverterPacketList,
      } = await powerModel.getInverterChart(searchOption, searchRange, betweenDatePoint);
      // 차트 Range 지정
      const powerChartData = {range: betweenDatePoint.shortTxtPoint, series: []};
      // 차트 합침
      powerChartData.series = inverterPowerChartData.series;

      // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
      const chartDecoration = webUtil.makeChartDecoration(searchRange);

      const {
        weatherChartData,
        weatherTrend,
        weatherChartOptionList,
      } = await powerModel.getWeatherChart(searchRange, betweenDatePoint);
      const weatherCastRowDataPacketList = await powerModel.getWeatherCastAverage(searchRange);
      const waterLevelDataPacketList = await powerModel.getWaterLevel(searchRange);
      const calendarCommentList = await powerModel.getCalendarComment(searchRange);
      // BU.CLI(calendarCommentList);
      // BU.CLI(viewInverterPacketList);
      const createExcelOption = {
        calendarCommentList,
        viewInverterPacketList,
        inverterTrend,
        powerChartData,
        powerChartDecoration: chartDecoration,
        waterLevelDataPacketList,
        weatherCastRowDataPacketList,
        weatherTrend,
        weatherChartOptionList,
        searchRange,
      };

      const workSheetInfo = excelUtil.makeChartDataToExcelWorkSheet(createExcelOption);
      const excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);
      // let excelContents = excelUtil.makeExcelWorkBook(workSheetInfo.sheetName, [workSheetInfo]);

      powerChartData.series = _.concat(powerChartData.series, _.pullAt(weatherChartData.series, 0));

      // TEST Water Level Add Chart Code Start *****************
      const chartOption = {
        selectKey: 'water_level',
        dateKey: 'group_date',
        groupKey: 'target_name',
        colorKey: 'chart_color',
        sortKey: 'chart_sort_rank',
      };

      webUtil.addKeyToReport(
        waterLevelDataPacketList,
        viewInverterPacketList,
        'chart_color',
        'inverter_seq',
      );
      webUtil.addKeyToReport(
        waterLevelDataPacketList,
        viewInverterPacketList,
        'chart_sort_rank',
        'inverter_seq',
      );
      webUtil.addKeyToReport(
        waterLevelDataPacketList,
        viewInverterPacketList,
        'target_name',
        'inverter_seq',
      );
      let testWeatherInfoPacketList = [];
      if (['min', 'min10', 'hour'].includes(searchRange.searchType)) {
        betweenDatePoint.fullTxtPoint.forEach(date => {
          waterLevelDataPacketList.forEach(currentItem => {
            const addObj = {
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
      const testWeatherInfoChart = webUtil.makeStaticChartData(
        testWeatherInfoPacketList,
        betweenDatePoint,
        chartOption,
      );

      testWeatherInfoChart.series = _.concat(testWeatherInfoChart.series, weatherChartData.series);
      // TEST Water Level Add Chart Code End *****************

      req.locals.searchOption = searchOption;
      req.locals.powerChartData = powerChartData;
      req.locals.chartDecorator = chartDecoration;
      req.locals.weatherChartData = testWeatherInfoChart;
      req.locals.workBook = excelContents;
      return res.render('./trend/trend.html', req.locals);
    }),
  );

  // router.use(asyncHandler(async (err, req, res) => {
  //   // BU.log('Err', err);
  //   res.status(500).send(err);
  // }));

  return router;
};
