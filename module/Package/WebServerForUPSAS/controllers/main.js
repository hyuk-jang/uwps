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
    let searchRange = biModule.getSearchRange();

    // 접속반 현재 발전 현황
    let moduleStatus = await biModule.getModuleStatus();
    // 접속반 발전 현황 데이터 검증
    let validModuleStatusList = webUtil.checkDataValidation(moduleStatus, new Date(), 'writedate');

    let v_upsas_profile = await biModule.getTable('v_upsas_profile');
    // 이달 발전량 가져오기
    let monthPower = await biModule.getMonthPower();
    // 금일 발전 현황
    let dailyPowerReport = await biModule.getDailyPowerReport(searchRange);
    // 인버터 현재 발전 현황
    let inverterDataList = await biModule.getTable('v_inverter_status');
    // 인버터 발전 현황 데이터 검증
    let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

    // 설치 인버터 총 용량
    let pv_amount = _.reduce(_.pluck(v_upsas_profile, 'pv_amount'), (accumulator, currentValue) => accumulator + currentValue);
    let powerGenerationInfo = {
      currKw: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'out_w', false), 0.001, 3),
      currKwYaxisMax: Math.ceil(pv_amount / 10),
      dailyPower: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'd_wh', false), 0.001, 3),
      monthPower,
      cumulativePower: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'c_wh', true), 0.000001, 3),
      co2: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'c_wh', true), 0.000000424, 3),
      hasOperationInverter: _.every(_.values(_.map(validInverterDataList, data => data.hasValidData))),
      hasAlarm: false // TODO 알람 정보 작업 필요
    };

    // BU.CLI(powerGenerationInfo);

    req.locals.dailyPowerReport = dailyPowerReport;
    req.locals.moduleStatusList = validModuleStatusList ;
    req.locals.powerGenerationInfo = powerGenerationInfo;

    return res.render('./main/index.html', req.locals);
  }));

  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));


  return router;
};