module.exports = function () {
    var router = require("express").Router();
    var biAuth = require("../../models/auth/auth.js");
    var BU = require("../../public/js/util/baseUtil.js");

    // server middleware
    router.use(function (req, res, next) {
        next();
    });


    // app에서의 로그인 인증 처리 수행
    router.post("/login", function (req, res) {
        var res_obj = {
            CMD: "AppLoginInfo",
            IsError: 0,
            Message: "",
            Contents: ""
        };

        var user_param = {};
        for (param in req.body) {
            user_param[param.toLowerCase()] = req.body[param];
        }
        // BU.CLI(user_param)
        biAuth.getMemberForApp(user_param.userid, user_param.password, function (err, result) {
            if (err || result.length === 0) {
                res_obj.IsError = 1;
                res_obj.Message = err ? "DB 오류" : "아이디와 비밀번호를 확인해주세요.";
                return res.status(400).send(res_obj);
            }

            var member_info = result[0];
            var saltern_info = {
                saltpond_info_seq: member_info.saltern_info_seq,
                name: member_info.name,
                address: member_info.address,
                ip: member_info.ip,
                push_port: member_info.push_port,
                base_port: member_info.base_port,
                cmd_port: member_info.cmd_port,
                web_port: member_info.web_port
            };
            var location_info = {
                weather_location_seq: member_info.weather_location_seq,
                province: member_info.province,
                city: member_info.city,
                town: member_info.town,
                latitude: member_info.latitude,
                longitude: member_info.longitude,
                x: member_info.x,
                y: member_info.y,
            };

            var userInfo = {
                member_seq: member_info.member_seq,
                name: member_info.m_name,
                address: member_info.m_address,
                tel: member_info.m_tel
            };
            var session_key = BU.GUID();
            var res_contents = {
                Member: userInfo,
                Saltpond_Server: saltern_info,
                Weather_Location: location_info,
                SessionID: session_key
            }
            // console.log("ㅇ니마ㅓ리ㅏㄴㅇ")
            if (member_info.saltern_info_seq == null) {
                res_obj.IsError = 1;
                res_obj.Message = "연결된 염전컨트롤러가 없습니다.";
                res.send(res_obj);
                return;
            }
            // BU.CLI(res_contents);
            res_obj.Contents = res_contents;

            // 내부망(Wifi 핫스팟)을 이용시에는 SessionID를 요청하지 않음.
            if (saltern_info.ip.toString().indexOf("192") != -1) {
                return res.send(JSON.stringify(res_obj));
            } else {
                // 제어 서버에 새로운 사용자 등록 요청
                var request = require('request');
                var workers = req.app.get("workers");

                workers.salternInfo.saltern.emit("getSalternInfo", member_info.saltern_info_seq, function (result) {
                    // BU.CLI(result.bobAliceSecret)
                    var enSession_key = BU.encryptAes(session_key, result.bobAliceSecret);
                    var enMember_seq = BU.encryptAes(userInfo.member_seq, result.bobAliceSecret);
                    var saltern_url = "http://" + saltern_info.ip + ":" + saltern_info.web_port + "/api/spics/new-client";
                    // BU.CLIS(enSession_key, enMember_seq)
                    BU.CLI('saltern_url',saltern_url)
                    request.post(
                        saltern_url, {
                            json: {
                                session_key: enSession_key,
                                member_seq: enMember_seq
                            }
                        },
                        function (error, response, body) {
                            if (!error && response.statusCode == 204) {
                                return res.json(res_obj);
                            } else {
                                // BU.CLI(error)
                                res_obj.IsError = 1;
                                res_obj.Message = error;
                                // BU.CLI(res_obj);

                                return res.json(res_obj);
                            }
                        }
                    );
                });
            }
        });
    });

    return {
        mobile: router
    };
}