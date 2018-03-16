const EventEmitter = require('events');
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const P_WeatherCast = require('./P_WeatherCast.js');
const Model = require('./Model');

const config = require('./config');  

// class WeatherCastControl {
class Control extends EventEmitter {
  /** @param {config} config */
  constructor(config) {
    super();
    // 개발자모드(File load or 기상청 Rss) 좌표 정보, dao 정보, gcm 설정 정보
    this.config = config.current;
    
    // Procss
    this.p_WeatherCast = new P_WeatherCast(this);

    // Model
    this.model = new Model(this);
  }

  // 초기 구동 시
  init() {
    // BU.CLI('weatherCast init',this.config)
    // TEST: file 로딩
    return new Promise(resolve => {
      if (this.config.hasDev) {
        this.testRequestWeatherCast();
      } else {
        this.requestWeatherCast();
      }
      this.runCronWeatherCast();

      resolve(true);
    });
  }

  // 스케줄러 실행
  runCronWeatherCast() {
    this.p_WeatherCast.runCronWeatherCast();
  }

  // 내일 강수확율 가져오기
  getTomorrowPop() {
    // BU.CLI(this.model.tomorrowPop)
    return this.model.tomorrowPop;
  }


  // 기상청 날씨 요청
  requestWeatherCast() {
    this.p_WeatherCast.requestWeatherCast((err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      // 모델에 토스
      this.model.onData(result)
        .then(() => {
          this.emit('updateWeatherCast', err, result);
        })
        .catch(err => {
          BU.errorLog('err_weathercast', err);
        });
   
    });
  }

  // 기상청 RSS 잦은 사용은 ip ban 처리가 되므로 개발 단계에서는 날씨 요청한 후 파일을 읽는 것으로 대체
  testRequestWeatherCast() {
    this.p_WeatherCast.TestRequestWeatherCastForFile((err, result) => {
      if (err) {
        console.log(err);
        return;
      }
      // 모델에 토스
      this.model.onData(result)
        .then(() => {
          this.emit('updateWeatherCast', err, result);
        })
        .catch(err => {
          BU.errorLog('err_weathercast', err);
        });
    });
  }

}

module.exports = Control;