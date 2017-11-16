const mysql = require('mysql');
const dao = require('./dao.js');

function getSensor(callback) {

  //chart1
  var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
  where writedate>= DATE_FORMAT('2017-09-05 14:20:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:23:00','%Y-%m-%d %H:%i')
  group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

  dao.query(sql, function (err, result) {
    var returnvalue = {};
    var chart = [];
    var newValue = [], oldValue = [], time = [];

    result.forEach(function (element) {
      time.push(element.time);
      if (element.name == 'New') {
        newValue.push(element.avg);
      } else if (element.name == 'Old') {
        oldValue.push(element.avg);
      }
    });
    chart.push(newValue, oldValue, time);
    returnvalue.chart1 = chart;

    //chart2
    var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
    where writedate>= DATE_FORMAT('2017-09-05 14:23:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:27:00','%Y-%m-%d %H:%i')
    group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

    dao.query(sql, function (err, result) {
      var chart = [];
      var newValue = [], oldValue = [], time = [];

      result.forEach(function (element) {
        time.push(element.time);
        if (element.name == 'New') {
          newValue.push(element.avg);
        } else if (element.name == 'Old') {
          oldValue.push(element.avg);
        }
      });
      chart.push(newValue, oldValue, time);
      returnvalue.chart2 = chart;

      //chart3
      var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
      where writedate>= DATE_FORMAT('2017-09-05 14:27:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:29:00','%Y-%m-%d %H:%i')
      group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

      dao.query(sql, function (err, result) {
        var chart = [];
        var newValue = [], oldValue = [], time = [];

        result.forEach(function (element) {
          time.push(element.time);
          if (element.name == 'New') {
            newValue.push(element.avg);
          } else if (element.name == 'Old') {
            oldValue.push(element.avg);
          }
        });
        chart.push(newValue, oldValue, time);
        returnvalue.chart3 = chart;
        
        //chart4
        var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
        where writedate>= DATE_FORMAT('2017-09-05 14:30:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:33:00','%Y-%m-%d %H:%i')
        group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;
        
        dao.query(sql, function (err, result) {
          var chart = [];
          var newValue = [], oldValue = [], time = [];

          result.forEach(function (element) {
            time.push(element.time);
            if (element.name == 'New') {
              newValue.push(element.avg);
            } else if (element.name == 'Old') {
              oldValue.push(element.avg);
            }
          });
          chart.push(newValue, oldValue, time);
          returnvalue.chart4 = chart;

          //chart5
          var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
          where writedate>= DATE_FORMAT('2017-09-05 14:33:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:35:00','%Y-%m-%d %H:%i')
          group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

          dao.query(sql, function (err, result) {
            var chart = [];
            var newValue = [], oldValue = [], time = [];

            result.forEach(function (element) {
              time.push(element.time);
              if (element.name == 'New') {
                newValue.push(element.avg);
              } else if (element.name == 'Old') {
                oldValue.push(element.avg);
              }
            });
            chart.push(newValue, oldValue, time);
            returnvalue.chart5 = chart;

            //chart6
            var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
            where writedate>= DATE_FORMAT('2017-09-05 14:37:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:39:00','%Y-%m-%d %H:%i')
            group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

            dao.query(sql, function (err, result) {
              var chart = [];
              var newValue = [], oldValue = [], time = [];

              result.forEach(function (element) {
                time.push(element.time);
                if (element.name == 'New') {
                  newValue.push(element.avg);
                } else if (element.name == 'Old') {
                  oldValue.push(element.avg);
                }
              });
              chart.push(newValue, oldValue, time);
              returnvalue.chart6 = chart;

              //chart7
              var sql = `select FLOOR(SECOND(writedate)/10)*10 as time, REPLACE(name,'SmRainSensor','') as name,round(avg(value),0) as avg,DATE_FORMAT(writedate,'%H:%i:%s') as writedate from infrared_sensor.data_logger 
            where writedate>= DATE_FORMAT('2017-09-05 14:39:00','%Y-%m-%d %H:%i') and writedate< DATE_FORMAT('2017-09-05 14:41:00','%Y-%m-%d %H:%i')
            group by REPLACE(name,'SmRainSensor',''),FLOOR(HOUR(writedate)),FLOOR(MINUTE(writedate)),FLOOR(SECOND(writedate)/10) ORDER BY name, writedate`;

              dao.query(sql, function () {
                var chart = [];
                var newValue = [], oldValue = [], time = [];

                result.forEach(function (element) {
                  time.push(element.time);
                  if (element.name == 'New') {
                    newValue.push(element.avg);
                  } else if (element.name == 'Old') {
                    oldValue.push(element.avg);
                  }
                });
                chart.push(newValue, oldValue, time);
                returnvalue.chart7 = chart;
                return callback(err, returnvalue);
              })
            })
          })
        })
      })
    })
  });
}
exports.getSensor = getSensor;
