const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 4);
    next();
  });
  // Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>
  // Get
  router.get('/', wrap(async (req, res) => {
    // BU.CLI('inverter', req.locals)
    // console.time('getTable')
    let viewInverterStatus = await biModule.getTable('v_inverter_status');
    // 데이터 검증
    let validInverterStatus = webUtil.checkDataValidation(viewInverterStatus, new Date(), 'writedate');
    // BU.CLI(validInverterStatus);
    /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedInverterStatus = webUtil.refineSelectedInverterStatus(validInverterStatus);
    // BU.CLI(refinedInverterStatus);

    let searchRange = biModule.getSearchRange('hour');
    // let searchRange = biModule.getSearchRange('hour', '2018-02-14');
    let inverterPowerList = await biModule.getInverterPower(searchRange);
    let chartData = webUtil.makeDynamicChartData(inverterPowerList, 'out_w', 'hour_time', 'inverter_seq');
    webUtil.mappingChartDataName(chartData, viewInverterStatus, 'inverter_seq', 'target_name');
    
    req.locals.inverterStatus = refinedInverterStatus;
    req.locals.chartDataObj = chartData;
    req.locals.powerInfo = {
      measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
    };
    // BU.CLI(req.locals.powerInfo);

    return res.render('./inverter/inverter.html', req.locals);
  }));


  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));

  return router;
};