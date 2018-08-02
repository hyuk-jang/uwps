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
      if (app.get('auth')) {
        if (!req.user) {
          return res.redirect('/auth/login');
        }
      }
      req.locals = DU.makeBaseHtml(req, 2);
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
      BU.CLI('structure', req.locals);

      return res.render('./structure/diagram.html', req.locals);
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
