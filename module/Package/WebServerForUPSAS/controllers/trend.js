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
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 5);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    let upsasProfile = await biModule.getTable('v_upsas_profile');
    let connectorList = await biModule.getTable('connector');

    let param_connector_seq = req.query.connector_seq;
    let connectorSeqList = !isNaN(param_connector_seq) && param_connector_seq !== '' ? [Number(req.query.connector_seq)] : _.pluck(connectorList.connector_seq);

    let moduleSeqList = [];
    _.each(connectorSeqList, seq => {
      let moduleList = _.where(upsasProfile, {connector_seq:seq});
      moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []) ;
    });
    moduleSeqList = _.union(moduleSeqList);

    let moduleReportList = await biModule.getModuleReport(moduleSeqList, searchRange);
    // BU.CLI(moduleReportList);

    let moduleHistory =  await biModule.getModuleHistory(moduleSeqList, searchRange);
    BU.CLI(moduleHistory);
    let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    BU.CLI(betweenDatePoint);
    // let chartData = webUtil.makeChartData(moduleReportList, 'wh', 'group_date', 'photovoltaic_seq');

    let trendReportList = await biModule.processModuleReport(upsasProfile, moduleReportList, searchRange);
    // BU.CLI(trendReportList);
    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    });

    // BU.CLI(gridChartReport)
    req.locals.searchType = searchType;
    req.locals.connector_seq = param_connector_seq == null ? 'all' : Number(param_connector_seq);
    req.locals.connectorList = connectorList;
    req.locals.trendReportList = trendReportList;
    req.locals.searchRange = searchRange;

    return res.render('./trend/trend.html', req.locals);
  }));


  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};