const wrap = require('express-async-wrap');
let router = require('express').Router();

let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;

let biSensor = require('../models/sensor.js');
let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 1);
    next();
  });

  // Get
  router.get('/', wrap(async (req, res) => {
    // let workers = app.get('workers');

    let dailyPowerReport = await biModule.getDailyPowerReport();
    let moduleStatus = await biModule.getTable('v_photovoltaic_status');
    let inverterDataList = await biModule.getTable('v_inverter_status');

    BU.CLI(moduleStatus)

    let powerGenerationInfo = {
      currKw: (_.reduce(_.pluck(inverterDataList, 'out_w'), (accumulator, currentValue) => accumulator + currentValue ) / 10000).toFixed(3),
      dailyPower: (_.reduce(_.pluck(inverterDataList, 'd_wh'), (accumulator, currentValue) => accumulator + currentValue ) / 10000).toFixed(3),
      cumulativePower: (_.reduce(_.pluck(inverterDataList, 'c_wh'), (accumulator, currentValue) => accumulator + currentValue ) / 10000 / 1000).toFixed(3),
      hasOperationInverter: true,
    };

    // // 인버터 동작 상태 가져옴
    // let ivtOperation = _.map(inverterDataList, ivtData => {
    //   // TODO hasOperation이 연결 상태로 동작 유무 파악. isError check로 해야함.
    //   let hasOperation = workers.uPMS.hasOperationInverter(ivtData.target_id);
    //   if(!hasOperation){
    //     powerGenerationInfo.hasOperationInverter = false;
    //   }
    //   return {seq: ivtData.inverter_seq, target_id : ivtData.target_id, hasOperation}
    // })

    req.locals.dailyPowerReport = dailyPowerReport;
    req.locals.moduleStatus = moduleStatus ;
    req.locals.powerGenerationInfo = powerGenerationInfo;

    return res.render('./main/index.html', req.locals)
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