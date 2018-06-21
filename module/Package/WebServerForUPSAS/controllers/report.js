const _ = require('lodash');
const wrap = require('express-async-wrap');
const router = require('express').Router();
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

let webUtil = require('../models/web.util');


const PowerModel = require('../models/PowerModel');

const defaultRangeFormat = 'min10';
module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const powerModel = new PowerModel(initSetter.dbInfo);
  

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 6);
    let currWeatherCastList = await powerModel.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async(req, res) => {
    // BU.CLI('report', req.query);
    let param_inverter_seq = req.query.inverter_seq == null || req.query.inverter_seq === 'all' ? 'all' : Number(req.query.inverter_seq);
    let param_page = req.query.page || 1;
    // 조회 간격
    let searchInterval = req.query.search_interval ? req.query.search_interval : defaultRangeFormat;
    // 조회 범위
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    // 조회 객체 정의
    // BU.CLIS(searchType, searchInterval, req.query.start_date, req.query.end_date);
    const selectedReportMode = _.get(req.query, 'start_date', '').length ? 'reportMode' : 'calendarMode';
    let searchRange = powerModel.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    searchRange.searchInterval = searchInterval;
    // searchRange.searchType = searchType;
    searchRange.page = Number(param_page);
    searchRange.pageListCount = 20;

    let inverterList = await powerModel.getTable('inverter');
    let reportList = await powerModel.getInverterReport(searchRange, param_inverter_seq);
    let calendarEventList = await powerModel.getCalendarEventList();
    // BU.CLI(reportList);

    let queryString = {
      inverter_seq: param_inverter_seq,
      start_date: searchRange.strStartDateInputValue,
      end_date: searchRange.strEndDateInputValue,
      search_type: searchType,
      search_interval: searchInterval
    };

    let paginationInfo = DU.makeBsPagination(searchRange.page, reportList.totalCount, '/report', queryString, searchRange.pageListCount);

    // BU.CLI(paginationInfo)
    // BU.CLI(searchRange)
    // BU.CLI(reportList.totalCount);

    let deviceList =  await powerModel.getDeviceList('inverter');


    inverterList.unshift({
      inverter_seq: 'all',
      target_name: '모두'
    });

    req.locals.inverter_seq = param_inverter_seq;
    req.locals.device_list = deviceList;
    req.locals.searchRange = searchRange;
    req.locals.reportList = reportList.report;
    req.locals.paginationInfo = paginationInfo;
    req.locals.calendarEventList = calendarEventList;
    req.locals.selectedReportMode = selectedReportMode;


    return res.render('./report/report.html', req.locals);
  }));

  

  router.get('/excel', wrap(async (req, res) => {
    const searchInterval = req.query.search_interval ? req.query.search_interval : 'min10';
    // Search 타입을 지정
    let searchType = req.query.search_type ? req.query.search_type : defaultRangeFormat;
    let startDate = req.query.start_date;
    let endDate = req.query.end_date;

    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = powerModel.getSearchRange(searchType, startDate, endDate);
    
    if (searchType === 'range') {
      let realSearchType = searchType === 'range' ? powerModel.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;
      if (realSearchType === 'hour') {
        searchRange = powerModel.getSearchRange(defaultRangeFormat, req.query.start_date, req.query.end_date);
      } else {
        searchRange.searchInterval = searchRange.searchType = realSearchType;
      }
    } else if (searchType === 'hour'){
      switch (searchInterval) {
      case 'min':
      case 'min10':
        searchRange.searchType = searchInterval;
        break;
      }
      searchRange.searchInterval = searchInterval;
    }
    // BU.CLI(searchRange);
    // return;

    if(['min', 'min10', 'hour'].includes(searchInterval)){
      let excelWorkBook = await powerModel.makeExcelSheet(searchRange, searchInterval);
      // BU.CLI(excelWorkBook);
  
      return res.send(excelWorkBook);
    } else {
      return res.status(500).send();
    }

    // BU.CLI(searchRange);
    
  }));

  router.use(wrap(async(err, req, res) => {
    BU.CLIN(err, 2);
    return res.status(500).send(err);
  }));

  return router;
};