module.exports = function(app) {
    let router = require('express').Router();

    let BU = require('base-util-jh').baseUtil;
    let DU = require('../public/js/util/domUtil.js');
    let SU = require('../public/js/util/salternUtil.js');

    // server middleware
    router.use(function(req, res, next) {
        req.locals = DU.makeBaseHtml(req, 6);
        next();
    });

    // Get
    router.get('/', function(req, res) {
        BU.CLI('report', req.locals);

        return res.render('./report/report.html', req.locals)
    });

    return router;
}