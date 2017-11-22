module.exports = function (app) {
    let router = require('express').Router();
    let BU = require('../public/js/util/baseUtil.js');
    let DU = require('../public/js/util/domUtil.js');
    let SU = require('../public/js/util/salternUtil.js');
    let alarm = require('../models/alarm.js');

    // server middleware
    router.use(function (req, res, next) {
        req.locals = DU.makeBaseHtml(req, 7);
        next();
    });

    // Get
    router.get('/', function(req, res) {
        BU.CLI('alarm', req.locals)
        alarm.getAlarm(req.query, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.render('./alarm/alert.html', DU.makePaginationHtml(req.locals, result));
        })
    });
    return router;
}