const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

// TEST
const tempSacle = require('../temp/tempSacle');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      if (app.get('auth')) {
        if (!req.user) {
          return res.redirect('/auth/login');
        }
      }
      req.locals = DU.makeBaseHtml(req, 4);
      const currWeatherCastList = await biModule.getCurrWeatherCast();
      const currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
      const weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
      req.locals.weatherCastInfo = weatherCastInfo;
      next();
    }),
  );

  // Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>
  // Get
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      // BU.CLI('inverter', req.locals)
      // console.time('getTable')
      const viewInverterStatus = await biModule.getTable('v_inverter_status');

      let searchRange = biModule.getSearchRange('min10');
      // searchRange.searchInterval = 'day';
      const waterLevelDataPacket = await biModule.getWaterLevel(searchRange);

      // TEST 구간
      viewInverterStatus.forEach(currentItem => {
        const foundIt = _.find(tempSacle.inverterScale, {inverter_seq: currentItem.inverter_seq});
        // currentItem.in_a = _.round(foundIt.scale * currentItem.in_a, 1);
        currentItem.in_w = _.round(foundIt.scale * currentItem.in_w, 1);
        // currentItem.out_a = _.round(foundIt.scale * currentItem.out_a, 1);
        currentItem.out_w = _.round(foundIt.scale * currentItem.out_w, 1);
        // currentItem.d_wh = _.round(foundIt.scale * currentItem.d_wh, 0);
        // currentItem.c_wh = _.round(foundIt.scale * currentItem.c_wh, 0);
        currentItem.daily_power_wh = _.round(foundIt.scale * currentItem.daily_power_wh, 0);
      });

      _.forEach(viewInverterStatus, data => {
        const waterLevelData = _.find(waterLevelDataPacket, {inverter_seq: data.inverter_seq});
        const compareInverter = _.find(viewInverterStatus, {
          inverter_seq: data.compare_inverter_seq,
        });
        data.compare_efficiency = _.round(
          (_.get(data, 'daily_power_wh') / _.get(compareInverter, 'daily_power_wh')) * 100,
          1,
        );
        data.water_level =
          waterLevelData && _.isNumber(waterLevelData.water_level)
            ? waterLevelData.water_level
            : '';
      });

      // 데이터 검증
      const validInverterStatus = webUtil.checkDataValidation(
        viewInverterStatus,
        new Date(),
        'writedate',
      );
      // BU.CLI(_.map(viewInverterStatus, 'daily_power_wh'));
      /** 인버터 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
      const refinedInverterStatus = webUtil.refineSelectedInverterStatus(validInverterStatus);
      // BU.CLI(refinedInverterStatus);

      // let searchRange = biModule.getSearchRange('hour', '2018-03-10');
      searchRange = biModule.getSearchRange('min10');
      const inverterPowerList = await biModule.getInverterPower(searchRange);
      // BU.CLI(inverterPowerList);
      const chartOption = {
        selectKey: 'out_w',
        dateKey: 'view_date',
        groupKey: 'ivt_target_id',
        colorKey: 'chart_color',
        sortKey: 'chart_sort_rank',
      };

      const chartData = webUtil.makeDynamicChartData(inverterPowerList, chartOption);
      // BU.CLI(chartData);

      /* Scale 적용 */
      chartData.series.forEach(currentItem => {
        const foundIt = _.find(tempSacle.inverterScale, {
          target_id: currentItem.name,
        });
        currentItem.data.forEach((data, index) => {
          currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
        });
      });

      // BU.CLI(refinedInverterStatus);
      webUtil.mappingChartDataName(chartData, viewInverterStatus, 'target_id', 'target_name');

      req.locals.inverterStatus = refinedInverterStatus;
      req.locals.chartDataObj = chartData;
      req.locals.powerInfo = {
        measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
      };
      // BU.CLI(req.locals.powerInfo);

      return res.render('./inverter/inverter.html', req.locals);
    }),
  );

  router.use(
    asyncHandler(async (err, req, res) => {
      BU.CLI('Err', err);
      res.status(500).send(err);
    }),
  );

  return router;
};
