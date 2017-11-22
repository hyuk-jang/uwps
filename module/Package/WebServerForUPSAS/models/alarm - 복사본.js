const dao = require("./dao.js");

function getAlarm(query, callback) {
    let sql= `SELECT *, CURDATE(), DATE_FORMAT(occur_date, '%Y-%m-%d %H:%i:%s') occur_date,
    DATE_FORMAT(fix_date, '%Y-%m-%d %H:%i:%s') fix_date,
(SELECT CONCAT(target_name, '(', code, ')') FROM connector WHERE PTD.connector_seq=connector_seq) target_name,
(SELECT CONCAT(module_type, '(', module_type, ')') FROM photovoltaic WHERE PTD.photovoltaic_seq=photovoltaic_seq) module_name
FROM photovoltaic_trouble_data PTD`;

if(query.start!=null){
    sql+=` WHERE occur_date BETWEEN '${query.start}' AND '${query.end}' ORDER BY occur_date DESC`;
}else{
    sql+=` ORDER BY occur_date DESC`;
}
return dao.doQuery(sql, callback);
}
exports.getAlarm = getAlarm;
