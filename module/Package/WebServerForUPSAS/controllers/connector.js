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
  // CH 보여줄 최대 갯수
  const maxModuleViewNum = 8;

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 3);
    next();
  });

  // Get
  router.get('/', wrap(async (req, res) => {
    // BU.CLI('connector', req.locals);
    // upsas 현황
    let upsasProfile = await biModule.getTable('v_upsas_profile');
    // 선택된 접속반 seq 정의
    let connector_seq = req.query.connector_seq == null || req.query.connector_seq === 'all' ? 'all' : Number(req.query.connector_seq);
    let refinedConnectorList = webUtil.refineSelectedConnectorList(upsasProfile, connector_seq);
    // 접속반에 물려있는 모듈 seq 정의
    let moduleSeqList = _.pluck(refinedConnectorList, 'photovoltaic_seq');
    // 모듈 현황
    let moduleStatusList = await biModule.getTable('v_module_status', 'photovoltaic_seq', moduleSeqList);
    // BU.CLI(moduleStatusList);
    // 모듈 발전 현황 데이터 검증
    let validModuleStatusList = webUtil.checkDataValidation(moduleStatusList, new Date(), 'writedate');

    // 모듈 데이터 삽입
    validModuleStatusList.forEach(vaildInfo => {
      // let hasOperation = vaildInfo.hasValidData;
      let hasOperation = true;
      let amp = vaildInfo.data.amp;
      let vol = vaildInfo.data.vol;

      let findIt = _.findWhere(refinedConnectorList, { photovoltaic_seq: vaildInfo.data.photovoltaic_seq });
      findIt.hasOperation = hasOperation;
      findIt.amp = hasOperation ? amp  : '';
      findIt.vol = hasOperation ? vol  : '';
      findIt.power = hasOperation && _.isNumber(amp) && _.isNumber(vol) ? webUtil.calcValue(amp * vol, 1, 1)   : '';
    });

    let connectorStatusData = webUtil.convertColumn2Rows(refinedConnectorList, ['connector_ch', 'install_place', 'ivt_target_name', 'pv_target_name', 'pv_manufacturer', 'amp', 'vol', 'power', 'temperature', 'hasOperation'], maxModuleViewNum);
    let totalAmp = _.reduce(_.pluck(refinedConnectorList, 'amp'), (accumulator, currentValue) => accumulator + currentValue);
    totalAmp = _.isNumber(totalAmp) ? totalAmp.scale(1, 1) : '';
    let avgVol = _.reduce(_.pluck(refinedConnectorList, 'vol'), (accumulator, currentValue) => accumulator + currentValue);
    avgVol = _.isNumber(avgVol) ? (avgVol / refinedConnectorList.length).scale(1, 1) : '';


    // 금일 접속반 발전량 현황
    let todayModuleReport = await biModule.getTodayConnectorReport(moduleSeqList);
    todayModuleReport = _.groupBy(todayModuleReport, 'photovoltaic_seq');

    // 차트 데이터로 변환
    let chartRange = [];
    let reportSeries = _.map(todayModuleReport, (moduleDataObj, moduleKey) => {
      let addObj = {
        name: '',
        data: []
      };
      let upsasInfo = _.findWhere(upsasProfile, {
        photovoltaic_seq: Number(moduleKey)
      });
      if (_.isEmpty(upsasInfo)) {
        return addObj;
      }
      addObj.name = `CH_${upsasInfo.connector_ch} ${upsasInfo.pv_target_name}`;
      addObj.data = _.pluck(moduleDataObj, 'wh');
      chartRange = _.pluck(moduleDataObj, 'hour_time');
      return addObj;
    });

    let chartDataObj = {
      range: chartRange,
      series: reportSeries
    };

    let connectorList = await biModule.getTable('connector');
    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    });

    // 접속반 리스트
    req.locals.connectorStatusData = connectorStatusData;
    req.locals.connectorList = connectorList;
    req.locals.connector_seq = connector_seq;
    req.locals.gridInfo = {
    // 총전류, 전압, 보여줄 컬럼 개수
      totalAmp,
      avgVol,
      maxModuleViewNum,
      measureTime: _.first(moduleStatusList) ? BU.convertDateToText(_.first(moduleStatusList).writedate) : ''
    };
    // 모듈 상태값들 가지고 있는 배열
    req.locals.moduleStatusList = refinedConnectorList;
    // 금일 발전 현황
    req.locals.chartDataObj = chartDataObj;

    return res.render('./connector/connect.html', req.locals);
  }));

  router.use(wrap(async (err, req, res, next) => {
    console.trace(err);
    res.status(500).send(err);
  }));

  return router;
};