module.exports = function(app) {
    let router = require('express').Router();

    let BU = require('base-util-jh').baseUtil;
    let DU = require('base-util-jh').domUtil;
    
    // server middleware
    router.use(function(req, res, next) {
        req.locals = BU.param2Lowercase(req);
        next();
    });



    // Get
    router.get('/', function(req, res) {
        biServer.getServerList(req.locals, function(err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.render('./admin/map/list.html', DU.makePaginationHtml(req.locals, result))
        })
    });

    // Post
    router.post('/', function(req, res) {
        biServer.getServerByIp(req.body.ip, function(err, result) {
            if (err) {
                return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
            }
            if (!result.length) {
                biServer.createServer(req.body, function(err, result) {
                    if (err) {
                        return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
                    }

                    return res.redirect('/admin/server');
                });
            } else {
                return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
            }
        });
    });

    // Read => return an HTML form for creating a new Server
    router.get('/new', function(req, res) {
        biWeather.getProvinceList(function(err, result) {
            if (err) {
                return res.status(500).send();
            }

            req.locals.provinceList = result;
            req.locals.salternInfo = {};

            return res.render('./admin/server/write.html', req.locals)
        });
    });

    // Edit => return an HTML form for editing a server
    router.get('/:id/edit', function(req, res) {
        var server_seq = req.params.id;
        biServer.getServerBySeq(server_seq, function(err, result) {
            if (err) {
                return res.status(500).send();
            }
            biWeather.getProvinceList(function(err, proResult) {
                if (err) {
                    return res.status(500).send();
                }
                req.locals.provinceList = proResult;
                req.locals.salternInfo = result.length ? result[0] : {};
                return res.render('./admin/server/write.html', req.locals)
            });
        });
    });

    // update
    router.patch('/:id', function(req, res) {
        var server_seq = req.params.id;
        biServer.checkUpdateAble(server_seq, req.body.ip, function(err, result) {
            if (err) {
                return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
            }
            if (!result.length) {
                biServer.updateServer(server_seq, req.body, function(err, result) {
                    if (err) {
                        return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
                    }
                    return res.redirect('/admin/server');
                });
            } else {
                return res.status(500).send(DU.locationAlertGo(err, '/admin/server'));
            }
        });
    });

    // delete
    router.delete('/:id', function(req, res) {
        var server_seqs = req.params.id;
        biServer.deleteServer(server_seqs, function(err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.status(204).send();
        })
    });


    return router;
}