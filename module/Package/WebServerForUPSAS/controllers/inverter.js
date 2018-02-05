const wrap = require('express-async-wrap');
let router = require('express').Router();

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);
  
  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 4);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    // BU.CLI('inverter', req.locals)

    // console.time('getTable')
    let inverterStatus = await biModule.getTable('v_inverter_status')
    // console.timeEnd('getTable')
    // console.time('getInverterHistory')
    let inverterHistory = await biModule.getInverterHistory();
    // BU.CLI(inverterHistory)

    let chartDataObj = {
      range: [],
      series: []
    } 
    _.each(inverterHistory, (statusObj, ivtSeq) => {
      let findObj = _.findWhere(inverterStatus, {inverter_seq : Number(ivtSeq)});
      let addObj = {
        name: findObj ? findObj.target_name : '',
        data: _.pluck(statusObj, 'out_w')
      }
      chartDataObj.range = _.pluck(statusObj, 'hour_time')
      chartDataObj.series.push(addObj);
    })

    // console.timeEnd('getInverterHistory')

    req.locals.inverterStatus = inverterStatus;
    req.locals.chartDataObj = chartDataObj;
    req.locals.powerInfo = {
      measureTime: _.first(inverterStatus) ? BU.convertDateToText(_.first(inverterStatus).writedate) : ''
    };

    BU.CLI(req.locals)

    return res.render('./inverter/inverter.html', req.locals);
  }));


  router.use(wrap(async (err, req, res, next) => {
    BU.CLI('Err', err)
    res.status(500).send(err);
  }));

  return router;
}