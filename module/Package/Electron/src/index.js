

const config = require('../config/config');
const InverterMonitoring = require('./inverter-monitoring');
const WeatherCast = require('./weather-cast');


module.exports = {
  runOperation: () => {
    // 인버터 계측 프로그램 구동
    let inverterMonitoring =  new InverterMonitoring();    
    inverterMonitoring.init(config.dbInfo);

    // 기상 관측 데이터 수집 프로그램 구동
    let weatherCast =  new WeatherCast(config.weatherCast);    
    weatherCast.init();
  }
};