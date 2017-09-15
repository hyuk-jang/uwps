const xml2js = require('xml2js');
const cron = require('cron');
const http = require('http');
const _ = require('underscore');

class P_WeatherCast {
  constructor(controller) {
    this.controller = controller;
    this.locationX = controller.config.locationInfo.x;
    this.locationY = controller.config.locationInfo.y;

    this.cronJob = null;
  }

  // Cron 구동시킬 시간
  runCronWeatherCast(eachHour, eachMin) {
    let applyHour = parseInt(eachHour) >= 0 && parseInt(eachHour) < 24 ? parseInt(eachHour) : 0;
    let applyMin = parseInt(eachMin) >= 0 && parseInt(eachMin) < 60 ? parseInt(eachMin) : 0;

    if (this.cronJob !== null) {
      this.cronJob.stop();
    }

    this.cronJob = cron.job(applyHour + ' ' + applyMin + ' * * * *', () => {
      this.requestWeatherCast();
    });
  }

  // 날씨 정보 요청
  requestWeatherCast(callback) {
    let options = {
      host: "www.kma.go.kr",
      path: "/wid/queryDFS.jsp?gridx=" + this.locationX + "&gridy=" + this.locationY
    }

    http.request(options, res => {
      let output = '';
      console.log(options.host + ':' + res.statusCode);
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        output += chunk;
      });

      res.on('end', () => {
        let parser = new xml2js.Parser();
        parser.parseString(output, (err, result) => {
          if (err) {
            BU.logFile(err);
            return callback(err);
          }
          // TestRequestWeatherCastForFile을 사용하기 위한 파일 저장
          // BU.CLI(result)
          BU.writeFile("./log/weathercast.txt", result, "w");
          // 모델화 시킴
          return this._makeWeatherCastModel(result, callback);
        });
      });
    }).end();
  }

  // TEST: 테스트용 동네예보 파일 읽어오기
  TestRequestWeatherCastForFile(callback) {
    BU.readFile("./log/weathercast.txt", '', (err, result) => {
      if (err) {
        BU.CLI(err)
        return BU.logFile(err);
      }
      this._makeWeatherCastModel(JSON.parse(result), callback);
    });
  }


  // 현재 기상청 날씨 정보 설정
  _makeWeatherCastModel(weatherCastInfo, callback) {
    try {
      let weatherCastObjHeader = weatherCastInfo.wid.header[0];
      let weatherCastObjBody = weatherCastInfo.wid.body[0];
      let announceDate = BU.splitStrDate(weatherCastObjHeader.tm);
      let forecastInfo = {
        x: weatherCastObjHeader.x[0],
        y: weatherCastObjHeader.y[0],
        announceDate,
        weatherCast: []
      };

      _.each(weatherCastObjBody.data, (castInfo) => {
        let weatherCastData = {
          day: castInfo.day[0], // 발표 날
          hour: castInfo.hour[0], // 발표 시 
          applydate: this._calcApplyDate(announceDate, castInfo), // 적용시간
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
      // 날씨 정보 반환 
      if (typeof callback === 'function') {
        return callback(null, forecastInfo);
      }
    } catch (error) {
      return callback(error);
    }
  }


  // 발표 시각을 기준으로 적용중인 시간을 계산하여 Date 반환
  _calcApplyDate(baseDate, targetDate) {
    let applydate = new Date(baseDate);
    let day = Number(targetDate.day[0]);
    let hour = Number(targetDate.hour[0]);

    applydate.setMinutes(0);
    applydate.setSeconds(0)
    applydate.setDate(baseDate.getDate() + day);
    applydate.setHours(hour);

    return BU.convertDateToText(applydate);
  }
}

module.exports = P_WeatherCast;