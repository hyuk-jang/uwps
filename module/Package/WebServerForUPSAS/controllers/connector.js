const wrap = require('express-async-wrap');
let router = require('express').Router();

let BU = require('base-util-jh').baseUtil;
let DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 3);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    // BU.CLI('connector', req.locals);
    // upsas 현황
    let upsasProfile = await biModule.getTable('v_upsas_profile')
    // 접속반 리스트
    let connectorList = _.groupBy(upsasProfile, profile => profile.connector_seq);
    // 선택된 접속반 seq 정의
    let connector_seq = req.query.connector_seq ? Number(req.query.connector_seq) : Number(_.first(Object.keys(connectorList)));
    // 접속반에 물려있는 모듈 seq 정의
    let moduleSeqList = _.sortBy(_.pluck(connectorList[connector_seq], 'photovoltaic_seq'), 'connector_ch');
    // 모듈 현황
    let moduleStatusList = await biModule.getTable('v_module_status', 'photovoltaic_seq', moduleSeqList, true);
    // 금일 접속반 발전량 현황
    let todayModuleReport = await biModule.getModuleReportForConnector(moduleSeqList);
    todayModuleReport = _.groupBy(todayModuleReport, 'photovoltaic_seq');

    // 차트 데이터로 변환
    let chartRange = [];
    let reportSeries = _.map(todayModuleReport, (moduleDataObj, moduleKey) => {
      let addObj = {
        name: '',
        data: []
      };
      let upsasInfo = _.findWhere(upsasProfile, {
        photovoltaic_seq: moduleKey
      });
      if (_.isEmpty(upsasInfo)) {
        return addObj;
      }
      addObj.name = `CH_${upsasInfo.connector_ch} ${upsasInfo.pv_target_name}`
      addObj.data = _.pluck(moduleDataObj, 'wh');
      chartRange = _.pluck(moduleDataObj, 'hour_time');
      return addObj;
    })

    let chartDataObj = {
      range: chartRange,
      series: reportSeries
    }


    // return;
    let ampList = _.pluck(moduleStatusList, 'amp');
    let volList = _.pluck(moduleStatusList, 'vol');

    let totalAmp = _.reduce(ampList, (accumulator, currentValue) => accumulator + currentValue);
    let vol = _.reduce(volList, (accumulator, currentValue) => accumulator + currentValue) / volList.length;

    // 접속반 리스트
    req.locals.connectorList = connectorList;
    req.locals.connector_seq = connector_seq;
    req.locals.gridInfo = {
      // 총전류, 전압, 보여줄 컬럼 개수
      totalAmp,
      vol,
      maxModuleViewNum: 8,
      measureTime: _.first(moduleStatusList) ? BU.convertDateToText(_.first(moduleStatusList).writedate) : ''
    }
    // 모듈 상태값들 가지고 있는 배열
    req.locals.moduleStatusList = moduleStatusList;
    // 금일 발전 현황
    req.locals.chartDataObj = chartDataObj;

    return res.render('./connector/connect.html', req.locals);
  }));


  router.use(wrap(async(err, req, res, next) => {
    console.trace(err);
    res.status(500).send(err);
  }));

  return router;
}