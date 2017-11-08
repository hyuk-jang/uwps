const _ = require('underscore');
const Promise = require('bluebird');
const BU = require('base-util-jh').baseUtil;
const B_Kma = require('./B_Kma');

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

    this.BM = new B_Kma(this.controller.config.dbInfo);
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
    return new Promise(resolve => {
      this.currForecastObj = data;
      this.compareWeatherCast()
        .then(resultCompareWeatherCast => {
          this.resultCompareWeatherCast = resultCompareWeatherCast;
          return this._updateWeatherCast();
        })
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          BU.CLI(err)
          throw err;
        })
    })
  }

  // 이전 데이터와 현재 데이터 비교
  // FIXME: 비교 연산쪽에 DB에 데이터가 꼬이면 알고리즘 오류. 알고리즘 개선 핅요
  async compareWeatherCast() {
    this.prevForecastList = await this.BM.getPrevWeatherCast(new Date());
    // BU.CLI(this.prevForecastList)

    let currDate = BU.convertDateToText(new Date());
    let resultCompareWeatherCast = {
      insert: [],
      update: []
    }
    let currWeatherCast = this.currForecastObj.weatherCast;

    currWeatherCast.forEach(currCast => {
      if (currDate > currCast.applydate) {
        return console.log("과거 날씨 정보");
      }

      // 과거 기상정보 내역이 있을 경우 최신 날씨정보 정의
      let nextWeatherCast = _.find(this.prevForecastList, (prevCast) => {
        return prevCast.applydate.valueOf() === BU.convertTextToDate(currCast.applydate).valueOf();
      });
      // BU.CLIS(nextWeatherCast, currCast)

      // 과거 기상정보 내역이 없을 경우 신규 날씨정보기 때문에 삽입
      if (_.isEmpty(nextWeatherCast)) {
        currCast.writedate = BU.convertDateToText(new Date());
        resultCompareWeatherCast.insert.push(currCast);
      } else { // 과거 기상정보 내역이 있으므로 갱신
        currCast.kma_data_seq = nextWeatherCast.kma_data_seq;
        resultCompareWeatherCast.update.push(currCast);
      }
    });
    // BU.CLI(resultCompareWeatherCast)
    return resultCompareWeatherCast;
  }

  // 기상청 날씨 정보 업데이트하고 이벤트 발생한 내용 알림
  _updateWeatherCast() {
    return new Promise(resolve => {
      Promise.each(this.resultCompareWeatherCast.update, updateObj => {
        return this.BM.updateTable('kma_data', { key: 'kma_data_seq', value: updateObj.kma_data_seq }, updateObj)
      })
        .then(res => {
          if (this.resultCompareWeatherCast.insert.length) {
            return this.BM.setTables('kma_data', this.resultCompareWeatherCast.insert)
          }
          return res;
        })
        .catch(err => {
          throw err;
        })
        .done(res => {
          resolve(res);
        })
    })
  }
}

module.exports = Model;