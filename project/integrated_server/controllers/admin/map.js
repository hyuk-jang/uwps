module.exports = function () {
    var router = require("express").Router();

    var biMap = require("../../models/admin/map");
    var biServer = require("../../models/admin/server");

    var BU = require("../../public/js/util/baseUtil");

    // server middleware
    router.use(function (req, res, next) {
        req.locals = DU.makeResObj(req, 2, 10);
        next();
    });

    // Read => display a list of all servers
    router.get("/", function (req, res) {
        biServer.getServerList(req.locals, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.render("./admin/map/list.html", DU.makePaginationHtml(req.locals, result))
        })
    });

    // Update Map
    router.patch("/:id", function (req, res) {
        var async = require("async");

        var server_seq = req.params.id;
        var file_name = BU.GUID() + ".json";
        var file_path = process.cwd() + "\\uploads\\MAP\\" + file_name;
        var url = "/upload/map/" + file_name;

        // map type 여부에 따라 stringify 진행
        var mapResource = req.body.mapResource;
        mapResource = typeof mapResource === "string" ? mapResource : JSON.stringify(mapResource);
        // 파일 생성 -> 기존 Map DB 제거 -> 신규 Map DB 등록 -> 응답 
        async.waterfall([
            function (callback) {
                BU.writeFile(file_path, mapResource, "w", function (err, result) {
                    return callback(err);
                });
            }, function(callback){
                biMap.deleteMap(server_seq, function(err, result){
                    return callback(err);
                });
            }, function(callback){
                biMap.createMap(server_seq, file_name, file_path, url, function(err, result){
                    return callback(err);
                });
            }
        ], function (err) {
            if(err){
                return res.status(500).send(DU.locationAlertGo(err, "/admin/map"));
            } else {
                return res.redirect("/admin/map");
            }
        });
    });

    // Read => return an HTML form for editing a server
    router.get("/:id/edit", function (req, res) {
        var server_seq = req.params.id;
        biMap.getServer(server_seq, function (err, result) {
            if (err || result.length == 0) {
                return res.status(400).send(DU.locationAlertGo(err, "/admin/map"));
            }
            
            var saltern_info = result[0];
            req.locals.saltern_info = saltern_info;

            if (saltern_info.path) {
                BU.readFile(saltern_info.path, "utf8", function (err, mapResult) {
                    if (err) {
                        BU.CLI(err);
                        req.locals.map = JSON.stringify({});
                        req.locals.err = BU.MRF(err);
                        res.status(501);
                    } else {
                        req.locals.map = mapResult;
                    }
                    
                    return res.render("./admin/map/write.html", req.locals)
                });
            } else {
                req.locals.map = JSON.stringify({});
                return res.render("./admin/map/write.html", req.locals)
            }
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
        map: router
    };
}