const dao = require('./dao.js');

function dailyPower(dailyValue, callback) {
  var sql = `Select`;
  var len = 24;
  var ifCase = '';
  if (dailyValue.checkradio == 'select') {
    //기간선택            
    sql += ` DATE_FORMAT(writedate,'%H') as writedate ,`;
  } else if (dailyValue.checkradio == 'day') {
    //일일선택
    sql += ` DATE_FORMAT(writedate,'%H') as writedate ,`;
  } else if (dailyValue.checkradio == 'month') {
    //월선택
    sql += ` cast(DATE_FORMAT(writedate,'%d') as unsigned) as writedate,`;
  } else {
    //년선택
    sql += ` cast(DATE_FORMAT(writedate,'%m') as unsigned) as writedate,`;
  }
  //Note 채널 추가시 아래 sql문에 추가
  sql += `round(sum((v/10)*(ch_1/10))/count(writedate)) as ch_1,
          round(sum((v/10)*(ch_2/10))/count(writedate)) as ch_2,
          round(sum((v/10)*(ch_3/10))/count(writedate)) as ch_3,
          round(sum((v/10)*(ch_4/10))/count(writedate)) as ch_4,
          round(sum((v/10)*(ch_5/10))/count(writedate)) as ch_5,
          round(sum((v/10)*(ch_6/10))/count(writedate)) as ch_6   `;
  if (dailyValue.checkradio == 'select') {
    //기간선택            
    sql += `from connector_data where writedate>= DATE('${dailyValue.start}') and writedate< DATE('${dailyValue.end}')+1 group by DATE_FORMAT(writedate,'%H')`;
  } else if (dailyValue.checkradio == 'day') {
    //일일선택
    sql += `from connector_data where writedate>= DATE('${dailyValue.start}') and writedate< DATE('${dailyValue.start}')+1 group by DATE_FORMAT(writedate,'%H')`;
  } else if (dailyValue.checkradio == 'month') {
    //월선택
    sql += `from connector_data where writedate>= DATE('${dailyValue.start}-01') and writedate< DATE_ADD(DATE('${dailyValue.start}-01'),INTERVAL 1 month) group by DATE_FORMAT(writedate,'%Y-%m-%d')`;
    len = parseInt((new Date(dailyValue.start.substr(0, 4), dailyValue.start.substr(5, 2), 0)).getDate());
  } else {
    //년선택
    sql += `from connector_data where writedate>= DATE('${dailyValue.start}-01-01') and writedate<= DATE('${dailyValue.start}-12-31') group by DATE_FORMAT(writedate,'%Y-%m')`;
    len = 12;
  }
  console.log(sql)
  dao.doQuery(sql, function (err, result) {
    var returnValue = {};
    if (err) {
      callback(err);
      return;
    }

    var chartList_1 = [];
    var ch_1 = [], ch_2 = [], ch_3 = [], ch_4 = [], ch_5 = [], ch_6 = [];
    var cnt = 0;
    for (var i = 0; i < len; i++) {
      if (dailyValue.checkradio == 'select' || dailyValue.checkradio == 'day') {
        if (i >= result.length) {
          pushNull();
        } else {
          ch_1.push(result[i].ch_1);
          ch_3.push(result[i].ch_3);
          ch_2.push(result[i].ch_2);
          ch_4.push(result[i].ch_4);
          ch_5.push(result[i].ch_5);
          ch_6.push(result[i].ch_6);
        }
      } else {

        if (cnt >= result.length) {
          cnt = 0;
        }
        if (result.length == 0) {
          pushNull();
        } else {
          if (i != (result[cnt].writedate - 1)) {
            pushNull();
          } else {
            ch_1.push(result[cnt].ch_1);
            ch_3.push(result[cnt].ch_3);
            ch_2.push(result[cnt].ch_2);
            ch_4.push(result[cnt].ch_4);
            ch_5.push(result[cnt].ch_5);
            ch_6.push(result[cnt].ch_6);
            cnt++;
          }
        }
      }
    }
    function pushNull() {
      ch_1.push(null);
      ch_2.push(null);
      ch_3.push(null);
      ch_4.push(null);
      ch_5.push(null);
      ch_6.push(null);
    }
    chartList_1.push(ch_1, ch_2, ch_3, ch_4, ch_5, ch_6);
    returnValue.chartList_1 = chartList_1;
    returnValue.optradio = dailyValue.checkradio;

    var sql = `select Round(AVG(temperature/10),1) as temperature,Round(AVG(solar/10),1) as solar,Round(AVG(humidity/10),1) as humidity,writedate 
                from weather_device_data group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    dao.doQuery(sql, function (err, result) {
      if(err){
        callback(err);
        return;
      }

      var moduleChart=[];
      var humidity=[],temperature=[],solar=[];
      result.forEach(function(element) {
        humidity.push(element.humidity);
        temperature.push(element.temperature);
        solar.push(element.solar);
      });
      moduleChart.push(humidity,temperature,solar);
      returnValue.moduleChart=moduleChart;
      return callback(err, returnValue);
    })
  });
}
exports.dailyPower = dailyPower;