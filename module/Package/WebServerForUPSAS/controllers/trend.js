const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

/**
 * searchRange Type
 * @typedef {Object} searchRange
 * @property {string} searchType day, month, year, range
 * @property {string} strStartDate sql writedate range 사용
 * @property {string} strEndDate sql writedate range 사용
 * @property {string} rangeStart Chart 위에 표시될 시작 날짜
 * @property {string} rangeEnd Chart 위에 표시될 종료 날짜
 * @property {string} strStartDateInputValue input[type=text] 에 표시될 시작 날짜
 * @property {string} strEndDateInputValue input[type=text] 에 표시될 종료 날짜
 */

/**
 * @typedef {{range: [], series: Array.<{name: string, data: []}>}} chartData 차트 그리기 위한 데이터 형태
 */


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
    let deviceType = req.query.device_type ? req.query.device_type : 'all';
    BU.CLI(req.query.device_seq);
    let deviceSeq = !isNaN(req.query.device_seq) && req.query.device_seq !== '' ? Number(req.query.device_seq) : 'all';
    let deviceListType = req.query.device_list_type === undefined ? 'all' : Number(req.query.device_list_type);
    BU.CLIS(deviceSeq, deviceListType, req.query.device_list_type);
    // let param_connector_seq = req.query.device_seq;
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    searchRange.searchType = searchType === 'range' ? biModule.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;


    let upsasProfile = await biModule.getTable('v_upsas_profile');
    /** searchRange를 기준으로 검색 Column Date를 정함  */
    let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    
    let deviceList = await getDeviceList(deviceType);
    let inverterChart = {range: [], series: []};
    let connectorChart = {range: [], series: []};
    if(deviceType === 'all'){
      if(deviceListType === 'all' || deviceListType === 'inverter'){
        inverterChart = await getInverterChart(deviceSeq, searchRange, betweenDatePoint);
      }
      if(deviceListType === 'all' || deviceListType === 'connector'){
        connectorChart = await getConnectorChart(deviceSeq, searchRange, betweenDatePoint, upsasProfile);
      }
    } else if (deviceType === 'inverter'){
      inverterChart = await getInverterChart(deviceSeq, searchRange, betweenDatePoint);
    } else if(deviceType === 'connector'){
      connectorChart = await getConnectorChart(deviceSeq, searchRange, betweenDatePoint, upsasProfile);
    }
    
    let chartData = {range: betweenDatePoint.shortTxtPoint, series: []};
    
    chartData.series = inverterChart.series.concat(connectorChart.series);
    
    // BU.CLI(inverterChart);
    // BU.CLI(connectorChart);
    
    // BU.CLI(chartData);

    
    // return;
    
    // // getInverterChart('all',upsasProfile, searchRange );
    // // getConnectorChart(param_connector_seq,upsasProfile, searchRange );
    // let connectorList = await biModule.getTable('connector');
    // BU.CLI(param_connector_seq, connectorList);
    // let connectorSeqList = !isNaN(param_connector_seq) && param_connector_seq !== '' ? [Number(param_connector_seq)] : _.pluck(connectorList, 'connector_seq');
    // BU.CLI(connectorSeqList);
    // let moduleSeqList = [];
    // _.each(connectorSeqList, seq => {
    //   let moduleList = _.where(upsasProfile, {connector_seq:seq});
    //   moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []) ;
    // });
    // moduleSeqList = _.union(moduleSeqList);
    // // BU.CLI(moduleSeqList);

    // /** 모듈 데이터 가져옴 */
    // let moduleHistory =  await biModule.getModuleHistory(moduleSeqList, searchRange);
    // /** searchRange를 기준으로 검색 Column Date를 정함  */
    // // let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    // /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    // // let chartData = webUtil.makeStaticChartData(moduleHistory, betweenDatePoint, 'total_wh', 'group_date', 'photovoltaic_seq');
    // /** Grouping Chart에 의미있는 이름을 부여함. */
    // webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    // /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    // webUtil.applyScaleChart(chartData, searchRange.searchType);
    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartOption = webUtil.makeChartOption(searchRange);
    // connectorList.unshift({
    //   connector_seq: 'all',
    //   target_name: '모두'
    // });

    let device_type_list = [
      {type: 'all', name: '전체'},
      {type: 'inverter', name: '인버터'},
      {type: 'connector', name: '접속반'}
    ];

    let searchOption = {
      device_type_list: device_type_list,
      device_type: deviceType,
      device_seq:  deviceSeq,
      device_list: deviceList,
      search_range: searchRange,
      search_type: searchType
    };
    // BU.CLI(searchOption);
    req.locals.searchOption = searchOption;
    req.locals.chartData = chartData;
    req.locals.chartOption = chartOption;

    // BU.CLI(gridChartReport)
    req.locals.searchType = searchType;
    req.locals.device_seq = deviceSeq == null ? 'all' : Number(deviceSeq);
    req.locals.deviceType = deviceType;
    req.locals.deviceList = deviceList;
    req.locals.searchRange = searchRange;

    return res.render('./trend/trend.html', req.locals);
  }));

  /** 장비 종류에 맞는 장비 선택 Select Box 돌려줌 */
  router.get('/sub-list/:devicetype', wrap(async (req, res) => {
    const devicetype = req.params.devicetype ? req.params.devicetype : 'all';
    let deviceList =  await getDeviceList(devicetype);

    return res.status(200).send(deviceList);
  }));

  /**
   * 장치 타입 종류 가져옴
   * @param {string} deviceType 장치 타입
   */
  async function getDeviceList(deviceType) {
    let returnValue = [];

    returnValue.unshift({
      type: 'all',
      seq: 'all',
      target_name: '전체'
    });

    deviceType = deviceType ? deviceType : 'all';
    if (deviceType === 'all' || deviceType === 'inverter') {
      let inverterList = await biModule.getTable('inverter');
      _.each(inverterList, info => {
        returnValue.push({type: 'inverter', seq: info.inverter_seq, target_name: info.target_name});
      });
    } 
    
    if (deviceType === 'all' || deviceType === 'connector') {
      let connectorList = await biModule.getTable('connector');
      _.each(connectorList, info => {
        returnValue.push({type: 'connector', seq: info.connector_seq, target_name: info.target_name});
      });
    }
    return returnValue;
  }


  /**
   *
   * @param {number|string} inverter_seq
   * @param {searchRange} searchRange
   * @param {{fullTxtPoint: [], shortTxtPoint: []}}
   * @return {chartData} chartData
   */
  async function getInverterChart(inverter_seq, searchRange, betweenDatePoint) {
    // BU.CLIS(inverter_seq, searchRange, betweenDatePoint);
    inverter_seq = inverter_seq == null || inverter_seq === 'all' ? 'all' : Number(inverter_seq);
    // searchRange = biModule.getSearchRange('day', '2018-02-17', '2018-02-18');
    // searchRange.searchInterval = 'day';
    // searchRange.searchType = 'hour';
    searchRange.page = Number(1);
    searchRange.pageListCount = 20;


    let viewInverterStatus = await biModule.getTable('v_inverter_status');

    let inverterReport = await biModule.getInverterReportChart(searchRange, inverter_seq);
    // BU.CLI(inverterReport);

    // let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    let chartData = webUtil.makeStaticChartData(inverterReport, betweenDatePoint, 'interval_wh', 'group_date', 'inverter_seq');
    // let chartData = webUtil.makeStaticChartData(inverterReport, 'interval_wh', 'group_date', 'inverter_seq');
    // BU.CLI(chartData);
    webUtil.mappingChartDataName(chartData, viewInverterStatus, 'inverter_seq', 'target_name');
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);
    return chartData;
  }

  /**
   * 
   * @param {number|string} param_connector_seq 
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}}
   * @param {Array.<{}>} upsasProfile 
   * @return {chartData} chartData
   */
  async function getConnectorChart(param_connector_seq, searchRange, betweenDatePoint, upsasProfile){
    // searchRange = biModule.getSearchRange('range', '2018-02-10', '2018-02-14');
    // BU.CLI(searchRange);
    let connectorList = await biModule.getTable('connector');
    // BU.CLI(param_connector_seq, connectorList);
    let connectorSeqList = !isNaN(param_connector_seq) && param_connector_seq !== '' ? [Number(param_connector_seq)] : _.pluck(connectorList, 'connector_seq');
    // BU.CLI(connectorSeqList);
    let moduleSeqList = [];
    _.each(connectorSeqList, seq => {
      let moduleList = _.where(upsasProfile, {connector_seq:seq});
      moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []) ;
    });
    moduleSeqList = _.union(moduleSeqList);
    // BU.CLI(moduleSeqList);

    /** 모듈 데이터 가져옴 */
    let moduleHistory =  await biModule.getModuleHistory(moduleSeqList, searchRange);
    // BU.CLI(moduleHistory);
    /** searchRange를 기준으로 검색 Column Date를 정함  */
    // let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    let chartData = webUtil.makeStaticChartData(moduleHistory, betweenDatePoint, 'total_wh', 'group_date', 'photovoltaic_seq');
    // BU.CLI(chartData);
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);

    return chartData;
  }


  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};