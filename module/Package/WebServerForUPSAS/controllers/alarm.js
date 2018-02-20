const Promise = require('bluebird');
const wrap = require('express-async-wrap');
let router = require('express').Router();

const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 7);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    // BU.CLI('alarm', req.query)
    // 장비 종류 여부 all(전체), inverter(인버터), connector(접속반)
    let deviceType = req.query.device_type === 'inverter' || req.query.device_type === 'connector' ? req.query.device_type : 'all';
    /** 오류 상태 @property {string} error_status all(전체), deviceError(장치 에러), systemError(시스템 에러) */
    let error_status = req.query.error_status == null || req.query.error_status === '' ? 'deviceError' : req.query.error_status;
    
    let param_page = req.query.page || 1;

    let startDate = req.query.start_date ? BU.convertTextToDate(req.query.start_date) : new Date();
    let endDate = req.query.end_date ? BU.convertTextToDate(req.query.end_date) : new Date();

    // 기본 한달 간 검색
    if(!req.query.start_date){
      startDate.setMonth(startDate.getMonth() - 1);
    }
    startDate = BU.convertDateToText(startDate);
    endDate = BU.convertDateToText(endDate);

    let searchRange = biModule.getSearchRange('range', startDate, endDate);
    // 검색 조건 객체에 현재 페이지, 페이지당 출력 건수 정의
    searchRange.page = Number(param_page);
    searchRange.pageListCount = 20;

    let troubleReport = {totalCount: 0, report: []};

    if(deviceType === 'inverter'){
      troubleReport = await biModule.getAlarmReportForInverter(error_status, searchRange);
    } else if(deviceType === 'connector'){
      troubleReport = await biModule.getAlarmReportForConnector(error_status, searchRange);
    } else {
      troubleReport = await biModule.getAlarmReport(error_status, searchRange);
    }

    let queryString = {
      start_date: searchRange.strStartDateInputValue,
      end_date: searchRange.strEndDateInputValue,
    };
    
    let paginationInfo = DU.makeBsPagination(searchRange.page, troubleReport.totalCount, '/alarm', queryString, searchRange.pageListCount);

    
    let device_type_list = [
      {type: 'all', name: '전체'},
      {type: 'inverter', name: '인버터'},
      {type: 'connector', name: '접속반'}
    ];

    let error_status_list = [
      {type: 'all', name: '전체'},
      {type: 'deviceError', name: '장치 오류'},
      {type: 'systemError', name: '시스템 오류'}
    ];

    // 차트 제어 및 자질 구래한 데이터 모음
    let searchOption = {
      device_type: deviceType,
      device_type_list: device_type_list,
      error_status: error_status,
      error_status_list: error_status_list,
      search_range: searchRange
    };


    req.locals.searchOption = searchOption;
    req.locals.alarmList = troubleReport.report;
    req.locals.paginationInfo = paginationInfo;

    return res.render('./alarm/alert.html', req.locals);
  }));

  router.use(wrap(async(err, req, res) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};