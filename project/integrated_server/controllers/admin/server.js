module.exports = function () {
    var router = require("express").Router();

    var biServer = require("../../models/admin/server");
    var biWeather = require("../../models/admin/weather");

    // server middleware
    router.use(function (req, res, next) {
      BU.CLI('Admin Server Router')
        req.locals = DU.makeResObj(req, 1, 10);
        next();
    });

    // Read => display a list of all servers
    router.get("/", function (req, res) {
      BU.CLI('Admin Server')
        biServer.getServerList(req.locals, function (err, result) {
            if (err) {
                return res.status(500).send();
            }

            return res.render("./admin/server/list.html", DU.makePaginationHtml(req.locals, result))
        })
    });

    // Read => return an HTML form for creating a new Server
    router.get("/new", function (req, res) {
        biWeather.getProvinceList(function (err, result) {
            if (err) {
                return res.status(500).send();
            }

            req.locals.provinceList = result;
            req.locals.salternInfo = {};

            return res.render("./admin/server/write.html", req.locals)
        });
    });

    // Create Server
    router.post("/", function (req, res) {
        biServer.getServerByIp(req.body.ip, function (err, result) {
            if (err) {
                return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
            }
            if (!result.length) {
                biServer.createServer(req.body, function (err, result) {
                    if (err) {
                        return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
                    }

                    return res.redirect("/admin/server");
                });
            } else {
                return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
            }
        });
    });

    // Update Server
    router.patch("/:id", function (req, res) {
        var server_seq = req.params.id;
        biServer.checkUpdateAble(server_seq, req.body.ip, function (err, result) {
            if (err) {
                return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
            }
            if (!result.length) {
                biServer.updateServer(server_seq, req.body, function (err, result) {
                    if (err) {
                        return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
                    }
                    return res.redirect("/admin/server");
                });
            } else {
                return res.status(500).send(DU.locationAlertGo(err, "/admin/server"));
            }
        });
    });

    // Read => return an HTML form for editing a server
    router.get("/:id/edit", function (req, res) {
        var server_seq = req.params.id;
        biServer.getServerBySeq(server_seq, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            biWeather.getProvinceList(function (err, proResult) {
                if (err) {
                    return res.status(500).send();
                }
                req.locals.provinceList = proResult;
                req.locals.salternInfo = result.length ? result[0] : {};
                return res.render("./admin/server/write.html", req.locals)
            });
        });
    });

    // Delete Server
    router.delete("/:id", function (req, res) {
        var server_seqs = req.params.id;
        biServer.deleteServer(server_seqs, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.status(204).send();
        })
    });



    return {
        server: router
    };
}