const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const net = require('net');
const BiModule = require('../models/BiModule.js');
const webUtil = require('../models/web.util');

const map = require('../public/Map/map');

module.exports = app => {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(
    wrap(async (req, res, next) => {
      req.locals = DU.makeBaseHtml(req, 0);
      const currWeatherCastList = await biModule.getCurrWeatherCast();
      const currWeatherCastInfo = currWeatherCastList.length
        ? currWeatherCastList[0]
        : null;
      const weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
      req.locals.weatherCastInfo = weatherCastInfo;
      next();
    }),
  );

  // Get
  router.get(
    '/',
    wrap(async (req, res) => {
      BU.CLI('control', req.locals);

      req.locals.hi = 'jhi';
      req.locals.excuteControlList = map.controlList;
      // req.locals.cancelControlList = map.controlList;

      const compiled = _.template(`<option value="<%= controlName %>">
        <%= controlName %>
      </option>`);

      const excuteControlList = [];
      map.controlList.forEach(currentItem => {
        excuteControlList.push(compiled({controlName: currentItem.cmdName}));
      });

      BU.CLI(excuteControlList);
      const singleControlList = _.pick(map.setInfo.modelInfo, [
        'waterDoor',
        'valve',
        'pump',
      ]);

      req.locals.singleControlList = singleControlList;
      req.locals.automaticControlList = excuteControlList;

      // BU.CLI(req.locals);
      // return res.status(200).send(DU.locationJustGoBlank('http://115.23.49.28:7999'));
      return res.render('./controller/index.html', req.locals);
    }),
  );

  return router;
};
