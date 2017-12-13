const Promise = require('bluebird');
const wrap = require('express-async-wrap');
let router = require('express').Router();

const BU = require('base-util-jh').baseUtil;

let BiModule = require('../models/BiModule.js');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(function (req, res, next) {
    req.locals = DU.makeBaseHtml(req, 2);
    next();
  });

  // Get
  router.get('/', wrap(async(req, res) => {
    BU.CLI('structure', req.locals)

    return res.render('./structure/diagram.html', req.locals)
  }));

  router.use(wrap(async(err, req, res, next) => {
    console.log('Err', err)
    res.status(500).send(err);
  }));

  return router;
}