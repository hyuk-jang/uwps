module.exports = function (passport) {
    var router = require("express").Router();

    var BU = global.BU;
    var DU = global.DU;

    var biServer = require("../../models/admin/server");
    var biWeather = require("../../models/admin/weather");

    // Ajax 응답 페이지 용도
    // 도시
    router.get("/provinces/:pro", function (req, res) {
        var province = req.params.pro;
        biWeather.getCityList(province, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.json(result);
        });
    });

    // 동읍리
    router.get("/provinces/:pro/cities/:city", function (req, res) {
        var province = req.params.pro;
        var city = req.params.city;

        biWeather.getTownList(province, city, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            return res.json(result);
        });
    });

    // IP 중복 체크
    router.get("/ip-overlap/:ip", function (req, res) {
        var ip = req.params.ip;

        biServer.getServerByIp(ip, function (err, result) {
            if (err) {
                return res.status(500).send();
            }

            if (!result.length) {
                return res.status(204).send();
            } else {
                return res.status(200).send();
            }

        });
    });

    // 지역정보
    router.get("/location/:id", function(req, res){
        var id = req.params.id;

        biWeather.getWeather(id, function (err, result) {
            if (err) {
                return res.status(500).send();
            }
            if (!result.length) {
                return res.status(204).send();
            } else {
                return res.json(result);
            }
        });

    });




    return {
        ajax: router
    };
}