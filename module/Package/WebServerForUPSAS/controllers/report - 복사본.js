module.exports = function(app) {
    let router = require('express').Router();
    let BU = require('../public/js/util/baseUtil.js');
    let DU = require('../public/js/util/domUtil.js');
    let SU = require('../public/js/util/salternUtil.js');
    let report = require('../models/report.js');

    // server middleware
    router.use(function(req, res, next) {
        req.locals = DU.makeBaseHtml(req, 6);
        next();
    });

    // Get
    router.get('/', function(req, res) {
        BU.CLI('report', req.locals)
        report.getReport(req.query, function(err, result){
            console.log(result.returnValue);
            if(err){
                return res.status(500).send();
            }
            return res.render('./report/report.html', DU.makePaginationHtml(req.locals, result));
        });
    });
    return router;
}