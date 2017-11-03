module.exports = function (app) {
  let router = require('express').Router();
  let BU = require('base-util-jh').baseUtil;
  let DU = require('../public/js/util/domUtil.js');
  let SU = require('../public/js/util/salternUtil.js');
  let biTrend = require('../models/trend.js');

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 5);
    next();
  });
  
  // Get
  router.get('/', function (req, res) {
    BU.CLI('trend', req.locals);
    if(req.query.start==undefined&&req.query.end==undefined&&req.query.checkradio==undefined){
      req.query.start='20170901';
      req.query.end='20170902';
      req.query.checkradio='day';
    }
    biTrend.dailyPower(req.query, function (err, list) {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('./trend/trend.html', DU.makeTrendHtml(req.locals, list));
    })
  });

  return router;
}