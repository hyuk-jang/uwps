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
    req.locals = DU.makeBaseHtml(req, 5);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {


    // let deviceSeq = !isNaN(req.query.device_seq) && req.query.device_seq !== '' ? [Number(req.query.device_seq)] : _.pluck(connectorList.connector_seq);
    // let deviceType = req.query.device_type ? req.query.device_type : 'inverter';

    // if(deviceType === 'inverter'){
    //   getInverterChart();
    // } else if(deviceType === 'connector'){
    //   getInverterChart();
    // }


    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    let upsasProfile = await biModule.getTable('v_upsas_profile');
    let connectorList = await biModule.getTable('connector');

    let param_connector_seq = req.query.device_seq;

    BU.CLI(param_connector_seq, connectorList);
    let connectorSeqList = !isNaN(param_connector_seq) && param_connector_seq !== '' ? [Number(req.query.connector_seq)] : _.pluck(connectorList, 'connector_seq');
    BU.CLI(connectorSeqList);
    let moduleSeqList = [];
    _.each(connectorSeqList, seq => {
      let moduleList = _.where(upsasProfile, {connector_seq:seq});
      moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []) ;
    });
    moduleSeqList = _.union(moduleSeqList);
    BU.CLI(moduleSeqList);

    /** 모듈 데이터 가져옴 */
    let moduleHistory =  await biModule.getModuleHistory(moduleSeqList, searchRange);
    /** searchRange를 기준으로 검색 Column Date를 정함  */
    let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    let chartData = webUtil.makeStaticChartData(moduleHistory, betweenDatePoint, 'total_wh', 'group_date', 'photovoltaic_seq');
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartOption = webUtil.makeChartOption(searchRange);
    connectorList.unshift({
      connector_seq: 'all',
      target_name: '모두'
    });

    req.locals.chartData = chartData;
    req.locals.chartOption = chartOption;

    // BU.CLI(gridChartReport)
    req.locals.searchType = searchType;
    req.locals.connector_seq = param_connector_seq == null ? 'all' : Number(param_connector_seq);
    req.locals.connectorList = connectorList;
    req.locals.searchRange = searchRange;

    return res.render('./trend/trend.html', req.locals);
  }));

  /** 장비 종류에 맞는 장비 선택 Select Box 돌려줌 */
  router.get('/sub-list/:devicetype', wrap(async (req, res) => {
    const devicetype = req.params.devicetype;
    let returnValue = null;
    let returnValue1 = [{seq: 1, target_name: '111'}];
    let returnValue2 = [{seq: 2, target_name: '222'}];
    let returnValue3 = [{seq: 3, target_name: '333'}];
    if(devicetype === 'all'){
      returnValue = returnValue1;
    } else if(devicetype === 'inverter'){
      returnValue = returnValue2;
    } else if(devicetype === 'connector'){
      returnValue = returnValue3;
    }  else {
      return res.status(400).send([]);
    }

    return res.status(200).send(returnValue);
  }));


  function getInverterChart() {

  }

  function getConnectorChart(){

  }


  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};