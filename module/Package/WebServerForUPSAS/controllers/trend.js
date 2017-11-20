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
    // console.log('req',req)
    let searchType = req.query.search_type ? req.query.search_type : 'day';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);

    console.time('all')
    console.time('getTable')
  
    let connectorList = await biModule.getTable('connector');
    let connector_seq =  !isNaN(req.query.connector_seq) && req.query.connector_seq !== '' ? Number(req.query.connector_seq) : _.pluck(connectorList, 'connector_seq');
    console.timeEnd('getTable')

    let searchConnectorList = Array.isArray(connector_seq) ? connectorList : [_.findWhere(connectorList, {
      connector_seq: connector_seq
    })];

    // BU.CLI(searchConnectorList)

    console.time('v_relation_upms')
    let upmsRelation = await biModule.getTable('v_relation_upms')
    console.timeEnd('v_relation_upms')

    // 트렌드 중에서 가장 최근에 나온 날짜 리스트 
    // let lastDateList = [];
    // let firstDateList = [];
    console.time('map')
    let gridChartReport = await Promise.map(searchConnectorList, searchConnector => {
        return biModule.getConnectorHistory(searchConnector, searchRange, searchType)
          .then(connectorHistory => {
            // firstDateList.push(_.min(connectorHistory.gridInfo, rowsInfo => rowsInfo.writedate));
            // lastDateList.push(_.max(connectorHistory.gridInfo, rowsInfo => rowsInfo.writedate));
            // BU.CLI(connectorHistory)
            return biModule.getModlePowerTrend(searchConnector, upmsRelation, connectorHistory);
          });
      })
      .then(gridReportList => {
        // BU.CLI(gridReportList)
        // let firstDateObj = _.min(firstDateList, 'writedate');
        // let lastDateObj = _.max(lastDateList, 'writedate');
        let modulePowerObj = {
          // firstDate: firstDateObj.writedate,
          // lastDate: lastDateObj.writedate,
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

    req.locals.gridInfo = {
      measureTime: `[${searchRange.start} ~ ${searchRange.end}]`
      // measureTime: `[${req.query.start ? req.query.start : BU.convertDateToText(new Date(), '', 2)} 00:00:00
      //   ~ ${req.query.end ? req.query.end : BU.convertDateToText(new Date(), '', 4)}:00
      // ]`
    }
    console.timeEnd('map')
    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    })

    BU.CLI(searchRange)

    req.locals.searchType = searchType;
    req.locals.connector_seq = Array.isArray(connector_seq) ? 'all' : connector_seq;
    req.locals.connectorList = connectorList;
    req.locals.gridChartReport = gridChartReport;
    req.locals.searchRange = searchRange;

    console.timeEnd('all')
    return res.render('./trend/trend.html', req.locals);
  }));

  router.use(wrap(async(err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}