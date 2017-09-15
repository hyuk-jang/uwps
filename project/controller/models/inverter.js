const dao = require('./dao.js');

function getInverter(callback) {
  var sql =`select t1.inverter_seq,round(t1.in_a/10,1) as in_a, round(t1.in_v/10,1) as in_v,round(t1.in_wh/10,1) as in_wh,
              round(t1.out_a/10,1) as out_a, round(t1.out_v/10,1) as out_v ,round(t1.out_wh/10,1) as out_wh,
              round(t1.p_f/10,1) as p_f,round(t1.d_wh/10,1) as d_wh,round(t1.c_wh/10000,3) as c_wh 
            from inverter_data t1,
            (select *,max(writedate) as M from inverter_data group by inverter_seq) t2
            where t1.writedate=t2.M and t1.inverter_seq=t2.inverter_seq
            order by inverter_seq`;
  dao.doQuery(sql, function(err,result){
    if(err){
      callback(err);
      return;
    }
    var returnvalue={
      'ivtTableList':result
    }
    var sql = `select writedate, inverter_seq,round(out_wh/10,1) as out_wh
              from inverter_data
              where writedate>=Date('20170901') and writedate<Date('20170902') 
              group by DATE_FORMAT(writedate,'%Y-%m-%d %H'),inverter_seq 
              order by inverter_seq,writedate`;
    dao.doQuery(sql, function(err,result){
      if(err){
        callback(err);
        return;
      }
      var chartList = [];
      var ch_1=[],ch_2=[],ch_3=[],ch_4=[],ch_5=[],ch_6=[];

      result.forEach(function(element) {
        if(element.inverter_seq==1){
          ch_1.push(element.out_wh);
        }else if(element.inverter_seq==2){
          ch_2.push(element.out_wh);
        }else if(element.inverter_seq==3){
          ch_3.push(element.out_wh);
        }else if(element.inverter_seq==4){
          ch_4.push(element.out_wh);
        }else if(element.inverter_seq==5){
          ch_5.push(element.out_wh);
        }else if(element.inverter_seq==6){
          ch_6.push(element.out_wh);
        }
      });
      chartList.push(ch_1);
      chartList.push(ch_2);
      chartList.push(ch_3);
      chartList.push(ch_4);
      chartList.push(ch_5);
      chartList.push(ch_6);
      
      returnvalue.chartList=chartList;
      return callback(err,returnvalue);
    })
  })
}
exports.getInverter = getInverter;