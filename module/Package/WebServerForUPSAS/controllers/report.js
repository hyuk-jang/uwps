const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 6);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
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
    let searchInterval = req.query.search_interval ? req.query.search_interval : 'hour';
    // 조회 범위
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    // 조회 객체 정의
    BU.CLIS(searchType, searchInterval, req.query.start_date, req.query.end_date);
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    searchRange.searchInterval = searchInterval;
    searchRange.searchType = searchType;
    searchRange.page = Number(param_page);
    searchRange.pageListCount = 20;

    let inverterList = await biModule.getTable('inverter');
    let reportList = await biModule.getInverterReport(param_inverter_seq, searchRange);
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

    let deviceList =  await biModule.getDeviceList('inverter');


    inverterList.unshift({
      inverter_seq: 'all',
      target_name: '모두'
    });

    // BU.CLI(gridChartReport)
    req.locals.inverter_seq = param_inverter_seq;
    req.locals.device_list = deviceList;
    req.locals.searchRange = searchRange;
    req.locals.reportList = reportList.report;
    req.locals.paginationInfo = paginationInfo;


    return res.render('./report/report.html', req.locals);
  }));

  router.use(wrap(async(err, req, res) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};