module.exports = function (app) {
  let router = require('express').Router();

  let BU = require('../public/js/util/baseUtil.js');
  let DU = require('../public/js/util/domUtil.js');
  let SU = require('../public/js/util/salternUtil.js');
  let biMain = require('../models/main.js');
  let biSensor = require('../models/sensor.js');

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 1);
    next();
  });

  // Get
  router.get('/', function (req, res) {
    BU.CLI('main', req.locals)
    biMain.getDailyPower(req, function (err, result) {
      if (err) {
        return res.status(500).send(err);
      }
      res.render('./main/index.html', DU.makeMainHtml(req.locals, result))
    })
  });
  // Post
  router.post('/', function (req, res) {
    BU.CLI('main', req.locals);
    biMain.getModulePaging(req, function (err, result) {
      if (err) {
        return res.status(500).send(err);
      }
      res.send(DU.makeMainPaging(req.locals, result));
    })
  });

  router.get('/sensor', function (req, res) {
    biSensor.getSensor(function (err, result) {
      if (err) {
        return res.status(500).send(err);
      }
      req.locals.chart1=JSON.stringify(result.chart1);
      req.locals.chart2=JSON.stringify(result.chart2);
      req.locals.chart3=JSON.stringify(result.chart3);
      req.locals.chart4=JSON.stringify(result.chart4);
      req.locals.chart5=JSON.stringify(result.chart5);
      req.locals.chart6=JSON.stringify(result.chart6);
      req.locals.chart7=JSON.stringify(result.chart7);
      console.log(req.locals)
      res.render('./sensor.html', req.locals);
    });
  })
  return router;
}