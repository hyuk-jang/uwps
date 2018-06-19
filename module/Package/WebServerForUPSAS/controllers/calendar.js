const wrap = require('express-async-wrap');
const router = require('express').Router();
const _ = require('lodash');
const BU = require('base-util-jh').baseUtil;
const DU = require('base-util-jh').domUtil;

let BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');

module.exports = function (app) {
  const initSetter = app.get('initSetter');
  const biModule = new BiModule(initSetter.dbInfo);

  // server middleware
  router.use(wrap(async (req, res, next) => {
    req.locals = DU.makeBaseHtml(req, 1);
    let currWeatherCastList = await biModule.getCurrWeatherCast();
    let currWeatherCastInfo = currWeatherCastList.length ? currWeatherCastList[0] : null;
    let weatherCastInfo = webUtil.convertWeatherCast(currWeatherCastInfo);
    req.locals.weatherCastInfo = weatherCastInfo;
    next();
  }));

  // Get
  router.get('/', wrap(async (req, res) => {
    const moment = require('moment');
    let startDate = moment().subtract(1, 'years').format();
    let endDate = moment().format();
    let searchRange = biModule.getSearchRange('range', startDate, endDate);
    searchRange.searchInterval = 'day';

    // BU.CLI(searchRange);
    const weatherTrendList = await biModule.getWeatherTrend(searchRange); 
    // BU.CLI(weatherTrendList);
    // 수위는 수중 일반(단) 기준으로 가져옴
    const waterLevelList = await biModule.getWaterLevel(searchRange, 4); 
    // BU.CLI(waterLevelList);

    const weatherCastList = await biModule.getWeatherCastAverage(searchRange); 
    // BU.CLI(weatherCastList);
    const calendarCommentList = await biModule.getCalendarComment(searchRange); 
    // BU.CLI(calendarCommentList);

    /** @type {{title: string, start: string, color: string=}[]} */
    let calendarEventList = [];

    calendarCommentList.forEach(currentItem => {
      let event = {
        title: '',
        start: currentItem.group_date
      };

      if(currentItem.is_error){
        event.title = '▶ 테스트 X';
        event.color = 'red';
        // let addEvent = {
        //   start: currentItem.group_date,
        //   rendering: 'background',
        //   color: 'red'
        // };
        // calendarEventList.push(addEvent);
        
      } else {
        event.title = '▶ 테스트 O';
        event.color = 'blue';
      }

      const comment = _.get(currentItem, 'comment');
      if(comment !== null && comment !== ''){
        event.title += `\n  ${comment}`;
      }
      
      calendarEventList.push(event);
    });

    waterLevelList.forEach(currentItem => {
      let event = {
        title: `수위: ${currentItem.water_level}`,
        start: currentItem.group_date,
      };
      calendarEventList.push(event);
    });

    weatherCastList.forEach(currentItem => {
      let event = {
        title: `운량: ${currentItem.avg_sky}`,
        start: currentItem.group_date,
      };
      calendarEventList.push(event);
    });
    
    weatherTrendList.forEach(currentItem => {
      let event = {
        title: `일사량: ${currentItem.total_interval_solar}`,
        start: currentItem.group_date
      };
      calendarEventList.push(event);
      
      event = {
        title: `온도: ${currentItem.avg_temp}`,
        start: currentItem.group_date
      };
      calendarEventList.push(event);
    });
    
    
    
    
    // BU.CLI(calendarEventList);
    req.locals.calendarEventList = calendarEventList;

    return res.render('./calendar/calendar.html', req.locals);
  }));

  router.use(wrap(async (err, req, res) => {
    BU.CLI('Err', err);
    res.status(500).send(err);
  }));


  return router;
};





// let test1 = moment('2018-03-20', 'YYYY-MM-DD');
// let test2 = moment('2018-06-20', 'YYYY-MM-DD');
// BU.CLI(test1);
// BU.CLI(test1);
// // test1 = test1.add(1, 'days')
    
// let insertList = [];
// while(true){
//   let addObj = {
//     upsas_seq: 1,
//     is_error: 0,
//     writedate: test1.format('YYYY-MM-DD')
//   };
//   console.log('@@@@');
//   insertList.push(addObj);
//   test1.add(1, 'days');
//   if(test1 > test2){
//     break;
//   }
// }

// biModule.setTables('calendar', insertList);


// BU.CLI(insertList);
