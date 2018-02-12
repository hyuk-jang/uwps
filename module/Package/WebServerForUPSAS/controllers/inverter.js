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

  // Get
  router.get('/', wrap(async (req, res) => {
    // BU.CLI('inverter', req.locals)
    // console.time('getTable')
    let inverterStatus = await biModule.getTable('v_inverter_status');
    // 데이터 검증
    let validInverterStatus = webUtil.checkDataValidation(inverterStatus, new Date(), 'writedate');

    /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedInverterList = webUtil.refineSelectedInverterList(validInverterStatus);
    // BU.CLI(refinedInverterList);

    let inverterHistory = await biModule.getInverterHistory();
    // BU.CLI(inverterHistory);

    let chartDataObj = {
      range: [],
      series: []
    };
    _.each(inverterHistory, (statusObj, ivtSeq) => {
      let findObj = _.findWhere(inverterStatus, {
        inverter_seq: Number(ivtSeq)
      });
      let addObj = {
        name: findObj ? findObj.target_name : '',
        data: _.pluck(statusObj, 'out_w')
      };
      chartDataObj.range = _.pluck(statusObj, 'hour_time');
      chartDataObj.series.push(addObj);
    });

    req.locals.inverterStatus = refinedInverterList;
    req.locals.chartDataObj = chartDataObj;
    req.locals.powerInfo = {
      measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
    };

    // BU.CLI(req.locals);

    return res.render('./inverter/inverter.html', req.locals);
  }));


  router.use(wrap(async (err, req, res, next) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));

  return router;
};