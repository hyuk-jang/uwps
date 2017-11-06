module.exports = function (app) {
  let router = require('express').Router();

  let BU = require('base-util-jh').baseUtil;
  let DU = require('base-util-jh').domUtil;
  
  let biConnector = require('../models/connector.js');
  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 3);
    next();
  });

  // Get
  router.get('/', function (req, res) {
    BU.CLI('connector', req.locals);
    let connector_seq = req.query.connector_seq;
 
    if(connector_seq==undefined){
      connector_seq=1;
    }
    biConnector.getConnector(connector_seq,function (err, list) {
      if (err) {
        return res.status(500).send(err);
      }
      // BU.CLI(DU.makeTestHtml(req.locals, list))
      res.render('./connector/connect.html', DU.makeTestHtml(req.locals, list));
    })
    
  });
  return router;
}