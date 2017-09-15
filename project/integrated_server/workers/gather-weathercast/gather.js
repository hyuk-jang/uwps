var http = require("http");
var xml2js = require('xml2js');
var events = require('events');
var util = require('util');
var cron = require('cron');
var _ = require("underscore");

var biCast = require("../bi/weather-cast");
var BU = require("../../public/js/util/baseUtil");


module.exports = function (emitter) {
    var emitter = emitter;

    // 스케줄러 설정
    var settingCronJob = function (gatherTime) {
        var cronJob = cron.job('0 ' + gatherTime + ' * * * *', function () {
            runGather();
        });

        cronJob.start();
    }

    var runGather = function () {
        emitter.emit("deleteForecast");
        // 가져올 위치정보
        biCast.getWeatherLocationList(function (err, result) {
            if (err) {
                BU.logFile(err);
                return;
            }
            // for (var location in result) {
            //     requestWeatherCast(result[location]);
            // }
            // requestWeatherCast(result[0]);

            for (var location in result) {
                BU.readFile("./log/weathercast.txt", "", function (err, result) {
                    // BU.CLI(result)
                    var weatherCastInfo = result;
                    makeWeatherCastModel(JSON.parse(weatherCastInfo));
                    compareWeatherCast(JSON.parse(weatherCastInfo));
                });
            }
        });
    }


    // 위치정보(x, y)를 기준으로 기상청에 일기예보 요청
    var requestWeatherCast = function (location) {
        BU.CLI("requestWeatherCast", location)
        var options = {
            host: "www.kma.go.kr",
            path: "/wid/queryDFS.jsp?gridx=" + location.x + "&gridy=" + location.y
        }

        http.request(options, function (res) {
            var body = "";
            res.on('readable', function () {
                var chunk = this.read() || '';
                body += chunk;
            });

            res.on("end", function () {
                var extractedData = "";
                var parser = new xml2js.Parser();
                parser.parseString(body, function (err, result) {
                    if (err) {
                        return BU.logFile(err);
                    }
                    // BU.CLI(result)
                    BU.writeFile("./log/weathercast.txt", result, "w");

                    var weatherCastInfo = result;

                    makeWeatherCastModel(weatherCastInfo);
                    compareWeatherCast(weatherCastInfo);
                });
                //console.log("Note that you can't use value here if parseString is async; extractedData=", extractedData);
            });

        }).end();
    }

    var makeWeatherCastModel = function (weatherCastInfo) {
        var weatherCastObjHeader = weatherCastInfo.wid.header[0];
        var weatherCastObjBody = weatherCastInfo.wid.body[0];

        var announceDate = BU.splitStrDate(weatherCastObjHeader.tm);
        var forecastInfo = {
            x: weatherCastObjHeader.x[0],
            y: weatherCastObjHeader.y[0],
            weatherCast: []
        };

        _.each(weatherCastObjBody.data, function (castInfo) {
            var weatherCastData = {
                applydate: _calcApplyDate(announceDate, castInfo), // 적용시간
                temp: castInfo.temp[0], // 날씨 
                pty: castInfo.pty[0], // [없음(0), 비(1), 비 / 눈(2), 눈(3)]
                pop: castInfo.pop[0], // 강수확율
                r12: castInfo.r12[0], // 12시간 예상강수량
                ws: Number(castInfo.ws[0]).toFixed(2), // 풍속
                wd: castInfo.wd[0], // 풍향
                reh: castInfo.reh[0], // 습도
            };

            forecastInfo.weatherCast.push(weatherCastData);
        });
        emitter.emit("addForecast", forecastInfo);
    }


    // DB에 저장된 일기예보를 가져온 후 현 시간의 일기에보 데이터와 비교 후 DB에 저장 및 수정
    var compareWeatherCast = function (weatherCastInfo) {
        var currWeatherCastHeader = weatherCastInfo.wid.header[0];
        var currWeatherCastList = weatherCastInfo.wid.body[0].data;

        var announceDate = BU.splitStrDate(currWeatherCastHeader.tm);
        var currDate = BU.convertDateToText(new Date());

        var locationX = currWeatherCastHeader.x[0];
        var locationY = currWeatherCastHeader.y[0];

        // DB에 저장되어 있는 기상정보를 가져옴(최근 24건 => 최대 3일 * 하루 3시간 간격(8건) = 24)
        biCast.getPrevWeatherCast(locationX, locationY, currDate, function (err, prevWeatherCastList) {
            if (err) {
                console.log(err);
                return;
            }

            _.each(currWeatherCastList, function (currCast) {
                var nextWeatherCast = {};
                var applydate = _calcApplyDate(announceDate, currCast);

                // 게시된 날씨정보가 과거 데이터 일 경우 무시.
                if (currDate > applydate) {
                    // return console.log("과거 날씨 정보");
                }

                // 최신 날씨정보 객체 생성
                var weatherCastData = {
                    x: locationX,
                    y: locationY,
                    applydate: applydate, // 적용시간
                    temp: currCast.temp[0], // 날씨 
                    pty: currCast.pty[0], // [없음(0), 비(1), 비 / 눈(2), 눈(3)]
                    pop: currCast.pop[0], // 강수확율
                    r12: currCast.r12[0], // 12시간 예상강수량
                    ws: Number(currCast.ws[0]).toFixed(2), // 풍속
                    wd: currCast.wd[0], // 풍향
                    reh: currCast.reh[0], // 습도
                };


                // 과거 기상정보 내역이 있을 경우 최신 날씨정보 정의
                _.each(prevWeatherCastList, function (currCast) {
                    if (BU.convertDateToText(currCast.applydate) == applydate) {
                        nextWeatherCast = currCast;
                    }
                });

                // 과거 기상정보 내역이 없을 경우 신규 날씨정보기 때문에 삽입
                if (BU.isEmpty(nextWeatherCast)) {
                    biCast.insertWeatherCast(weatherCastData, function (err, result, query) {
                        if (err) {
                            // BU.CLIS(err, query)
                            return BU.errorLog("weather-db-err", err.code, err);
                        }

                    });
                } else { // 과거 기상정보 내역이 있으므로 갱신
                    biCast.updateWeatherCast(weatherCastData, nextWeatherCast.weathercast_data_seq, function (err, result, query) {
                        if (err) {
                            // BU.CLIS(err, query)
                            return BU.errorLog("weather-db-err", err.code, err);
                        }
                    });
                }
            });
        });
    }


    // 발표 시각을 기준으로 적용중인 시간을 계산하여 Date 반환
    function _calcApplyDate(baseDate, targetDate) {
        var applydate = new Date(baseDate);

        var day = Number(targetDate.day[0]);
        var hour = Number(targetDate.hour[0]);

        applydate.setMinutes(0);
        applydate.setSeconds(0)
        applydate.setDate(baseDate.getDate() + day);
        applydate.setHours(hour);

        return BU.convertDateToText(applydate);
    }

    return {
        start: function () {
            runGather();
            settingCronJob(30);
        }
    }
}