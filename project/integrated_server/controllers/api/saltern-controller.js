module.exports = function () {
    var router = require("express").Router();
    var _ = require("underscore");

    var biMap = require("../../models/admin/map.js");
    var biServer = require("../../models/admin/server.js");
    var biAuth = require("../../models/auth/auth.js");

    var BU = require("../../public/js/util/baseUtil");

    // server middleware
    router.use(function (req, res, next) {
        next();
    });

    router.get("/", function (req, res) {
        res.redirect("/admin/server");
    })

    router.post("/test", function (req, res) {

        res.send("hi test")
    });

    // Deffie Hellman 키교환 및 정보 전송
    router.post("/api/exchange-key/:id", function (req, res) {
        BU.CLI("exchange-key", req.body.ip)
        var workers = req.app.get("workers");

        workers.salternInfo.saltern.emit("exchangeKey", req.params.id, req.body.ip, req.body.pub_key, function(statusCode, result){
            return res.status(statusCode).json(result);
        });
    });

    router.post("/api/control-info/:id", function (req, res) {
        BU.CLI("control-info", req.params.id)
        BU.CLI(req.body)

        var workers = req.app.get("workers");


        var serverSeq = req.params.id;


        workers.salternInfo.saltern.emit("getSalternInfo", serverSeq, function (result) {
            res.json(result);
        });



        // biMap.getServer(serverSeq, function (err, result) {
        //     if (err) {
        //         return res.status(500).send({});
        //     } else if (result.length === 0) {
        //         return res.status(400).send({});
        //     } else {
        //         var serverInfo = result[0];
        //         var bob = crypto.createDiffieHellman(new Buffer(serverInfo.prime_key, "hex"));
        //         bob.generateKeys();
        //         var bobPub = bob.getPublicKey();
        //         serverInfo.bobPub;



        //         return res.send(serverInfo);
        //     }
        // });
    });

    // 사용자 인증
    router.post("/api/auth-member/:id", function (req, res) {
        BU.CLI("/auth-member/:id")
        var crypto = require("crypto");
        var serverSeq = req.params.id;

        var workers = req.app.get("workers");
        workers.salternInfo.saltern.emit("getSalternInfo", serverSeq, function (result) {
            if (BU.isEmpty(result)) {
                return res.status(400).send({});
            } else {
                var bobAliceSecret = result.bob.computeSecret(new Buffer(req.body.key));
                var userid = BU.decryptAes(req.body.userid, bobAliceSecret);
                var password = BU.decryptAes(req.body.password, bobAliceSecret);

                biAuth.selectAuthMember(userid, password, function (err, result) {
                    if (err) {
                        return res.status(500).send();
                    } else if (BU.isEmpty(result)) {
                        return res.status(204).send();
                    } else {
                        return res.send(result);
                    }
                })
            }
        });

        // biServer.getServerBySeq(serverSeq, function (err, result) {
        //     if (err) {
        //         return res.status(500).send(err);
        //     } else if (result.length === 0) {
        //         return res.status(400).send();
        //     } else {
        //         var bob = crypto.createDiffieHellman(new Buffer(result.prime_key, "hex"));
        //         bob.generateKeys();
        //         var bobPub = bob.getPublicKey();

        //         var userid = req.body.userid;
        //         var userid = req.body.userid;
        //         var key = req.body.key;

        //         var bobAliceSecret = bob.computeSecret(alicePub);

        //     }
        // });

        // var crypto = require("crypto");
        // var server = crypto.createDiffieHellman(100);
        // var prime = server.getPrime();
        // BU.CLI(prime)
        // return res.send(prime);

    });


    // 기상청 날씨예보 응답
    router.get("/api/weather-cast/:position", function (req, res) {
        var workers = req.app.get("workers");
        try {
            var axis = req.params.position.split(",");

            workers.gatherWeathercast.emitter.emit("getForecast", function (resForecast) {
                var findObj = _.findWhere(resForecast, {
                    x: axis[0],
                    y: axis[1]
                });
                if (_.isEmpty(findObj)) {
                    return res.status(204).send(findObj);
                }
                return res.json(findObj);
            })
        } catch (error) {
            return res.status(400).send(error);
        }
    });


    // // 컨트롤러설치 지역 내일 날씨 - 그냥 controller가 받어
    // router.get("/tomorrow-pop/:position", function (req, res) {
    //     try {
    //         var axis = req.params.position.split(",");

    //         workers.gatherWeathercast.emitter.emit("getForecast", function (resForecast) {
    //             var findObj = _.findWhere(resForecast, {x:axis[0], y:axis[1]});
    //             if(_.isEmpty(findObj)){
    //                 return res.status(204).send(findObj);
    //             }
    //             return res.json(findObj);
    //         })
    //     } catch (error) {
    //         return res.status(400).send(error);
    //     }
    // });


    return {
        saltern: router
    };
}