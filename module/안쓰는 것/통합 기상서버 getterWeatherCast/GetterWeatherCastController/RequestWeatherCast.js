const xml2js = require('xml2js');
const cron = require('cron');
const http = require('http');
const _ = require('underscore');

const BU = require("./baseUtil.js");


class RequestWeatherCast {
  constructor(locationX, locationY) {
    this.locationX = locationX;
    this.locationY = locationY;

    this.lastForecastObj = {};
    this.cronJob = null;
  }

  // Cron 구동시킬 시간
  runCron(eachHour, eachMin) {
    let applyHour = parseInt(eachHour) >= 0 && parseInt(eachHour) < 24 ? parseInt(eachHour) : 0;
    let applyMin = parseInt(eachMin) >= 0 && parseInt(eachMin) < 60 ? parseInt(eachMin) : 0;

    if (this.cronJob !== null) {
      this.cronJob.stop();
    }

    cron.job(applyHour + ' ' + applyMin + ' * * * *', () => {
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
            return BU.logFile(err);
          }
          // TestRequestWeatherCastForFile을 사용하기 위한 파일 저장
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
      this._makeWeatherCastModel(JSON.parse(result), callback);
    });
  }

    // prevWeatherCastList Data
  // [{
  //   ROWNUM: 14,
  //   weathercast_data_seq: 35,
  //   x: 50,
  //   y: 75,
  //   temp: 18,
  //   pty: 0,
  //   pop: 20,
  //   r12: 0,
  //   ws: 2.4,
  //   wd: 4,
  //   reh: 90,
  //   applydate: 2017-06-08T21:00:00.000Z,
  //   writedate: 2017-06-07T09:47:25.000Z,
  //   updatedate: 2017-06-07T09:51:52.000Z }]
  compareWeatherCast(prevWeatherCastList, callback) {
    let currDate = BU.convertDateToText(new Date());
    let resCompareObj = {
      insert: [],
      update: []
    }
    _.each(this.lastForecastObj.weatherCast, (currCast) => {
      // 게시된 날씨정보가 과거 데이터 일 경우 무시.
      if (currDate > currCast.applydate) {
        return console.log("과거 날씨 정보");
      }

      // 과거 기상정보 내역이 있을 경우 최신 날씨정보 정의
      let nextWeatherCast = _.filter(prevWeatherCastList, (data) => {
        return BU.convertDateToText(data.applydate)  === currCast.applydate;
        
      });
      // 과거 기상정보 내역이 없을 경우 신규 날씨정보기 때문에 삽입
      if (_.isEmpty(nextWeatherCast)) {
        nextWeatherCast = currCast;
        nextWeatherCast.x = this.locationX;
        nextWeatherCast.y = this.locationY;

        resCompareObj.insert.push(nextWeatherCast);
      } else { // 과거 기상정보 내역이 있으므로 갱신
        resCompareObj.update.push(nextWeatherCast[0]);
      }
    });
    return callback(resCompareObj);
  }

  // 현재 설정된 동네예보 getter
  get weatherCast() {
    return this.lastForecastObj;
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
      this.lastForecastObj = forecastInfo;
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

module.exports = RequestWeatherCast;