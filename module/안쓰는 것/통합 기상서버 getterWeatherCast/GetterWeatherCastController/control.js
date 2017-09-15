const EventEmitter = require('events');
const _ = require('underscore');
const RequestWeatherCast = require('./RequestWeatherCast.js');
const biCast = require("../weather-cast.js");
const BU = require("./baseUtil.js");

class WeatherController extends EventEmitter {
  constructor(location = {
    x,
    y
  }) {
    super(location.x, location.y);
    this.requestWeatherCast = new RequestWeatherCast(location.x, location.y);
  }

  // 날씨 데이터 Json 받아오기
  requetWeatherCast(callback) {
    this.requestWeatherCast.requestWeatherCast((result) => {
      if (typeof callback === 'function') {
        return callback(result, this.requestWeatherCast);
      } else {

      }
    });
  }

  // TEST: 개발용 날씨 데이터 Json 받아오기
  TestRequestWeatherCastForFile(callback) {
    this.requestWeatherCast.TestRequestWeatherCastForFile((result) => {
      if (typeof callback === 'function') {
        return callback(result, this.requestWeatherCast);
      } else {

      }
    });
  }

  // 이전 날씨 데이터 비교
  prevWeatherCastData(callback) {
    biCast.getPrevWeatherCast(super.locationX, super.locationY, new Date(), (err, result, query) => {
      return this.requestWeatherCast.compareWeatherCast(result, this.writeQueryForecast);
    })
  }

  // insert or update 날씨정보 저장
  writeQueryForecast(queryString) {
    _.each(queryString.insert, (queryObj, key) => {
      // console.log('insert', queryObj)
      biCast.insertWeatherCast(queryObj, (err, result, query) => {
        if (err) {
        }
      });
    });

    _.each(queryString.update, (queryObj, key) => {
      // console.log('updateWeatherCast', queryObj)
      biCast.updateWeatherCast(queryObj, queryObj.weathercast_data_seq, (err, result, query) => {
        if (err) {
        }
      });
    });
  }
}

module.exports = WeatherController;