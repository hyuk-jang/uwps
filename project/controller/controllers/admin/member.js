module.exports = function (app) {
    var router = require('express').Router();

    var _ = require('underscore');

    var biServer = require('../../models/admin/server');
    var biMember = require('../../models/admin/member');

    var BU = require('base-util-jh').baseUtil;

    // server middleware
    router.use(function (req, res, next) {
        req.locals = DU.makeResObj(req, 4, 10);
        next();
    });

    // Read => display a list of all members
    router.get('/', function (req, res) {
        biMember.getMemberList(req.locals, function (err, result) {
            if (err) {
                return res.status(500).send(err);
            }
            res.render('./admin/member/list.html', DU.makePaginationHtml(req.locals, result))
        })
    });

    // Read => return an HTML form for creating a new Server
    router.get('/new', function (req, res) {
        req.locals.modelMember = {};

        return res.render('./admin/member/write.html', req.locals)
    });

    // Create Server
    router.post('/', function (req, res) {
        var username = req.body.username;
        var password = req.body.password;

        var salt = BU.genCryptoRandomByte(16);
        BU.encryptPbkdf2(password, salt, function (hashPassword) {
            req.body.salt = salt;
            req.body.hashPassword = hashPassword;
            biMember.createMember(req.body, function (err, result) {
                if (err) {
                    return res.status(500).send(DU.locationAlertGo(err, '/admin/member'));
                }

                return res.redirect('/admin/member');
            });
        });

    });
    // Update Server
    router.patch('/:id', function (req, res) {
        var async = require('async');

        var member_seq = req.params.id;

        async.waterfall([
            function (callback) {
                var password = req.body.password;
                if (password.length) {
                    var salt = BU.genCryptoRandomByte(16);
                    BU.encryptPbkdf2(password, salt, function (hashPassword) {
                        req.body.salt = salt;
                        req.body.hashPassword = hashPassword;
                        callback(null, req.body);
                    });

                } else
                    callback(null, req.body);
            }
        ], function (err, result) {
            if (err) {
                return res.status(500).send(DU.locationAlertGo(err, '/admin/member'));
            }
            biMember.updateMember(member_seq, result, function (err, result2, query) {
                if (err) {
                    console.log(query)
                    return res.status(500).send(DU.locationAlertGo(err, '/admin/member'));
                }
                return res.redirect('/admin/member');
            });
        });
    });

    // Read => return an HTML form for editing a server
    router.get('/:id/edit', function (req, res) {
        var seq = req.params.id;

        biMember.getMemberInfo(seq, function (err, result) {
            if (err) {
                return res.status(500).send();
            }

            req.locals.modelMember = result.length ? result[0] : {};

            return res.render('./admin/member/write.html', req.locals);
        });
    });

    // Delete Server
    router.delete('/:id', function (req, res) {
        var ids = req.params.id;
        biMember.deleteMember(ids, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.status(204).send();
        })
    });


    // Search Server
    router.get('/popup/server', function (req, res) {
        biServer.getServerList(req.locals, function (err, result) {
            if (err) {
                return res.status(500).send();
            }

            biMember.getOpenPopMember(result.list, function (err, result2) {
                if (err) {
                    return res.status(500).send();
                }

                _.each(result.list, function (data) {
                    var Arr = _.filter(result2, function (memberData) {
                        if (data.saltpond_info_seq == memberData.saltpond_info_seq) {
                            return true;
                        }
                        return false;
                    });
                    var str = '';

                    _.each(Arr, function (data) {
                        if (str == '') {
                            str += data.Name;
                        } else {
                            str += ',' + data.Name;
                        }
                    });
                    data.memberName = str;
                });

                res.render('./admin/member/popup/server.html', DU.makePaginationHtml(req.locals, result))

            });
        });
    });



    return router;
}