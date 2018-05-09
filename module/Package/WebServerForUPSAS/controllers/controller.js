const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');


const map = require('../public/Map/map');


const net = require('net');

module.exports = function(app) {
  

  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);
    
  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 0);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async (req, res) => {
    BU.CLI('control', req.locals);

    req.locals.hi = 'jhi';
    req.locals.excuteControlList = map.controlList;
    // req.locals.cancelControlList = map.controlList;

    BU.CLI(map.setInfo.modelInfo);
    let singleControlList = _.pick(map.setInfo.modelInfo, ['waterDoor', 'valve', 'pump']);

    req.locals.singleControlList = singleControlList;

    // BU.CLI(req.locals);
    // return res.status(200).send(DU.locationJustGoBlank('http://115.23.49.28:7999'));
    return res.render('./controller/index.html', req.locals);
  }));


  return router;
};