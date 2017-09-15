var dao = require("../dao.js");

var getServer = function(saltern_info_seq, callback){
    var sql = "SELECT main.*, ";
    sql += "	(SELECT sub.path FROM saltern_map sub WHERE sub.saltern_info_seq = " + saltern_info_seq + ")  as path,";
    sql += "	(SELECT sub.filename FROM saltern_map sub WHERE sub.saltern_info_seq = " + saltern_info_seq + ")  as map_ver,";
    sql += "	(SELECT sub.url FROM saltern_map sub WHERE sub.saltern_info_seq = " + saltern_info_seq + ")  as map_url";
	sql += "	FROM saltern_info main ";
	sql += "	WHERE main.saltern_info_seq = " + saltern_info_seq + " AND main.is_deleted = 0;";

    dao.doQuery(sql, callback);
}
exports.getServer = getServer;



var getServerList = function (saltern_info_seq, callback) {
    var sql = " SELECT * FROM saltern_map WHERE saltern_info_seq = '" + MRF(saltern_info_seq) + "' ";
    dao.doQuery(sql, callback);
}
exports.getServerList = getServerList;


var deleteMap = function (saltern_info_seq, callback) {
    var sql = " DELETE FROM saltern_map WHERE  saltern_info_seq = '" + MRF(saltern_info_seq) + "' ";
    dao.doQuery(sql, callback);
}
exports.deleteMap = deleteMap;

var createMap = function (server_seq, file_name, file_path, url, callback) {
    var writedate = BU.convertDateToText(new Date());
    var sql = " INSERT INTO `saltern_integratedserver`.`saltern_map` (`saltern_info_seq`, `path`, `url`, `filename`, `writedate`) ";
    sql += "VALUES ('" + MRF(server_seq) + "', '"
        + MRF(file_path) + "', '"
        + MRF(url) + "', '"
        + MRF(file_name) + "', '"
        + MRF(writedate) + "') ";
    dao.doQuery(sql, callback);
}
exports.createMap = createMap;







function MRF(value) {
    return BU.MRF(value);
}

function MSF(value) {
    return BU.makeSearchField(value);
}