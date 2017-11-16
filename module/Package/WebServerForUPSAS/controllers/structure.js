module.exports = function(app) {
    let router = require('express').Router();

    let BU = require('base-util-jh').baseUtil;
    let DU = require('base-util-jh').domUtil;
    

    // server middleware
    router.use(function(req, res, next) {
        req.locals = DU.makeBaseHtml(req, 2);
        next();
    });

    // Get
    router.get('/', function(req, res) {
        BU.CLI('structure', req.locals)

        return res.render('./structure/diagram.html', req.locals)
    });
    return router;
}