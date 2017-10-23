var dao = require('./dao.js');

function getDailyPower(req, callback) {
  var sql = `select DATE_FORMAT(writedate,'%H:%i:%S'),round(sum(out_w)/count(writedate)/10,1) as out_w
             from inverter_data 
             where writedate>=Date('20170901') and writedate<Date('20170902')
             group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;
  //차트 데이터 가져오기
  dao.doQuery(sql, function (err, result) {
    if (err) {
      callback(err);
      return;
    }
    var returnvalue = {}
    var chartList = [];
    var out_w = [];
    var date = [];

    for (var i = 0; i < result.length; i++) {
      date.push(result[i].writedate);
      out_w.push(result[i].out_w);
    }
    chartList.push(date);
    chartList.push(out_w);

    returnvalue.chartList = chartList;

    var sql = `select concat('ch',cs.photovoltaic_seq,' ','(',pt.target_name ,')')as title,(select target_name from connector where connector_seq=cs.connector_seq) as con_name
               from photovoltaic pt ,connector_structure cs 
               where pt.photovoltaic_seq=cs.photovoltaic_seq and connector_seq = 1 order by connector_seq,cs.photovoltaic_seq limit 0,4`

    dao.doQuery(sql, function (err, result) {
      if (err) {
        callback(err);
        return;
      }
      returnvalue.moduleStatus = result;
      return callback(err, returnvalue);
    });
  });
}
exports.getDailyPower = getDailyPower;

function getModulePaging(req, callback) {
  var sql = `select concat('ch',cs.photovoltaic_seq,' ','(',pt.target_name ,')')as title,(select target_name from connector where connector_seq=cs.connector_seq) as con_name
            from photovoltaic pt ,connector_structure cs 
            where pt.photovoltaic_seq=cs.photovoltaic_seq and connector_seq = 1 order by connector_seq,cs.photovoltaic_seq limit ${req.body.pageNum},4`
  return dao.doQuery(sql, callback);
}
exports.getModulePaging = getModulePaging;

