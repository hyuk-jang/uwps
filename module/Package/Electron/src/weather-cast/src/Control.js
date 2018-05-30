const EventEmitter = require('events');
const BU = require('base-util-jh').baseUtil;
const _ = require('lodash');
const P_WeatherCast = require('./P_WeatherCast.js');
const Model = require('./Model');

const config = require('./config');  

// class WeatherCastControl {
class Control extends EventEmitter {
  /** @param {config} config */
  constructor(config) {
    super();
    // 개발자모드(File load or 기상청 Rss) 좌표 정보, dao 정보, gcm 설정 정보
    this.config = _.get(config, 'current') || {};
    // BU.CLI(this.config);
    
    
  }

  // 초기 구동 시
  async init(dbInfo) {
    if(dbInfo){
      this.config.dbInfo = dbInfo;
      const bmjh = require('base-model-jh');
      const BM = new bmjh.BM(dbInfo);

      let axisList = await  BM.db.single(`SELECT weather_location.x, weather_location.y FROM upsas 
      LEFT OUTER JOIN weather_location
      ON upsas.weather_location_seq = weather_location.weather_location_seq`);

      let axis = _.head(axisList);

      BU.CLI(axis);
      this.config.locationInfo = {};
      this.config.locationInfo.x = _.get(axis, 'x');
      this.config.locationInfo.y = _.get(axis, 'y');
    }

    // Procss
    this.p_WeatherCast = new P_WeatherCast(this);

    // Model
    this.model = new Model(this);

    // BU.CLI('weatherCast init',this.config)
    // TEST: file 로딩
    return new Promise(resolve => {
      if (this.config.hasDev) {
        this.p_WeatherCast.TestRequestWeatherCastForFile();
      } else {
        this.p_WeatherCast.requestWeatherCast();
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

  /**
   * 
   * @param {Error} err 
   * @param {weathercastModel} weatherCastData 
   */
  async processOnData(err, weatherCastData){
    if(err){
      BU.logFile(err);
      BU.CLI('ERROR updateWeatherCast');
      this.emit('updateWeatherCast', err);
    } else {
      // 모델에 토스
      try {
        const resultOnData = await this.model.onData(weatherCastData);
        BU.CLI('DONE updateWeatherCast');
        this.emit('updateWeatherCast', null, resultOnData);
      } catch (error) {
        BU.CLI('ERROR updateWeatherCast');
        this.emit('updateWeatherCast', error);
        BU.logFile(error);
      }
    }
  }
}

module.exports = Control;