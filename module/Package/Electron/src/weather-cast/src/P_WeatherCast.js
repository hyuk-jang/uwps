const xml2js = require('xml2js');
const cron = require('cron');
const http = require('http');
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const Control = require('./Control');

require('./format');

class P_WeatherCast {
  /** @param {Control} controller */
  constructor(controller) {
    this.controller = controller;
    this.locationX = controller.config.locationInfo.x;
    this.locationY = controller.config.locationInfo.y;

    this.cronScheduler = null;
  }

  // Cron 구동시킬 시간
  runCronWeatherCast() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 10분마다 요청
      this.cronScheduler = new cron.CronJob({
        cronTime: '0 */30 * * * *',
        onTick: () => {
          this.controller.config.hasDev ? this.TestRequestWeatherCastForFile() : this.requestWeatherCast();
          // this.requestWeatherCast();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }

    // let applyHour = parseInt(eachHour) >= 0 && parseInt(eachHour) < 24 ? parseInt(eachHour) : 0;
    // let applyMin = parseInt(eachMin) >= 0 && parseInt(eachMin) < 60 ? parseInt(eachMin) : 0;

    // if (this.cronJob !== null) {
    //   this.cronJob.stop();
    // }

    // this.cronJob = cron.job(applyHour + ' ' + applyMin + ' * * * *', () => {
    //   this.requestWeatherCast();
    // });
  }

  // 날씨 정보 요청
  requestWeatherCast(callback) {
    BU.CLI('requestWeatherCast');
    // BU.debugConsole();
    let options = {
      host: 'www.kma.go.kr',
      path: '/wid/queryDFS.jsp?gridx=' + this.locationX + '&gridy=' + this.locationY
    };

    http.request(options, res => {
      let output = '';
      // BU.CLI(options.host + ':' + res.statusCode);
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        output += chunk;
      });

      res.on('end', () => {
        let parser = new xml2js.Parser();
        parser.parseString(output, (err, result) => {
          if (err) {
            return this.controller.processOnData(err);
          }
          // TestRequestWeatherCastForFile을 사용하기 위한 파일 저장
          // BU.CLI(result)
          BU.writeFile('./log/weathercast.txt', result, 'w');
          // 모델화 시킴
          const weatherCastModel = this._makeWeatherCastModel(result, callback);
          return this.controller.processOnData(null, weatherCastModel);
        });
      });
    }).end();
  }

  // TEST: 테스트용 동네예보 파일 읽어오기
  TestRequestWeatherCastForFile() {
    // BU.CLI('TestRequestWeatherCastForFile');
    BU.readFile('./log/weathercast.txt', '', (err, result) => {
      if (err) {
        return this.controller.processOnData(err);
      }
      const weatherCastModel = this._makeWeatherCastModel(JSON.parse(result));
      return this.controller.processOnData(null, weatherCastModel);
    });
  }


  // 현재 기상청 날씨 정보 설정
  /**
   * 
   * @param {*} weatherCastInfo 
   * @return {weathercastModel}
   */
  _makeWeatherCastModel(weatherCastInfo) {
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
      let wf = 0;
      let wfEn = castInfo.wfEn[0];
      switch (wfEn) {
      case 'Clear':
        wf = 1;
        break;
      case 'Partly Cloudy':
        wf = 2;
        break;
      case 'Mostly Cloudy':
        wf = 3;
        break;
      case 'Cloudy':
        wf = 4;
        break;
      case 'Rain':
        wf = 5;
        break;
      case 'Snow/Rain':
        wf = 6;
        break;
      case 'Snow':
        wf = 7;
        break;
        
      default:
        break;
      }
      /** @type {weathercast} */
      let weatherCastData = {
        // day: castInfo.day[0], // 발표 날
        // hour: castInfo.hour[0], // 발표 시 
        applydate: this._calcApplyDate(announceDate, castInfo), // 적용시간
        temp: castInfo.temp[0], // 날씨 
        pty: castInfo.pty[0], // [없음(0), 비(1), 비 / 눈(2), 눈(3)]
        sky: castInfo.sky[0], // ① 1 : 맑음 ② 2 : 구름조금 ③ 3 : 구름많음 ④ 4 : 흐림
        wf, // ① Clear ② Partly Cloudy ③ Mostly Cloudy ④ Cloudy ⑤ Rain ⑥ Snow/Rain ⑦ Snow
        pop: castInfo.pop[0], // 강수확율
        r12: castInfo.r12[0], // 12시간 예상강수량
        ws: Number(castInfo.ws[0]).toFixed(2), // 풍속
        wd: castInfo.wd[0], // 풍향
        reh: castInfo.reh[0], // 습도
      };
      forecastInfo.weatherCast.push(weatherCastData);
    });

    return forecastInfo;
  }


  // 발표 시각을 기준으로 적용중인 시간을 계산하여 Date 반환
  _calcApplyDate(baseDate, targetDate) {
    let applydate = new Date(baseDate);
    let day = Number(targetDate.day[0]);
    let hour = Number(targetDate.hour[0]);

    applydate.setMinutes(0);
    applydate.setSeconds(0);
    applydate.setDate(baseDate.getDate() + day);
    applydate.setHours(hour);

    return BU.convertDateToText(applydate);
  }
}

module.exports = P_WeatherCast;