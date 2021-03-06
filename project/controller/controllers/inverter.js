module.exports = function (app) {
  let router = require('express').Router();

  let BU = require('base-util-jh').baseUtil;
  let DU = require('base-util-jh').domUtil;
  
  let biInverter = require('../models/inverter.js');
  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 4);
    next();
  });

  // Get
  router.get('/', function (req, res) {
    BU.CLI('inverter', req.locals)
    //데이터 Test
    biInverter.getInverter(function (err, list) {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('./inverter/inverter.html', DU.makeInverterHtml(req.locals, list))

    })

  });

  return router;
}