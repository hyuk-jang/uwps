const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
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
    let monthPower = webUtil.calcValue(webUtil.reduceDataList(inverterPowerByMonth, 'interval_wh'), 0.001, 1) ;

    // 오늘자 발전 현황을 구할 옵션 설정(strStartDate, strEndDate 를 오늘 날짜로 설정하기 위함)
    searchRange = biModule.getSearchRange('hour');
    // searchRange = biModule.getSearchRange('hour', '2018-02-14');
    // 검색 조건이 시간당으로 검색되기 때문에 금일 날짜로 date Format을 지정하기 위해 hour --> day 로 변경
    searchRange.searchType = 'day';
    // 오늘 계측 데이터
    let inverterPowerByToday = await biModule.getInverterPower(searchRange);
    // 각 인버터에서 기록된 데이터 차를 합산
    let dailyPower = webUtil.calcValue(webUtil.reduceDataList(inverterPowerByToday, 'interval_wh'), 0.001, 1) ;
    // BU.CLI(inverterPowerByToday);
    // let cumulativePower = webUtil.calcValue(webUtil.reduceDataList(inverterPowerByToday, 'max_c_wh'), 0.000001, 3) ;

    let cumulativePowerList = await biModule.getInverterCumulativePower();
    let cumulativePower = webUtil.calcValue(webUtil.reduceDataList(cumulativePowerList, 'max_c_wh'), 0.000001, 3) ;


    // 금일 발전 현황 데이터
    searchRange.searchType = 'hour';
    let inverterPowerList = await biModule.getInverterPower(searchRange);
    let chartData = webUtil.makeDynamicChartData(inverterPowerList, 'interval_wh', 'hour_time', '');
    webUtil.applyScaleChart(chartData, 'day');
    webUtil.mappingChartDataName(chartData, '인버터 시간별 발전량');

    // console.timeEnd('0');

    // console.time('1');
    // 접속반 현재 발전 현황
    let moduleStatus = await biModule.getModuleStatus();
    // 접속반 발전 현황 데이터 검증
    let validModuleStatusList = webUtil.checkDataValidation(moduleStatus, new Date(), 'writedate');
    // console.timeEnd('1');

    // console.time('2');
    let v_upsas_profile = await biModule.getTable('v_upsas_profile');
    // console.timeEnd('2');
    // 금일 발전 현황
    // 인버터 현재 발전 현황
    let inverterDataList = await biModule.getTable('v_inverter_status');
    // 인버터 발전 현황 데이터 검증
    let validInverterDataList = webUtil.checkDataValidation(inverterDataList, new Date(), 'writedate');

    // 설치 인버터 총 용량
    let pv_amount = _.reduce(_.pluck(v_upsas_profile, 'pv_amount'), (accumulator, currentValue) => accumulator + currentValue);
    let powerGenerationInfo = {
      currKw: webUtil.calcValue(webUtil.calcValidDataList(validInverterDataList, 'out_w', false), 0.001, 3),
      currKwYaxisMax: Math.ceil(pv_amount / 10),
      dailyPower : dailyPower === '' ? 0 : dailyPower,
      monthPower,
      cumulativePower,
      co2: webUtil.calcValue(cumulativePower, 0.424, 3),
      hasOperationInverter: _.every(_.values(_.map(validInverterDataList, data => data.hasValidData))),
      hasAlarm: false // TODO 알람 정보 작업 필요
    };
    // BU.CLI(powerGenerationInfo);
    req.locals.dailyPowerChartData = chartData;
    req.locals.moduleStatusList = validModuleStatusList ;
    req.locals.powerGenerationInfo = powerGenerationInfo;
    

    return res.render('./main/index.html', req.locals);
  }));

  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));


  return router;
};