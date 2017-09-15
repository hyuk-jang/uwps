const dao = require('./dao.js');
let _ = require('underscore');

function getConnector(connector_seq,callback) {
  var sql = `select connector_seq,target_name from connector`;

  //Test doQuery 1번 Select박스 접속반 리스트 가져오기
  dao.doQuery(sql, function (err, result) {
    if (err) {
      callback(err);
      return;
    }
    var returnvalue = {
      'optionList': result
    };

    var sql =`select cs.*,(select target_name from saltern_block where saltern_block_seq=pt.saltern_block_seq) as place,pt.manufacturer,pt.target_name
              from photovoltaic pt ,connector_structure cs 
              where pt.photovoltaic_seq=cs.photovoltaic_seq and cs.connector_seq=${connector_seq}`;

    //Test doQuery 2번 실시간 접속반 모니터링 데이터 가져오기
    dao.doQuery(sql, function (err, result) {
      if (err) {
        callback(err);
        return;
      }

      returnvalue.tableList = result;

      // var sql = `select DATE_FORMAT(writedate,'%H:%i:%S')as writedate,ch_1,ch_2,ch_3,ch_4 from connector_data`;
      // //Test doQuery 3번 차트 데이터 가져오기
      // dao.doQuery(sql, function (err, result) {
      //   if (err) {
      //     callback(err);
      //     return;
      //   }

      //   var chartList = [['writedate', 'ch_1', 'ch_2', 'ch_3', 'ch_4']];
      //   result.forEach(function (element) {
      //     var arr = [];
      //     arr.push(element.writedate, element.ch_1, element.ch_2, element.ch_3, element.ch_4);
      //     chartList.push(arr);
      //   })
      //   returnvalue.chartList = chartList;
      //   return callback(err, returnvalue);
      // });

      var sql = `select writedate, DATE_FORMAT(writedate,'%H:%i:%S') as writedate,
                  round(ch_1/10,1) as ch_1,
                  round(ch_2/10,1) as ch_2,
                  round(ch_3/10,1) as ch_3,
                  round(ch_4/10,1) as ch_4,
                  round(ch_5/10,1) as ch_5,
                  round(ch_6/10,1) as ch_6
                from connector_data where writedate>=CURDATE() -INTERVAL 7 DAY and writedate<=CURDATE() -INTERVAL 6 DAY and connector_seq=${connector_seq}`;

      //Test doQuery inverter_data 테이블에서 데이터 가져오기
      dao.doQuery(sql, function (err, result) {
        if (err) {
          callback(err);
          return;
        }
        var chartList=[];
        var ch_1=[],ch_2=[],ch_3=[],ch_4=[],ch_5=[],ch_6=[];
        var date =[];
        result.forEach(function(element) {
          date.push(element.writedate);
          ch_1.push(element.ch_1);
          ch_2.push(element.ch_2);
          ch_3.push(element.ch_3);
          ch_4.push(element.ch_4);
          ch_5.push(element.ch_5);
          ch_6.push(element.ch_6);
        });
        chartList.push(ch_1,ch_2,ch_3,ch_4,ch_5,ch_6,date);
        // var chartList = [['writedate', 'CH1', 'CH2', 'CH3', 'CH4', 'CH5', 'CH6']];
        // result.forEach(function (element) {
        //   var arr = [];
        //   arr.push(element.writedate,element.ch_1,element.ch_2,element.ch_3,element.ch_4,element.ch_5,element.ch_6);
        //   chartList.push(arr);
        // })
        returnvalue.chartList=chartList;
        returnvalue.connector_seq=connector_seq;
        return callback(err,returnvalue);
      })

    })
  });
}
exports.getConnector = getConnector;
 
