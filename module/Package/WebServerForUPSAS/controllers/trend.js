const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');
let excelUtil = require('../models/excel.util');

// TEST
const tempSacle = require('../temp/tempSacle');

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
   * @property {string} strBetweenStart static chart 범위를 표현하기 위한 시작 날짜
   * @property {string} strBetweenEnd static chart 범위를 표현하기 위한 종료 날짜
   */

/**
 * @typedef {{range: [], series: Array.<{name: string, data: []}>}} chartData 차트 그리기 위한 데이터 형태
 */

const defaultRangeFormat = 'min10';
module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 5);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async (req, res) => {
    
    // 장비 종류 여부 (전체, 인버터, 접속반)
    let deviceType = req.query.device_type === 'inverter' || req.query.device_type === 'connector' ? req.query.device_type : req.query.device_type === undefined ? 'inverter' : 'all';
    // 장비 선택 타입 (전체, 인버터, 접속반)
    let deviceListType = req.query.device_list_type === 'inverter' || req.query.device_list_type === 'connector' ? req.query.device_list_type : 'all';
    // 장비 선택 seq (all, number)
    let deviceSeq = !isNaN(req.query.device_seq) && req.query.device_seq !== '' ? Number(req.query.device_seq) : 'all';
    // BU.CLIS(deviceType, deviceListType, deviceSeq);
    // Search 타입을 지정
    let searchType = req.query.search_type ? req.query.search_type : defaultRangeFormat;
    // 지정된 SearchType으로 설정 구간 정의
    let searchRange = biModule.getSearchRange(searchType, req.query.start_date, req.query.end_date);
    // BU.CLI(searchRange);
    // 검색 조건이 기간 검색이라면 검색 기간의 차를 구하여 실제 searchType을 구함.
    if (searchType === 'range') {
      let realSearchType = searchType === 'range' ? biModule.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate) : searchType;
      if (realSearchType === 'hour') {
        searchRange = biModule.getSearchRange(defaultRangeFormat, req.query.start_date, req.query.end_date);
      } else {
        searchRange.searchInterval = searchRange.searchType = realSearchType;
      }
    }
    // BU.CLIS(req.query, searchRange);

    // 장비 선택 리스트 가져옴
    let deviceList = await biModule.getDeviceList(deviceType);
    // BU.CLI(deviceList);

    let device_type_list = [
      { type: 'all', name: '전체' },
      { type: 'inverter', name: '인버터' },
      { type: 'connector', name: '접속반' }
    ];

    // 차트 제어 및 자질 구래한 데이터 모음
    let searchOption = {
      device_type: deviceType,
      device_type_list: device_type_list,
      device_list_type: deviceListType,
      device_seq: deviceSeq,
      device_list: deviceList,
      search_range: searchRange,
      search_type: searchType
    };
    // BU.CLI(searchOption);

    /** searchRange를 기준으로 검색 Column Date를 정함  */
    let betweenDatePoint = BU.getBetweenDatePoint(searchRange.strBetweenEnd, searchRange.strBetweenStart, searchRange.searchInterval);
    // BU.CLI(betweenDatePoint);
    // 인버터 차트
    let {gridKwChartData, inverterPowerChartData} = await getInverterChart(searchOption, searchRange, betweenDatePoint);
    
    // BU.CLI(inverterChart);
    // 접속반 차트
    let connectorChart = await getConnectorChart(searchOption, searchRange, betweenDatePoint);
    // 차트 Range 지정
    let powerChartData = { range: betweenDatePoint.shortTxtPoint, series: [] };
    // 차트 합침
    // BU.CLI(inverterPowerChartData);
    powerChartData.series = inverterPowerChartData.series.concat(connectorChart.series);

    // BU.CLI(chartData);

    // /** 차트를 표현하는데 필요한 Y축, X축, Title Text 설정 객체 생성 */
    let chartDecoration = webUtil.makeChartDecoration(searchRange);

    let weatherChartData = await getWeatherChart(searchRange, betweenDatePoint);


    let createExcelOption = {
      powerChartData, 
      gridKwChartData,
      powerChartDecoration: chartDecoration, 
      weatherChartData, 
      searchRange
    };


    let excelContents = excelUtil.makeChartDataToWorkBook(createExcelOption);
    // BU.CLI(chartDecoration);
    // BU.CLI(chartOption);
    req.locals.searchOption = searchOption;
    req.locals.powerChartData = powerChartData;
    req.locals.chartDecorator = chartDecoration;
    req.locals.weatherChartData = weatherChartData;
    req.locals.workBook = excelContents;
    return res.render('./trend/trend.html', req.locals);
  }));

  /** 장비 종류에 맞는 장비 선택 Select Box 돌려줌 */
  router.get('/sub-list/:devicetype', wrap(async (req, res) => {
    const devicetype = req.params.devicetype ? req.params.devicetype : 'all';
    let deviceList = await biModule.getDeviceList(devicetype);

    return res.status(200).send(deviceList);
  }));

  /**
   * 인버터 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   * @return {{inverterPowerChartData: chartData, gridKwChartData: chartData}} chartData
   */
  async function getInverterChart(searchOption, searchRange, betweenDatePoint) {
    let inverterPowerChartData = { range: [], series: [] };
    let gridKwChartData = { range: [], series: [] };
    let returnValue = {inverterPowerChartData, gridKwChartData};
    // 장비 종류가 접속반, 장비 선택이 전체라면 즉시 종료
    if (searchOption.device_type === 'connector' && searchOption.device_list_type === 'all') {
      return returnValue;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if (searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'inverter') {
      return returnValue;
    }

    let device_seq = !isNaN(searchOption.device_seq) ? Number(searchOption.device_seq) : 'all';
    // TEST
    // searchRange = biModule.getSearchRange('day', '2018-02-17', '2018-02-18');
    // searchRange.searchType = 'hour';
    // TODO 인버터 모듈 이름을 가져오기 위한 테이블. 성능을 위해서라면 다른 쿼리문 작성 사용 필요
    let viewInverterStatus = await biModule.getTable('v_inverter_status');
    // 인버터 차트 데이터 불러옴
    let inverterTrend = await biModule.getInverterTrend(searchRange, device_seq);
    // BU.CLI(inverterTrend);


    // 하루 데이터(10분 구간)는 특별히 데이터를 정제함.
    if (searchRange.searchType === 'min' || searchRange.searchType === 'min10' || searchRange.searchType === 'hour') {
      let maxRequiredDateSecondValue = 0;
      switch (searchRange.searchType) {
      case 'min':
        maxRequiredDateSecondValue = 120;
        break;
      case 'min10':
        maxRequiredDateSecondValue = 1200;
        break;
      case 'hour':
        maxRequiredDateSecondValue = 7200;
        break;
      default:
        break;
      }
      let calcOption = {
        calcMaxKey: 'max_c_wh',
        calcMinKey: 'min_c_wh',
        resultKey: 'interval_wh',
        groupKey: 'inverter_seq',
        rangeOption: {
          dateKey: 'group_date',
          maxRequiredDateSecondValue,
          minRequiredCountKey: 'total_count',
          minRequiredCountValue: 9
        }
      };
      webUtil.calcRangePower(inverterTrend, calcOption);
    }
    // BU.CLI(inverterTrend);

    webUtil.addKeyToReport(inverterTrend, viewInverterStatus, 'target_id', 'inverter_seq');
    webUtil.addKeyToReport(inverterTrend, viewInverterStatus, 'target_name', 'inverter_seq');

    let chartOption = { selectKey: 'interval_wh', maxKey: 'max_c_wh', minKey: 'min_c_wh', dateKey: 'group_date', groupKey: 'target_id', colorKey: 'chart_color', sortKey: 'chart_sort_rank' };
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    inverterPowerChartData =  webUtil.makeStaticChartData(inverterTrend, betweenDatePoint, chartOption);
    tempApplyScaleInverter(inverterPowerChartData);
    chartOption = { selectKey: 'avg_out_w', maxKey: 'max_c_wh', minKey: 'min_c_wh', dateKey: 'group_date', groupKey: 'target_id', colorKey: 'chart_color', sortKey: 'chart_sort_rank' };
    // BU.CLI(inverterTrend);
    gridKwChartData =  webUtil.makeStaticChartData(inverterTrend, betweenDatePoint, chartOption);
    // BU.CLI(gridKwChartData);
    tempApplyScaleInverter(gridKwChartData);


    // BU.CLI(chartData.series[3]);

    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataName(inverterPowerChartData, viewInverterStatus, 'target_id', 'target_name');
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(inverterPowerChartData, searchRange.searchType);
    // BU.CLI(chartData);

    
    // BU.CLI(excelContents)
    return {inverterPowerChartData, gridKwChartData};
  }

  /**
   * 접속반 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}}
   * @return {chartData} chartData
   */
  async function getConnectorChart(searchOption, searchRange, betweenDatePoint) {
    let chartData = { range: [], series: [] };

    // 장비 종류가 인버터, 장비 선택이 전체라면 즉시 종료
    if (searchOption.device_type === 'inverter' && searchOption.device_list_type === 'all') {
      return chartData;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if (searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'connector') {
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
    let connectorSeqList = !isNaN(searchOption.device_seq) ? [Number(searchOption.device_seq)] : _.pluck(connectorList, 'connector_seq');
    // 선택한 접속반에 물려있는 모듈의 seq를 배열에 저장
    let moduleSeqList = [];
    _.each(connectorSeqList, seq => {
      let moduleList = _.where(upsasProfile, { connector_seq: seq });
      moduleSeqList = moduleSeqList.concat(moduleList.length ? _.pluck(moduleList, 'photovoltaic_seq') : []);
    });
    // 혹시나 중복된 seq가 있다면 중복 제거
    moduleSeqList = _.union(moduleSeqList);
    // BU.CLI(moduleSeqList);

    /** 모듈 데이터 가져옴 */
    let connectorTrend = await biModule.getConnectorTrend(moduleSeqList, searchRange);
    // BU.CLI(connectorTrend);

    let chartOption = { selectKey: 'total_wh', dateKey: 'group_date', groupKey: 'photovoltaic_seq', colorKey: 'chart_color', sortKey: 'chart_sort_rank' };
    
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    chartData = webUtil.makeStaticChartData(connectorTrend, betweenDatePoint, chartOption);

    // BU.CLI(chartData);

    /* Scale 적용 */
    chartData.series.forEach(currentItem => {
      let foundIt = _.findWhere(tempSacle.moduleScale, { photovoltaic_seq: Number(currentItem.name) });
      currentItem.scale = foundIt.scale;
      currentItem.data.forEach((data, index) => {
        currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
      });
    });


    // BU.CLI(chartData);
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);

    return chartData;
  }


  /**
   * 기상 관측 차트 반환
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   * @return {chartData} chartData
   */
  async function getWeatherChart(searchRange, betweenDatePoint){

    let weatherTrend = await biModule.getWeatherTrend(searchRange);
    // BU.CLI(weatherTrend);

    let chartOptionList= [
      { name: '일사량(W/m²)',color: 'black', yAxis:1,  selectKey: 'avg_solar', dateKey: 'group_date'},
      { name: '기온(℃)', color: 'red', yAxis:0, selectKey: 'avg_temp', maxKey: 'avg_temp', minKey: 'avg_temp', averKey: 'avg_temp', dateKey: 'group_date'},
      { name: '풍향', color: 'brown', yAxis:0, selectKey: 'avg_wd', dateKey: 'group_date'},
      { name: '풍속(m/s)', color: 'purple', yAxis:0, selectKey: 'avg_ws', dateKey: 'group_date'},
      { name: '습도(%)', color: 'green', yAxis:0, selectKey: 'avg_reh', dateKey: 'group_date'},
      { name: '자외선(uv)', color: 'skyblue', yAxis:0, selectKey: 'avg_uv', dateKey: 'group_date'},
    ];

    let chartData = { range: betweenDatePoint.shortTxtPoint , series: [] };
    
    chartOptionList.forEach(chartOption => {
      let staicChart =  webUtil.makeStaticChartData(weatherTrend, betweenDatePoint, chartOption);
      let chart =_.first(staicChart.series); 
      chart.name = chartOption.name;
      chart.color = chartOption.color;
      chart.yAxis = chartOption.yAxis;
      
      chartData.series.push(chart);
    });

   
    // BU.CLI(chartData);
    return chartData;
  }

  /**
   * Scale 적용
   * @param {chartData} chartData 
   */
  function tempApplyScaleInverter(chartData){
    chartData.series.forEach(currentItem => {
      let foundIt = _.findWhere(tempSacle.inverterScale, { target_id: currentItem.name });
      currentItem.option.scale = foundIt.scale;
      currentItem.data.forEach((data, index) => {
        currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
      });
    });
  }


  router.use(wrap(async (err, req, res) => {
    console.log('Err', err);
    res.status(500).send(err);
  }));

  return router;
};