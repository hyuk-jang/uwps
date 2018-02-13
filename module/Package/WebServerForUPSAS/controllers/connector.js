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
    /** 접속반 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedConnectorList = webUtil.refineSelectedConnectorList(upsasProfile, connector_seq);
    // 접속반에 물려있는 모듈 seq 정의
    let moduleSeqList = _.pluck(refinedConnectorList, 'photovoltaic_seq');
    // 모듈 현황
    let moduleStatusList = await biModule.getTable('v_module_status', 'photovoltaic_seq', moduleSeqList);
    // BU.CLI(moduleStatusList);
    // 모듈 발전 현황 데이터 검증
    let validModuleStatusList = webUtil.checkDataValidation(moduleStatusList, new Date(), 'writedate');

    // 모듈 데이터 삽입
    validModuleStatusList.forEach(validInfo => {
      let hasOperation = validInfo.hasValidData;
      // let hasOperation = true;
      let amp = validInfo.data.amp;
      let vol = validInfo.data.vol;

      let findIt = _.findWhere(refinedConnectorList, { photovoltaic_seq: validInfo.data.photovoltaic_seq });
      findIt.hasOperation = hasOperation;
      findIt.amp = hasOperation ? amp  : '';
      findIt.vol = hasOperation ? vol  : '';
      findIt.power = hasOperation && _.isNumber(amp) && _.isNumber(vol) ? webUtil.calcValue(amp * vol, 1, 1)   : '';
    });
    refinedConnectorList = _.sortBy(refinedConnectorList, 'ivt_target_name');
    
    let connectorStatusData = webUtil.convertColumn2Rows(refinedConnectorList, ['connector_ch', 'install_place', 'ivt_target_name', 'pv_target_name', 'pv_manufacturer', 'amp', 'vol', 'power', 'temperature', 'hasOperation'], maxModuleViewNum);
    
    let totalAmp = webUtil.reduceDataList(refinedConnectorList, 'amp');
    totalAmp = _.isNumber(totalAmp) ? totalAmp.scale(1, 1) : '';
    let avgVol = webUtil.reduceDataList(refinedConnectorList, 'vol');
    avgVol = _.isNumber(avgVol) ? (avgVol / refinedConnectorList.length).scale(1, 1) : '';


    // 금일 접속반 발전량 현황
    let todayModuleReport = await biModule.getTodayConnectorReport(moduleSeqList);
    // BU.CLI(todayModuleReport);
    let chartData = webUtil.makeDynamicChartData(todayModuleReport, 'wh', 'hour_time', 'photovoltaic_seq');

    chartData.series.forEach(chart => {
      let upsasInfo = _.findWhere(upsasProfile, {
        photovoltaic_seq: Number(chart.name)
      });
      chart.name = `${upsasInfo.cnt_target_name} CH ${upsasInfo.connector_ch} `;
    });
    chartData.series = _.sortBy(chartData.series, 'ivt_target_name');

    let connectorList = await biModule.getTable('connector');
    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    });

    /** 실시간 접속반 데이터 리스트 */
    req.locals.connectorStatusData = connectorStatusData;
    /** 접속반 SelectBox  */
    req.locals.connectorList = connectorList;
    /** 선택 접속반 seq */
    req.locals.connector_seq = connector_seq;
    req.locals.gridInfo = {
    // 총전류, 전압, 보여줄 컬럼 개수
      totalAmp,
      avgVol,
      maxModuleViewNum,
      measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
      // measureTime: _.first(moduleStatusList) ? BU.convertDateToText(_.first(moduleStatusList).writedate) : ''
    };
    // 모듈 상태값들 가지고 있는 배열
    req.locals.moduleStatusList = refinedConnectorList;
    // 금일 발전 현황
    req.locals.chartDataObj = chartData;

    return res.render('./connector/connect.html', req.locals);
  }));

  router.use(wrap(async (err, req, res, next) => {
    console.trace(err);
    res.status(500).send(err);
  }));

  return router;
};