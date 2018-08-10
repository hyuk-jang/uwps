const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const {BU, DU} = require('base-util-jh');

const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

// TEST
const tempSacle = require('../temp/tempSacle');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);
  // CH 보여줄 최대 갯수
  const maxModuleViewNum = 8;

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      if (app.get('auth')) {
        if (!req.user) {
          return res.redirect('/auth/login');
        }
      }
      req.locals = DU.makeBaseHtml(req, 3);
      const currWeatherCastList = await biModule.getCurrWeatherCast();
      const currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
      const weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
      req.locals.weatherCastInfo = weatherCastInfo;
      next();
    }),
  );

  // Get
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      // upsas 현황
      const upsasProfile = await biModule.getTable('v_upsas_profile');
      // BU.CLI('connector', req.locals);
      // 선택된 접속반 seq 정의
      const connector_seq =
        req.query.connector_seq == null || req.query.connector_seq === 'all'
          ? 'all'
          : Number(req.query.connector_seq);
      /** 접속반 메뉴에서 사용 할 데이터 선언 및 부분 정의 */
      const refinedConnectorList = webUtil.refineSelectedConnectorList(upsasProfile, connector_seq);
      // BU.CLI(refinedConnectorList);
      // 접속반에 물려있는 모듈 seq 정의
      const moduleSeqList = _.map(refinedConnectorList, 'photovoltaic_seq');
      // 모듈 현황
      const moduleStatusList = await biModule.getTable('v_module_status', {
        photovoltaic_seq: moduleSeqList,
      });
      // BU.CLI(moduleStatusList);

      // TEST 구간
      moduleStatusList.forEach(currentItem => {
        const foundIt = _.find(tempSacle.moduleScale, {
          photovoltaic_seq: currentItem.photovoltaic_seq,
        });
        currentItem.vol =
          currentItem.vol === '' ? '' : Number((currentItem.vol * foundIt.scale).scale(1, 1));
      });

      // 모듈 발전 현황 데이터 검증
      const validModuleStatusList = webUtil.checkDataValidation(
        moduleStatusList,
        new Date(),
        'writedate',
      );

      // 모듈 데이터 삽입
      validModuleStatusList.forEach(validInfo => {
        const hasOperation = validInfo.hasValidData;
        // let hasOperation = true;
        const {amp, vol} = validInfo.data;

        const findIt = _.find(refinedConnectorList, {
          photovoltaic_seq: validInfo.data.photovoltaic_seq,
        });
        findIt.hasOperation = hasOperation;
        findIt.amp = hasOperation ? amp : '';
        findIt.vol = hasOperation ? vol : '';
        findIt.power =
          hasOperation && _.isNumber(amp) && _.isNumber(vol)
            ? webUtil.calcValue(amp * vol, 1, 1)
            : '';
      });
      // refinedConnectorList = _.sortBy(refinedConnectorList, 'ivt_target_id');
      // BU.CLI(refinedConnectorList);

      const connectorStatusData = webUtil.convertColumn2Rows(
        refinedConnectorList,
        [
          'connector_ch',
          'install_place',
          'ivt_target_name',
          'pv_target_name',
          'pv_manufacturer',
          'amp',
          'vol',
          'power',
          'temperature',
          'hasOperation',
        ],
        maxModuleViewNum,
      );
      let totalAmp = webUtil.reduceDataList(refinedConnectorList, 'amp');
      totalAmp = _.isNumber(totalAmp) ? totalAmp.scale(1, 1) : '';
      let avgVol = webUtil.reduceDataList(refinedConnectorList, 'vol');
      avgVol = _.isNumber(avgVol) ? (avgVol / refinedConnectorList.length).scale(1, 1) : '';
      let totalPower = webUtil.reduceDataList(refinedConnectorList, 'power');
      totalPower = _.isNumber(totalPower) ? totalPower.scale(0.001, 3) : '';

      // 금일 접속반 발전량 현황
      const searchRange = biModule.getSearchRange('min10');
      // let searchRange = biModule.getSearchRange('hour', '2018-03-10');
      const connectorPowerList = await biModule.getConnectorPower(searchRange, moduleSeqList);

      const chartOption = {
        selectKey: 'wh',
        dateKey: 'view_date',
        groupKey: 'photovoltaic_seq',
        colorKey: 'chart_color',
        sortKey: 'chart_sort_rank',
      };

      const chartData = webUtil.makeDynamicChartData(connectorPowerList, chartOption);

      /* Scale 적용 */
      chartData.series.forEach(currentItem => {
        const foundIt = _.find(tempSacle.moduleScale, {
          photovoltaic_seq: Number(currentItem.name),
        });
        currentItem.data.forEach((data, index) => {
          currentItem.data[index] = Number((data * foundIt.scale).scale(1, 1));
        });
      });

      // BU.CLI(chartData);

      webUtil.applyScaleChart(chartData, 'hour');
      webUtil.mappingChartDataNameForModule(chartData, upsasProfile);

      const connectorList = await biModule.getTable('connector');
      connectorList.unshift({
        connector_seq: 'all',
        target_name: '모두',
      });
      // BU.CLI(chartData);
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
        totalPower,
        maxModuleViewNum,
        measureTime: `${BU.convertDateToText(new Date(), '', 4)}:00`,
        // measureTime: _.first(moduleStatusList) ? BU.convertDateToText(_.first(moduleStatusList).writedate) : ''
      };
      // 모듈 상태값들 가지고 있는 배열
      req.locals.moduleStatusList = refinedConnectorList;
      // 금일 발전 현황
      req.locals.chartDataObj = chartData;

      return res.render('./connector/connect.html', req.locals);
    }),
  );

  router.use(
    asyncHandler(async (err, req, res) => {
      console.trace(err);
      res.status(500).send(err);
    }),
  );

  return router;
};
