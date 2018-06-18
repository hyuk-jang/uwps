

const WeatherCast = require('../weather-cast');
const WeatherDevice = require('../weather-device');

const config = require('./config');

class Control {
  /** @param {config} config */
  constructor(config) {
    // this.config = config.current;
    // this.config = _.get(config, 'current', {})

    this.weatherCast = new WeatherCast(config.weatherCast);
    this.weatherDevice = new WeatherDevice(config.weatherDevice);
    
  }

    
  /** 기상청 날씨 데이터, 기상 관측 장비 데이터 추출 구동 */
  init(){
    this.weatherCast.init();
    this.weatherDevice.init();
  }

}
module.exports = Control;