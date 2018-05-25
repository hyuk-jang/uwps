const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 1);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async (req, res) => {
    // NOTE : SQL문의 수정이 잦아지는 관계로 대표 Method로 처리. 성능을 위해서라면 차후 튜닝 필요
    // 당월 발전량을 구하기 위한 옵션 설정 (strStartDate, strEndDate 를 당월로 설정하기 위함)

    // console.time('0');
    let searchRange = biModule.getSearchRange('day');
    // 검색 조건이 일 당으로 검색되기 때문에 금월 날짜로 date Format을 지정하기 위해 day --> month 로 변경
    searchRange.searchType = 'month';
    let inverterPowerByMonth = await biModule.getInverterPower(searchRange);
    let monthPower = webUtil.calcValue(webUtil.reduceDataList(inverterPowerByMonth, 'interval_power'), 0.001, 1) ;

    // 오늘자 발전 현황을 구할 옵션 설정(strStartDate, strEndDate 를 오늘 날짜로 설정하기 위함)
    // 검색 조건이 시간당으로 검색되기 때문에 금일 날짜로 date Format을 지정하기 위해 hour --> day 로 변경
    let cumulativePowerList = await biModule.getInverterCumulativePower();
    let cumulativePower = webUtil.calcValue(webUtil.reduceDataList(cumulativePowerList, 'max_c_wh'), 0.000001, 3) ;
    
    // console.timeEnd('0');
    // console.time('0.5');
    // 금일 발전 현황 데이터
    searchRange = biModule.getSearchRange('min10');
    // searchRange = biModule.getSearchRange('hour', '2018-03-10');

    let inverterTrend = await biModule.getInverterTrend(searchRange);

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
        resultKey: 'interval_power',
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

    let dailyPower = _.round(webUtil.reduceDataList(inverterTrend, 'interval_power') * 0.001, 2) ;
    
    let chartOption = { selectKey: 'interval_power', dateKey: 'view_date', hasArea: true };
    let chartData = webUtil.makeDynamicChartData(inverterTrend, chartOption);
    
    // BU.CLI(chartData);
    // BU.CLI(inverterPowerList);
    webUtil.applyScaleChart(chartData, 'day');
    webUtil.mappingChartDataName(chartData, '인버터 시간별 발전량');

    // console.timeEnd('0.5');

    // console.time('1');
    // 접속반 현재 발전 현황
    let moduleStatus = await biModule.getModuleStatus();
    moduleStatus = _.sortBy(moduleStatus, 'chart_sort_rank');
    // BU.CLI(moduleStatus);

    let weatherDeviceStatus = await biModule.getWeather();
    // 인버터 발전 현황 데이터 검증
    let validWeatherDeviceStatus = webUtil.checkDataValidation(weatherDeviceStatus, new Date(), 'writedate');
    let validWeatherDevice = _.head(validWeatherDeviceStatus);

    // TEST
    const tempSacle = require('../temp/tempSacle');   
    // TEST 구간
    moduleStatus.forEach(currentItem => {
      let foundIt = _.find(tempSacle.moduleScale, {photovoltaic_seq: currentItem.photovoltaic_seq}); 
      currentItem.vol = _.round(currentItem.vol * foundIt.scale, 1);
    });



    // 접속반 발전 현황 데이터 검증
    let validModuleStatusList = webUtil.checkDataValidation(moduleStatus, new Date(), 'writedate');
    validModuleStatusList.forEach(moduleInfo => {
      let moduleData = moduleInfo.data;
      moduleData.module_name = `${moduleData.install_place} ${moduleData.target_name} (${moduleData.module_type})`;
    });
    
    // console.timeEnd('1');
    // BU.CLI(validModuleStatusList);
    // console.time('2');
    let v_upsas_profile = await biModule.getTable('v_upsas_profile');
    // console.timeEnd('2');
    // 금일 발전 현황
    // 인버터 현재 발전 현황
    let inverterDataList = await biModule.getTable('v_inverter_status');
    // 인버터 발전 현황 데이터 검증
    let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

    // 설치 인버터 총 용량
    let pv_amount = _(v_upsas_profile).map('pv_amount').sum();
    let powerGenerationInfo = {
      currKw: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'out_w', false), 0.001, 3),
      currKwYaxisMax: _.round(_.multiply(pv_amount, 0.001)),
      dailyPower : dailyPower === '' ? 0 : dailyPower,
      monthPower,
      cumulativePower,
      co2: _.round(cumulativePower * 0.424, 3),
      solarRadiation : validWeatherDevice.hasValidData ? validWeatherDevice.data.solar : '-',
      hasOperationInverter: _.every(_.values(_.map(validInverterDataList, data => data.hasValidData))),
      hasAlarm: false // TODO 알람 정보 작업 필요
    };
    // BU.CLI(chartData);
    req.locals.dailyPowerChartData = chartData;
    req.locals.moduleStatusList = validModuleStatusList ;
    req.locals.powerGenerationInfo = powerGenerationInfo;

    // BU.CLI(validModuleStatusList);
    

    return res.render('./main/index.min.html', req.locals);
  }));

  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));


  return router;
};