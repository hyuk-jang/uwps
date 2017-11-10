const wrap = require('express-async-wrap');
let router = require('express').Router();

let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;

let biMain = require('../models/main.js');
let biSensor = require('../models/sensor.js');

let Main = require('../models/Main.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const mMain = new Main(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 1);
    next();
  });

  // Get
  router.get('/', wrap(async (req, res) => {
    let dailyPower = await mMain.getDailyPower();
    let modulePaging = await mMain.getModuleInfo(req.locals);
    BU.CLIS(dailyPower, modulePaging)

    return res.render('./main/index.html', DU.makeMainHtml(req.locals, { dailyPower, modulePaging }))

  }));

  // Post
  router.post('/', wrap(async (req, res) => {
    let modulePaging = await mamMainetModulePaging(req);
    // BU.CLIS(dailyPower, modulePaging)
    return res.render('./main/index.html', DU.makeMainPaging(req.locals, { modulePaging }))
  }));

  router.get('/sensor', wrap(async (req, res) => {
    biSensor.getSensor(function (err, result) {
      if (err) {
        return res.status(500).send(err);
      }
      req.locals.chart1 = JSON.stringify(result.chart1);
      req.locals.chart2 = JSON.stringify(result.chart2);
      req.locals.chart3 = JSON.stringify(result.chart3);
      req.locals.chart4 = JSON.stringify(result.chart4);
      req.locals.chart5 = JSON.stringify(result.chart5);
      req.locals.chart6 = JSON.stringify(result.chart6);
      req.locals.chart7 = JSON.stringify(result.chart7);
      console.log(req.locals)
      res.render('./sensor.html', req.locals);
    });
  }))


  router.use(wrap(async (err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));


  return router;
}