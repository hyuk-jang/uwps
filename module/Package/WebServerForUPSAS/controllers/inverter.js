const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

// TEST
const tempSacle = require('../temp/tempSacle');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 4);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>
  // Get
  router.get('/', wrap(async (req, res) => {
    // BU.CLI('inverter', req.locals)
    // console.time('getTable')
    let viewInverterStatus = await biModule.getTable('v_inverter_status');
    // BU.CLI(viewInverterStatus);

    // TEST 구간
    viewInverterStatus.forEach(currentItem => {
      let foundIt = _.findWhere(tempSacle.inverterScale, {
        inverter_seq: currentItem.inverter_seq
      });
      currentItem.in_a = Number((foundIt.scale * currentItem.in_a).scale(1, 0));
      currentItem.in_w = Number((foundIt.scale * currentItem.in_w).scale(1, 0));
      currentItem.out_a = Number((foundIt.scale * currentItem.out_a).scale(1, 0));
      currentItem.out_w = Number((foundIt.scale * currentItem.out_w).scale(1, 0));
      currentItem.d_wh = Number((foundIt.scale * currentItem.d_wh).scale(1, 0));
      currentItem.c_wh = Number((foundIt.scale * currentItem.c_wh).scale(1, 0));
      currentItem.daily_power_wh = Number((foundIt.scale * currentItem.daily_power_wh).scale(1, 0));
    });

    // BU.CLI(moduleStatusList);



    // 데이터 검증
    let validInverterStatus = webUtil.checkDataValidation(viewInverterStatus, new Date(), 'writedate');
    // BU.CLI(validInverterStatus);
    /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
    let refinedInverterStatus = webUtil.refineSelectedInverterStatus(validInverterStatus);
    // BU.CLI(refinedInverterStatus);
    refinedInverterStatus.dataList = _.sortBy(refinedInverterStatus.dataList, data => data.target_id);
    // BU.CLI(refinedInverterStatus);


    let searchRange = biModule.getSearchRange('min10');
    // let searchRange = biModule.getSearchRange('hour', '2018-03-10');
    let inverterPowerList = await biModule.getInverterPower(searchRange);
    // BU.CLI(inverterPowerList);
    
    let chartData = webUtil.makeDynamicChartData(inverterPowerList, 'out_w', 'view_date', 'ivt_target_id', {
      colorKey: 'chart_color',
      sortKey: 'chart_sort_rank'
    });
    // BU.CLI(chartData);

    // TEST
    chartData.series.forEach(currentItem => {
      let foundIt = _.findWhere(tempSacle.inverterScale, {
        target_id: currentItem.name
      });
      currentItem.data.forEach((data, index) => {
        currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
      });
    });



    // BU.CLI(chartData);
    webUtil.mappingChartDataName(chartData, viewInverterStatus, 'target_id', 'target_name');

    req.locals.inverterStatus = refinedInverterStatus;
    req.locals.chartDataObj = chartData;
    req.locals.powerInfo = {
      measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
    };
    // BU.CLI(req.locals.powerInfo);

    return res.render('./inverter/inverter.html', req.locals);
  }));


  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));

  return router;
};