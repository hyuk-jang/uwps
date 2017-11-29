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

    let moduleStatus = await biModule.getModuleStatus();
    let v_upsas_profile = await biModule.getTable('v_upsas_profile');
    let monthPower = await biModule.getMonthPower();
    let dailyPowerReport = await biModule.getDailyPowerReport();
    let inverterDataList = await biModule.getTable('v_inverter_status');
    
    let pv_amount = _.reduce(_.pluck(v_upsas_profile, 'pv_amount'), (accumulator, currentValue) => accumulator + currentValue);
    let powerGenerationInfo = {
      currKw: Number((_.reduce(_.pluck(inverterDataList, 'out_w'), (accumulator, currentValue) => accumulator + currentValue ) / 1000).toFixed(3)) ,
      currKwYaxisMax: Math.ceil(pv_amount / 10),
      dailyPower: Number((_.reduce(_.pluck(inverterDataList, 'd_wh'), (accumulator, currentValue) => accumulator + currentValue ) / 1000).toFixed(3)),
      monthPower,
      cumulativePower: Number((_.reduce(_.pluck(inverterDataList, 'c_wh'), (accumulator, currentValue) => accumulator + currentValue ) / 1000 / 1000).toFixed(3)),
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