const wrap = require('express-async-wrap');
let router = require('express').Router();

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
    BU.CLI('trend', req.locals);


    // biModule.

    if (req.query.start == undefined && req.query.end == undefined && req.query.checkradio == undefined) {
      req.query.start = '20170901';
      req.query.end = '20170902';
      req.query.checkradio = 'day';
    }
    biTrend.dailyPower(req.query, function (err, list) {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('./trend/trend.html', DU.makeTrendHtml(req.locals, list));
    })
  }));

  router.use(wrap(async(err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}