const wrap = require('express-async-wrap');
let router = require('express').Router();

let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;

let biConnector = require('../models/connector.js');

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
    BU.CLI('connector', req.locals);

    // let where = req.query.connector_seq ? 'connector_seq' : undefined;
    // let connector_seq = req.query.connector_seq;

    // 접속반 리스트 가져옴
    let connectorList = await biModule.getTable('connector');
    let connector_seq = req.query.connector_seq ? req.query.connector_seq : _.first(connectorList).connector_seq;
    let selectedConnector = _.findWhere(connectorList, {connector_seq: connector_seq})
    let moduleStatusList = await biModule.getTable('v_photovoltaic_status', 'connector_seq', connector_seq)
    let connectorHistory = await biModule.getConnectorHistory(selectedConnector);


    let ampList = _.pluck(moduleStatusList, 'amp');
    let volList = _.pluck(moduleStatusList, 'vol');

    let totalAmp = _.reduce(ampList, (accumulator, currentValue) => accumulator + currentValue ) / 10;
    let vol = _.reduce(volList, (accumulator, currentValue) => accumulator + currentValue ) / 10 / volList.length;
    
    BU.CLIS(ampList, volList)

    // BU.CLI(connectorHistory)

    req.locals.connectorList = connectorList;
    req.locals.connector_seq = connector_seq;
    req.locals.moduleStatusList = moduleStatusList;
    req.locals.chartList = connectorHistory;


    return res.render('./connector/connect.html', req.locals);
    // req.locals

    // return res.render('./connector/connect.html', req.locals)

 
    if(connector_seq==undefined){
      connector_seq=1;
    }
    biConnector.getConnector(connector_seq,function (err, list) {
      if (err) {
        return res.status(500).send(err);
      }
      BU.CLI(list)
      res.render('./connector/connect.html', DU.makeTestHtml(req.locals, list));
    })
    
  }));


  router.use(wrap(async (err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}