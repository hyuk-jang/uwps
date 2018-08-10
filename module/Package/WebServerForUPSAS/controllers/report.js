const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const _ = require('lodash');
const {BU, DU} = require('base-util-jh');

const webUtil = require('../models/web.util');

const PowerModel = require('../models/PowerModel');

const defaultRangeFormat = 'min10';
module.exports = app => {
  const initSetter = app.get('initSetter');
  const powerModel = new PowerModel(initSetter.dbInfo);

  // server middleware
  router.use(
    asyncHandler(async (req, res, next) => {
      if (app.get('auth')) {
        if (!req.user) {
          return res.redirect('/auth/login');
        }
      }
      req.locals = DU.makeBaseHtml(req, 6);
      const currWeatherCastList = await powerModel.getCurrWeatherCast();
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
      // BU.CLI('report', req.query);
      const param_inverter_seq =
        req.query.inverter_seq == null || req.query.inverter_seq === 'all'
          ? 'all'
          : Number(req.query.inverter_seq);
      const param_page = req.query.page || 1;
      // 조회 간격
      const searchInterval = req.query.search_interval
        ? req.query.search_interval
        : defaultRangeFormat;
      // 조회 범위
      const searchType = req.query.search_type ? req.query.search_type : 'hour';
      // 조회 객체 정의
      // BU.CLIS(searchType, searchInterval, req.query.start_date, req.query.end_date);
      const selectedReportMode = _.get(req.query, 'start_date', '').length
        ? 'reportMode'
        : 'calendarMode';
      const searchRange = powerModel.getSearchRange(
        searchType,
        req.query.start_date,
        req.query.end_date,
      );
      searchRange.searchInterval = searchInterval;
      // searchRange.searchType = searchType;
      searchRange.page = Number(param_page);
      searchRange.pageListCount = 20;

      const inverterList = await powerModel.getTable('inverter');
      const reportList = await powerModel.getInverterReport(searchRange, param_inverter_seq);
      const calendarEventList = await powerModel.getCalendarEventList();
      // BU.CLI(reportList);

      const queryString = {
        inverter_seq: param_inverter_seq,
        start_date: searchRange.strStartDateInputValue,
        end_date: searchRange.strEndDateInputValue,
        search_type: searchType,
        search_interval: searchInterval,
      };

      const paginationInfo = DU.makeBsPagination(
        searchRange.page,
        reportList.totalCount,
        '/report',
        queryString,
        searchRange.pageListCount,
      );

      // BU.CLI(paginationInfo)
      // BU.CLI(searchRange)
      // BU.CLI(reportList.totalCount);

      const deviceList = await powerModel.getDeviceList('inverter');

      inverterList.unshift({
        inverter_seq: 'all',
        target_name: '모두',
      });

      req.locals.inverter_seq = param_inverter_seq;
      req.locals.device_list = deviceList;
      req.locals.searchRange = searchRange;
      req.locals.reportList = reportList.report;
      req.locals.paginationInfo = paginationInfo;
      req.locals.calendarEventList = calendarEventList;
      req.locals.selectedReportMode = selectedReportMode;

      return res.render('./report/report.html', req.locals);
    }),
  );

  router.get(
    '/excel',
    asyncHandler(async (req, res) => {
      const searchInterval = req.query.search_interval ? req.query.search_interval : 'min10';
      // Search 타입을 지정
      const searchType = req.query.search_type ? req.query.search_type : defaultRangeFormat;
      const startDate = req.query.start_date;
      const endDate = req.query.end_date;

      // 지정된 SearchType으로 설정 구간 정의
      let searchRange = powerModel.getSearchRange(searchType, startDate, endDate);

      if (searchType === 'range') {
        const realSearchType =
          searchType === 'range'
            ? powerModel.convertSearchTypeWithCompareDate(
                searchRange.strEndDate,
                searchRange.strStartDate,
              )
            : searchType;
        if (realSearchType === 'hour') {
          searchRange = powerModel.getSearchRange(
            defaultRangeFormat,
            req.query.start_date,
            req.query.end_date,
          );
        } else {
          searchRange.searchType = realSearchType;
          searchRange.searchInterval = realSearchType;
        }
      } else if (searchType === 'hour') {
        switch (searchInterval) {
          case 'min':
          case 'min10':
            searchRange.searchType = searchInterval;
            break;
          default:
            break;
        }
        searchRange.searchInterval = searchInterval;
      }
      // BU.CLI(searchRange);
      // return;

      BU.CLI(_.includes(['min', 'min10', 'hour'], searchInterval));

      if (_.includes(['min', 'min10', 'hour'], searchInterval)) {
        const excelWorkBook = await powerModel.makeExcelSheet(searchRange, searchInterval);
        // BU.CLI(excelWorkBook);

        return res.send(excelWorkBook);
      }
      return res.status(500).send();

      // BU.CLI(searchRange);
    }),
  );

  router.use(
    asyncHandler(async (err, req, res) => {
      BU.CLIN(err, 2);
      return res.status(500).send(err);
    }),
  );

  return router;
};
