const wrap = require('express-async-wrap');
let router = require('express').Router();

let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 3);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    // BU.CLI('connector', req.locals);
    // 접속반 리스트 가져옴
    let connectorList = await biModule.getTable('connector');
    let connector_seq = req.query.connector_seq ? Number(req.query.connector_seq)  : _.first(connectorList).connector_seq;
    let selectedConnector = _.findWhere(connectorList, {connector_seq: connector_seq})
    let moduleStatusList = await biModule.getTable('v_photovoltaic_status', 'connector_seq', connector_seq)
    let connectorHistory = await biModule.getConnectorHistory(selectedConnector);

    let ampList = _.pluck(moduleStatusList, 'amp');
    let volList = _.pluck(moduleStatusList, 'vol');

    let totalAmp = _.reduce(ampList, (accumulator, currentValue) => accumulator + currentValue ) / 10;
    let vol = _.reduce(volList, (accumulator, currentValue) => accumulator + currentValue ) / 10 / volList.length;
    
    // 접속반 리스트
    req.locals.connectorList = connectorList;
    req.locals.connector_seq = connector_seq;
    req.locals.gridInfo = {
      // 총전류, 전압, 보여줄 컬럼 개수
      totalAmp, vol, maxModuleViewNum : 8
    }
    // 모듈 상태값들 가지고 있는 배열
    req.locals.moduleStatusList = moduleStatusList;
    // 금일 발전 현황
    req.locals.connectorHistory = connectorHistory;
    return res.render('./connector/connect.html', req.locals);
  }));


  router.use(wrap(async (err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}