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
    let searchType = req.query.searchType ? searchType : 'day';
    console.time('all')
    console.time('getTable')
    let connectorList = await biModule.getTable('connector');
    console.timeEnd('getTable')
    let connector_seq = req.query.connector_seq ? Number(req.query.connector_seq) : _.pluck(connectorList, 'connector_seq');
    let searchConnectorList = Array.isArray(connector_seq) ? connectorList : [_.findWhere(connectorList, {
      connector_seq: connector_seq
    })];

    console.time('v_relation_upms')
    let upmsRelation = await biModule.getTable('v_relation_upms')
    console.timeEnd('v_relation_upms')

    // 트렌드 중에서 가장 최근에 나온 날짜 리스트 
    let lastDateList = [];

    console.time('map')
    let gridChartReport = await Promise.map(searchConnectorList, searchConnector => {
        return biModule.getConnectorHistory(searchConnector)
          .then(connectorHistory => {
            lastDateList.push(_.max(connectorHistory.gridInfo, rowsInfo => rowsInfo.writedate));
            // BU.CLI(connectorHistory)
            return biModule.getGridReport(searchConnector, upmsRelation, connectorHistory);
          });
      })
      .then(gridReportList => {
        let gridChartReport = {
          range: [],
          series: []
        };
        gridReportList.forEach(ele => {
          gridChartReport.range = ele.range;
          gridChartReport.series = gridChartReport.series.concat(ele.series)
        })
        return gridChartReport;
      })

    let startDate = req.query.start ? req.query.start : BU.convertDateToText(new Date());
    biModule.getMeasureTime(gridChartReport, req.query.start, req.query.end, searchType);

    req.locals.gridInfo = {
      measureTime: `[${req.query.start ? req.query.start : BU.convertDateToText(new Date(), '', 2)} 00:00:00
        ~ ${req.query.end ? req.query.end : BU.convertDateToText(new Date(), '', 4)}:00
      ]`
    }
    console.timeEnd('map')
    connectorList.unshift({connector_seq: 'all', target_name: '모두'})

    req.locals.searchType = searchType;
    req.locals.connector_seq = Array.isArray(connector_seq) ? 'all' : connector_seq;
    req.locals.connectorList = connectorList;
    req.locals.gridChartReport = gridChartReport;

    console.timeEnd('all')
    return res.render('./trend/trend.html', req.locals);
  }));

  router.use(wrap(async(err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}