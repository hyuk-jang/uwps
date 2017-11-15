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

    let where = req.query.connector_seq ? 'connector_seq' : undefined;
    let connector_seq = req.query.connector_seq;
    
    let connectorStatus = await biModule.getTable('v_connector_status', where, req.query.connector_seq)
    if(connectorStatus.length){
      connectorStatus = _.first(connectorStatus);
    }

    BU.CLI(connectorStatus);

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

  return router;
}