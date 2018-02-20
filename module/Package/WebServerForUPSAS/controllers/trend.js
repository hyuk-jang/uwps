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
    // 장비 종류 여부 (전체, 인버터, 접속반)
    let deviceType = req.query.device_type === 'inverter' || req.query.device_type === 'connector' ? req.query.device_type : req.query.device_type === undefined ? 'inverter' : 'all';
    // 장비 선택 타입 (전체, 인버터, 접속반)
    let deviceListType = req.query.device_list_type === 'inverter' || req.query.device_list_type === 'connector' ? req.query.device_list_type : 'all';
    // 장비 선택 seq (all, number)
    let deviceSeq = !isNaN(req.query.device_seq) && req.query.device_seq !== '' ? Number(req.query.device_seq) : 'all';
    // BU.CLIS(deviceType, deviceListType, deviceSeq);
    let searchType = req.query.search_type ? req.query.search_type : 'hour';
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    searchRange.searchType = searchType === 'range' ? biModule.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;

    // 장비 선택 리스트 가져옴
    let deviceList = await biModule.getDeviceList(deviceType);

    let device_type_list = [
      {type: 'all', name: '전체'},
      {type: 'inverter', name: '인버터'},
      {type: 'connector', name: '접속반'}
    ];

    // 차트 제어 및 자질 구래한 데이터 모음
    let searchOption = {
      device_type: deviceType,
      device_type_list: device_type_list,
      device_list_type: deviceListType,
      device_seq:  deviceSeq,
      device_list: deviceList,
      search_range: searchRange,
      search_type: searchType
    };
    // BU.CLI(searchOption);
    
    /** searchRange를 기준으로 검색 Column Date를 정함  */
    let betweenDatePoint =  BU.getBetweenDatePoint(searchRange.strEndDate, searchRange.strStartDate, searchRange.searchType);
    // 인버터 차트
    let inverterChart = await getInverterChart(searchOption, searchRange, betweenDatePoint);
    // BU.CLI(inverterChart);
    // 접속반 차트
    let connectorChart = await getConnectorChart(searchOption, searchRange, betweenDatePoint);
    // 차트 Range 지정
    let chartData = {range: betweenDatePoint.shortTxtPoint, series: []};
    // 차트 합침
    chartData.series = inverterChart.series.concat(connectorChart.series);
   
    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartOption = webUtil.makeChartOption(searchRange);
    
    // BU.CLI(chartOption);
    req.locals.searchOption = searchOption;
    req.locals.chartData = chartData;
    req.locals.chartOption = chartOption;

    return res.render('./trend/trend.html', req.locals);
  }));

  /** 장비 종류에 맞는 장비 선택 Select Box 돌려줌 */
  router.get('/sub-list/:devicetype', wrap(async (req, res) => {
    const devicetype = req.params.devicetype ? req.params.devicetype : 'all';
    let deviceList =  await biModule.getDeviceList(devicetype);

    return res.status(200).send(deviceList);
  }));

  /**
   * 인버터 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   * @return {chartData} chartData
   */
  async function getInverterChart(searchOption, searchRange, betweenDatePoint) {
    let chartData = {range: [], series: []};
    // 장비 종류가 접속반, 장비 선택이 전체라면 즉시 종료
    if(searchOption.device_type === 'connector' && searchOption.device_list_type === 'all'){
      return chartData;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if(searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'inverter'){
      return chartData;
    }
    
    let device_seq = !isNaN(searchOption.device_seq) ? Number(searchOption.device_seq) : 'all';
    // TEST
    // searchRange = biModule.getSearchRange('day', '2018-02-17', '2018-02-18');
    // searchRange.searchType = 'hour';
    // TODO 인버터 모듈 이름을 가져오기 위한 테이블. 성능을 위해서라면 다른 쿼리문 작성 사용 필요
    let viewInverterStatus = await biModule.getTable('v_inverter_status');
    // 인버터 차트 데이터 불러옴
    let inverterTrend = await biModule.getInverterTrend(device_seq, searchRange);
    // BU.CLI(inverterReport);

    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    chartData = webUtil.makeStaticChartData(inverterTrend, betweenDatePoint, 'interval_wh', 'group_date', 'inverter_seq');
    // BU.CLI(chartData);
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataName(chartData, viewInverterStatus, 'inverter_seq', 'target_name');
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);
    return chartData;
  }

  /**
   * 접속반 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}}
   * @return {chartData} chartData
   */
  async function getConnectorChart(searchOption, searchRange, betweenDatePoint){
    let chartData = {range: [], series: []};

    // 장비 종류가 인버터, 장비 선택이 전체라면 즉시 종료
    if(searchOption.device_type === 'inverter' && searchOption.device_list_type === 'all'){
      return chartData;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if(searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'connector'){
      return chartData;
    }

    // TEST
    // searchRange = biModule.getSearchRange('range', '2018-02-10', '2018-02-14');
    // TODO 접속반 모듈 이름을 가져오기 위한 테이블. 성능을 위해서라면 다른 쿼리문 작성 사용 필요
    let upsasProfile = await biModule.getTable('v_upsas_profile');
    // BU.CLI(searchRange);
    // 접속반 리스트 불러옴(선택한 접속반의 모듈을 가져오기 위함)
    let connectorList = await biModule.getTable('connector');
    // BU.CLIS(searchOption, connectorList);
    // 선택한 접속반 seq 정의
    let connectorSeqList =  !isNaN(searchOption.device_seq) ? [Number(searchOption.device_seq)] : _.pluck(connectorList, 'connector_seq');
    // 선택한 접속반에 물려있는 모듈의 seq를 배열에 저장
    let moduleSeqList = [];
    _.each(connectorSeqList, seq => {
      let moduleList = _.where(upsasProfile, {connector_seq:seq});
      moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []) ;
    });
    // 혹시나 중복된 seq가 있다면 중복 제거
    moduleSeqList = _.union(moduleSeqList);
    // BU.CLI(moduleSeqList);

    /** 모듈 데이터 가져옴 */
    let connectorTrend =  await biModule.getConnectorTrend(moduleSeqList, searchRange);
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    chartData = webUtil.makeStaticChartData(connectorTrend, betweenDatePoint, 'total_wh', 'group_date', 'photovoltaic_seq');
    // BU.CLI(chartData);
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);

    return chartData;
  }


  router.use(wrap(async(err, req, res) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};