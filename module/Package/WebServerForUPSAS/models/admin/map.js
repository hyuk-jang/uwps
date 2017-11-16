var dao = require("../dao.js");

var getServer = function(saltpond_info_seq, callback){
    var sql = "SELECT main.*, ";
    sql += "	(SELECT sub.path FROM saltpond_map sub WHERE sub.saltpond_info_seq = " + saltpond_info_seq + ")  as path";
	sql += "	FROM saltpond_info main ";
	sql += "	WHERE main.saltpond_info_seq = " + saltpond_info_seq + " AND main.is_deleted = 0;";

    dao.doQuery(sql, callback);
}
exports.getServer = getServer;



var getServerList = function (saltpond_info_seq, callback) {
    var sql = " SELECT * FROM saltpond_map WHERE saltpond_info_seq = '" + MRF(saltpond_info_seq) + "' ";
    dao.doQuery(sql, callback);
}
exports.getServerList = getServerList;


var deleteMap = function (saltpond_info_seq, callback) {
    var sql = " DELETE FROM saltpond_map WHERE  saltpond_info_seq = '" + MRF(saltpond_info_seq) + "' ";
    dao.doQuery(sql, callback);
}
exports.deleteMap = deleteMap;

var createMap = function (server_seq, file_name, file_path, url, callback) {
    var writedate = BU.convertDateToText(new Date());
    var sql = " INSERT INTO `saltpond_integratedserver`.`saltpond_map` (`saltpond_info_seq`, `path`, `url`, `filename`, `writedate`) ";
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