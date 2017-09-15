var dao = require("../dao.js");

// ip로 서버 가져오기
var getServerByIp = function (ip, callback) {
    var sql = " SELECT ip ";
        sql += "saltern_info" + ip + "' AND is_deleted = 0";
    dao.doQuery(sql, callback);
}
exports.getServerByIp = getServerByIp;

// seq로 서버 가져오기
var getServerBySeq = function(seq, callback){
    var sql = " SELECT * ";
        sql += " FROM saltern_info WHERE saltern_info_seq = " + seq + " AND is_deleted = 0";
    dao.doQuery(sql, callback);
}
exports.getServerBySeq = getServerBySeq;

// 염전 서버 목록 가져오기
var getServerList = function ({page, search, pageCount }, callback) {
    var page = parseInt(page);
    var search = search;
    var pageCount = pageCount;

    if (page <= 0) {
        page = 1;
    }
    var ps = (page - 1) * pageCount;
    var pe = (page) * pageCount;

    var sql = "";

    sql = " SELECT *, ";
    sql += ' IFNULL ( (SELECT name  FROM weather_device WHERE weather_device.weather_device_seq = saltern_info.weather_device_seq ),"") AS weahername ';
    sql += " , (  SELECT COUNT(*) FROM saltern_map WHERE saltern_info_seq = saltern_info.saltern_info_seq  )  AS mapCount ";
    sql += " FROM saltern_info WHERE name Like '%" + MSF(search) + "%' AND is_deleted = 0  ";
    sql += " ORDER BY saltern_info_seq DESC  Limit " + ps + "," + pageCount + "  ";

    dao.doQuery(sql, function (err, result) {
        if (err) {
            callback(err);
            return;
        }
        var returnvalue = {
            "list": result
        };
        var sql = " SELECT COUNT(*) AS CCOUNT FROM saltern_info WHERE name Like '%" + MSF(search) + "%' AND is_deleted = 0  ";

        dao.doQuery(sql, function (err, result) {
            if (err) {
                callback(err);
                return;
            }
            
            returnvalue.totalCount = result[0].CCOUNT;

            callback(err, returnvalue);
        });

    });

}
exports.getServerList = getServerList;


// 서버 생성
/**
 * 
 * @param {Object} salternInfo - 염전 서버 정보
 * @param {string} salternInfo.ip - 염전 서버 ip 
 * @param {*} callback 
 */
var createServer = function({ip,name,address,base_port,cmd_port,push_port, web_port,gcm_senderid, weather_location_seq}, callback){
    var updatedate = BU.convertDateToText(new Date());
    var writedate = BU.convertDateToText(new Date());

     var sql = "";
        sql += "INSERT INTO `saltern_integratedserver`.`saltern_info` (`weather_location_seq`, `name`, `address`, `ip`, `push_port`, `base_port`, `cmd_port`, `web_port`, `gcm_senderid`, `is_deleted`, `updatedate`,`writedate`) "
        sql += "VALUES ('" + MRF(weather_location_seq) + "','"
            + MRF(name) + "','" + MRF(address) + "','"
            + MRF(ip) + "','" + MRF(push_port) + "','"
            + MRF(base_port) + "','" + MRF(cmd_port) + "','"
            + MRF(web_port) + "', '"+ MRF(gcm_senderid) +"', '0','" + MRF(updatedate) + "','"
            + MRF(writedate) + "')";

        //console.log(sql);

    dao.doQuery(sql, callback);
}
exports.createServer = createServer;

// 서버 수정
var updateServer = function (saltern_info_seq, {ip,name,address,base_port,cmd_port,push_port, web_port,weather_location_seq, gcm_senderid}, callback) {
    var updatedate = BU.convertDateToText(new Date());

    var sql = " UPDATE `saltern_integratedserver`.`saltern_info` SET "
        + " `weather_location_seq`='" + MRF(weather_location_seq)
        + "', `name`='" + MRF(name)
        + "', `address`='" + MRF(address)
        + "', `ip`='" + MRF(ip)
        + "', `push_port`='" + MRF(push_port)
        + "', `base_port`='" + MRF(base_port)
        + "', `cmd_port`='" + MRF(cmd_port)
        + "', `web_port`='" + MRF(web_port)
        + "', `gcm_senderid`='" + MRF(gcm_senderid)
        + "', `updatedate`='" + MRF(updatedate) + "'"
        + "WHERE  `saltern_info_seq`='" + MRF(saltern_info_seq) + "' ";

    dao.doQuery(sql, callback);
}
exports.updateServer = updateServer;

// 서버 삭제
var deleteServer = function (ids, callback) {
    var sql = " UPDATE saltern_info SET is_deleted = 1  WHERE saltern_info_seq IN (" + ids + ")  ";
    dao.doQuery(sql, callback);
}
exports.deleteServer = deleteServer;

// ip가 존재하는지 체크
var checkUpdateAble = function (saltern_info_seq, ip, callback) {
    var sql = " SELECT ip ";
    sql += " FROM saltern_info WHERE saltern_info_seq != '" + saltern_info_seq + "' AND is_deleted = 0 AND ip = '" + ip + "'";
    dao.doQuery(sql, callback);
}
exports.checkUpdateAble = checkUpdateAble;




function MRF(value) {
    return BU.MRF(value);
}

function MSF(value) {
    return BU.makeSearchField(value);
}