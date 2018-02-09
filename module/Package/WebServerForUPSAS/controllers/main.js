const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

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
    // let startDate = req.query.start_date ? req.query.start_date : '2017-12-14';
    let searchRange = biModule.getSearchRange();
    // BU.CLI(searchRange)

    let moduleStatus = await biModule.getModuleStatus();
    BU.CLI(moduleStatus);
    let resultCheckValidData = webUtil.checkDataValidation(moduleStatus, new Date(), 'writedate');
    BU.CLI(resultCheckValidData);
    
    let hasModuleOperation = _.every(_.values(_.map(resultCheckValidData, data => data.hasValidData))); 
    

    let v_upsas_profile = await biModule.getTable('v_upsas_profile');
    let monthPower = await biModule.getMonthPower();
    let dailyPowerReport = await biModule.getDailyPowerReport(searchRange);
    // BU.CLI(dailyPowerReport);
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

    return res.render('./main/index.html', req.locals);
  }));

  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));


  return router;
};