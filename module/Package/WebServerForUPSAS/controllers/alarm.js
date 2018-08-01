const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const {BU, DU} = require('base-util-jh');

const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      req.locals = DU.makeBaseHtml(req, 7);
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
      // BU.CLI('alarm', req.query)
      // 장비 종류 여부 all(전체), inverter(인버터), connector(접속반)
      let deviceType = 'all';
      if (req.query.device_type === 'inverter' || req.query.device_type === 'connector') {
        deviceType = req.query.device_type;
      } else if (req.query.device_type === undefined) {
        deviceType = 'inverter';
      }

      /** 오류 상태 @property {string} error_status all(전체), deviceError(장치 에러), systemError(시스템 에러) */
      const error_status =
        req.query.error_status == null || req.query.error_status === ''
          ? 'deviceError'
          : req.query.error_status;

      const param_page = req.query.page || 1;

      let startDate = req.query.start_date
        ? BU.convertTextToDate(req.query.start_date)
        : new Date();
      let endDate = req.query.end_date ? BU.convertTextToDate(req.query.end_date) : new Date();

      // 기본 한달 간 검색
      if (!req.query.start_date) {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      startDate = BU.convertDateToText(startDate);
      endDate = BU.convertDateToText(endDate);

      const searchRange = biModule.getSearchRange('range', startDate, endDate);
      // 검색 조건 객체에 현재 페이지, 페이지당 출력 건수 정의
      searchRange.page = Number(param_page);
      searchRange.pageListCount = 20;

      let troubleReport = {totalCount: 0, report: []};

      if (deviceType === 'inverter') {
        troubleReport = await biModule.getAlarmReportForInverter(error_status, searchRange);
      } else if (deviceType === 'connector') {
        troubleReport = await biModule.getAlarmReportForConnector(error_status, searchRange);
      } else {
        troubleReport = await biModule.getAlarmReport(error_status, searchRange);
      }

      const queryString = {
        start_date: searchRange.strStartDateInputValue,
        end_date: searchRange.strEndDateInputValue,
      };

      const paginationInfo = DU.makeBsPagination(
        searchRange.page,
        troubleReport.totalCount,
        '/alarm',
        queryString,
        searchRange.pageListCount,
      );

      const device_type_list = [
        {type: 'all', name: '전체'},
        {type: 'inverter', name: '인버터'},
        {type: 'connector', name: '접속반'},
      ];

      const error_status_list = [
        {type: 'all', name: '전체'},
        {type: 'deviceError', name: '장치 오류'},
        {type: 'systemError', name: '시스템 오류'},
      ];

      // 차트 제어 및 자질 구래한 데이터 모음
      const searchOption = {
        device_type: deviceType,
        device_type_list,
        error_status,
        error_status_list,
        search_range: searchRange,
      };

      req.locals.searchOption = searchOption;
      req.locals.alarmList = troubleReport.report;
      req.locals.paginationInfo = paginationInfo;

      return res.render('./alarm/alert.html', req.locals);
    }),
  );

  router.use(
    asyncHandler(async (err, req, res) => {
      console.log('Err', err);
      res.status(500).send(err);
    }),
  );

  return router;
};
