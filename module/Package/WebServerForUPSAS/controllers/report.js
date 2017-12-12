const Promise = require('bluebird');
const wrap = require('express-async-wrap');
let router = require('express').Router();

const BU = require('base-util-jh').baseUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 6);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    BU.CLI('report', req.locals, req.query);
    let param_inverter_seq = req.query.inverter_seq == null || req.query.inverter_seq === 'all' ? 'all' : Number(req.query.inverter_seq);
    let param_page = req.query.page || 1;
    // 조회 간격
    let searchInterval = req.query.search_interval ? req.query.search_interval : 'hour';
    // 조회 범위
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    // 조회 객체 정의
    BU.CLIS(searchType, req.query.start_date, req.query.end_date)
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    searchRange.searchInterval = searchInterval;
    searchRange.searchType = searchType;
    searchRange.page = param_page;
    
    let inverterList = await biModule.getTable('inverter');
    
    let reportList =  await biModule.getInverterReport(param_inverter_seq, searchRange);

    BU.CLI(searchRange);
    BU.CLI(reportList);


    inverterList.unshift({
      inverter_seq: 'all',
      target_name: '모두'
    })

    // BU.CLI(gridChartReport)
    req.locals.inverter_seq = param_inverter_seq;
    req.locals.inverterList = inverterList;
    req.locals.searchRange = searchRange;
    req.locals.reportList = reportList;


    return res.render('./report/report.html', req.locals)
  }));

  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err)
    res.status(500).send(err);
  }));

  return router;
}