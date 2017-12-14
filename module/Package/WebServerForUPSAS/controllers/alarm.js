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

    let param_page = req.query.page || 1;

    let startDate = req.query.start_date ? BU.convertTextToDate(req.query.start_date) : new Date();
    let endDate = req.query.end_date ? BU.convertTextToDate(req.query.end_date) : new Date();

    if(!req.query.start_date){
      startDate.setMonth(startDate.getMonth() - 2)
    }
    startDate = BU.convertDateToText(startDate)
    endDate = BU.convertDateToText(endDate)

    let searchRange = biModule.getSearchRange('range', startDate, endDate);
    searchRange.page = Number(param_page);
    searchRange.pageListCount = 20;

    let alarmList = await biModule.getAlarmList(searchRange);

    let queryString = {
      start_date: searchRange.strStartDateInputValue,
      end_date: searchRange.strEndDateInputValue,
    }
    
    let paginationInfo = DU.makeBsPagination(searchRange.page, alarmList.totalCount, '/alarm', queryString, searchRange.pageListCount);

    req.locals.searchRange = searchRange;
    req.locals.alarmList = alarmList.report;
    req.locals.paginationInfo = paginationInfo;

    return res.render('./alarm/alert.html', req.locals)
  }));

  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err)
    res.status(500).send(err);
  }));

  return router;
}