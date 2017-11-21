const Promise = require('bluebird');
const wrap = require('express-async-wrap');
let router = require('express').Router();

const BU = require('base-util-jh').baseUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  let biTrend = require('../models/trend.js');

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 5);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    
    let searchType = req.query.search_type ? req.query.search_type : 'day';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);

    let connectorList = await biModule.getTable('connector');
    let connector_seq =  !isNaN(req.query.connector_seq) && req.query.connector_seq !== '' ? Number(req.query.connector_seq) : _.pluck(connectorList, 'connector_seq');

    let searchConnectorList = Array.isArray(connector_seq) ? connectorList : [_.findWhere(connectorList, {
      connector_seq: connector_seq
    })];

    // BU.CLI(searchConnectorList)

    let upmsRelation = await biModule.getTable('v_relation_upms')

    // 트렌드 중에서 가장 최근에 나온 날짜 리스트 
    let gridChartReport = await Promise.map(searchConnectorList, searchConnector => {
        return biModule.getTrendHistory(searchConnector, searchRange, searchType)
          .then(connectorHistory => {
            // BU.CLI(connectorHistory)
            return biModule.getMoudlePowerTrend(searchConnector, upmsRelation, connectorHistory);
          });
      })
      .then(gridReportList => {
        // BU.CLI(gridReportList)
        let modulePowerObj = {
          range: [],
          series: []
        };
        gridReportList.forEach(ele => {
          modulePowerObj.range = ele.range;
          modulePowerObj.series = modulePowerObj.series.concat(ele.series)
        })
        return modulePowerObj;
      })

    // BU.CLI(gridChartReport)

    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    })

    _.pluck(gridChartReport.series, 'data').forEach(ele => {
      if(ele.length > searchRange.dataCount){
        searchRange.dataCount = ele.length;
      }
    });

    req.locals.searchType = searchType;
    req.locals.connector_seq = Array.isArray(connector_seq) ? 'all' : connector_seq;
    req.locals.connectorList = connectorList;
    req.locals.gridChartReport = gridChartReport;
    req.locals.searchRange = searchRange;

    return res.render('./trend/trend.html', req.locals);
  }));

  router.use(wrap(async(err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}