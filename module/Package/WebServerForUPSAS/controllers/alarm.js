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
    /**
     * 장치 타입
     * @property {string} device_type all(모두), inverter(인버터), connector(접속반)
     */
    let device_type = req.query.device_type == null || req.query.device_type === 'all' ? 'all' : req.query.device_type;
    /**
     * 오류 상태
     * @property {string} error_status all(모두), occur(발생 중 에러), fixed(해결된 에러)
     */
    let error_status = req.query._status == null || req.query._status === 'all' ? 'all' : req.query._status;
    
    let param_page = req.query.page || 1;

    let startDate = req.query.start_date ? BU.convertTextToDate(req.query.start_date) : new Date();
    let endDate = req.query.end_date ? BU.convertTextToDate(req.query.end_date) : new Date();

    if(!req.query.start_date){
      startDate.setMonth(startDate.getMonth() - 2);
    }
    startDate = BU.convertDateToText(startDate);
    endDate = BU.convertDateToText(endDate);

    let searchRange = biModule.getSearchRange('range', startDate, endDate);
    // 검색 조건 객체에 현재 페이지, 페이지당 출력 건수 정의
    searchRange.page = Number(param_page);
    searchRange.pageListCount = 20;
    let alarmList = await biModule.getAlarmList(searchRange);

    let queryString = {
      start_date: searchRange.strStartDateInputValue,
      end_date: searchRange.strEndDateInputValue,
    };
    
    let paginationInfo = DU.makeBsPagination(searchRange.page, alarmList.totalCount, '/alarm', queryString, searchRange.pageListCount);

    req.locals.searchRange = searchRange;
    req.locals.alarmList = alarmList.report;
    req.locals.paginationInfo = paginationInfo;

    return res.render('./alarm/alert.html', req.locals);
  }));

  router.use(wrap(async(err, req, res) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};