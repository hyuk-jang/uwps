const _ = require('underscore');
const B_WeatherCast = require('./B_WeatherCast.js');
class Model {
  constructor(controller) {
    // super();
    this.controller = controller;

    this.locationInfo = controller.config.locationInfo;


    // 원데이터는 아님. {x, y, announceData, weathercast} 내장
    this.currForecastObj = {};
    // DB에 저장되어있는 날씨 정보 weathercast {}
    this.prevForecastList = [];
    // 과거, 최신 비교 결과
    this.resultCompareWeatherCast = {};

    this.registrationList = [];

    // Bi
    this.b_WeatherCast = new B_WeatherCast(this.controller.config.dbInfo);

  }

  get calcAverageObj() {
    let resObj = {};
    for (let key in this.averageObj) {
      resObj[key] = this.averageObj[key].average;
    }
    return resObj;
  }

  get tomorrowPop() {
    let currDate = new Date();
    if (BU.isEmpty(this.currForecastObj)) {
      BU.log('empty')
      return {};
    } else {
      let now = new Date();
      let startDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
      let endDate = BU.convertDateToText(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));

      let forecastList = this.currForecastObj.weatherCast;
      let pop = 0;
      let popCount = 0;
      for (let key in forecastList) {
        if (forecastList[key].applydate >= startDate && forecastList[key].applydate < endDate) {
          popCount += 1;
          pop += Number(forecastList[key].pop);
        }
      }
      return Math.round(pop / popCount);
    }
  }

  // 데이터 수신
  onCurrWeatherCastData(data) {
    // BU.CLI('_onCurrWeatherCastData', data)
    this.currForecastObj = data;
    this.compareWeatherCast((err, result) => {
      if (err) {
        BU.CLI(err);
        BU.logFile(err);
        return;
      } else {
        this._updateWeatherCast(result);
      }
    });
  }

  // 이전 데이터와 현재 데이터 비교
  // FIXME: 비교 연산쪽에 DB에 데이터가 꼬이면 알고리즘 오류. 알고리즘 개선 핅요
  compareWeatherCast(callback) {
    this.b_WeatherCast.getPrevWeatherCast(new Date(), (err, result, query) => {
      if (err) {
        BU.CLI(err);
        return BU.logFile(err);
      }
      // BU.CLI(result)
      this.prevForecastList = result;
      // BU.CLI(result)
      try {
        let currDate = BU.convertDateToText(new Date());
        let resultCompareWeatherCast = {
          insert: [],
          update: []
        }
        let currWeatherCast = this.currForecastObj.weatherCast;
        // BU.CLI(currWeatherCast)
        _.each(currWeatherCast, (value, key) => {
          let currCast = currWeatherCast[key];
          if (currDate > currCast.applydate) {
            return console.log("과거 날씨 정보");
          }

          // 과거 기상정보 내역이 있을 경우 최신 날씨정보 정의
          let nextWeatherCast = _.filter(this.prevForecastList, (data) => {
            return BU.convertDateToText(data.applydate) === currCast.applydate;
          });

          // 과거 기상정보 내역이 없을 경우 신규 날씨정보기 때문에 삽입
          // BU.CLI(currCast,nextWeatherCast)
          if (_.isEmpty(nextWeatherCast)) {
            nextWeatherCast = currCast;
            nextWeatherCast.x = this.locationInfo.x;
            nextWeatherCast.y = this.locationInfo.y;

            resultCompareWeatherCast.insert.push(nextWeatherCast);
          } else { // 과거 기상정보 내역이 있으므로 갱신
            resultCompareWeatherCast.update.push(nextWeatherCast[0]);
          }
        })
        this.resultCompareWeatherCast = resultCompareWeatherCast;
        // BU.CLI(resultCompareWeatherCast)
        // callback 있을 경우 
        if (typeof callback === 'function') {
          return callback(err, result);
        }
      } catch (error) {
        BU.logFile(error)
        return false;
      }
    })
  }

  // 기상청 날씨 정보 업데이트하고 이벤트 발생한 내용 알림
  _updateWeatherCast() {
    // BU.CLI('_updateWeatherCast');
    // BU.CLI(this.resultCompareWeatherCast)
    let hasError = null;
    _.each(this.resultCompareWeatherCast.insert, (queryObj, key) => {
      // console.log('insert', queryObj)
      this.b_WeatherCast.insertWeatherCast(queryObj, (err, result, query) => {
        if (err) {
          BU.CLI(err);
          hasError = err;
        }
      });
    });

    _.each(this.resultCompareWeatherCast.update, (queryObj, key) => {
      // console.log('updateWeatherCast', queryObj)
      this.b_WeatherCast.updateWeatherCast(queryObj, queryObj.kma_data_seq, (err, result, query) => {
        if (err) {
          BU.CLI(err,query);
          hasError = err;
        }
      });
    });
    if (hasError && this.config.hasDev === false) {
      BU.logFile('weather cast update error');
      throw (hasError);
    } else {
      this.controller._updateWeatherCast_M(this.resultCompareWeatherCast)
    }

  }
}

module.exports = Model;