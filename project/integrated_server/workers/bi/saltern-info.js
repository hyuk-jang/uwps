var dao = require("./dao.js");
var BU = require("../../public/js/util/baseUtil.js");


var getOperationSalternList = function (callback) {
    var sql = "SELECT t_main.*, t_map.path, t_map.url, t_map.filename, t_wl.x, t_wl.y FROM saltern_Info t_main ";
    sql += " LEFT OUTER JOIN saltern_map t_map ON t_map.saltern_info_seq = t_main.saltern_info_seq ";
    sql += " LEFT OUTER JOIN weather_location t_wl ON t_wl.weather_location_seq = t_main.weather_location_seq ";
    sql += " WHERE t_main.is_deleted = 0 ";

    // sql = " SELECT *, ";
    // sql += ' IFNULL ( (SELECT name  FROM weather_device WHERE weather_device.weather_device_seq = main.weather_device_seq ),"") AS weathername ';
    // sql += "	,(SELECT sub.path FROM saltern_map sub WHERE sub.saltern_info_seq = main.saltern_info_seq)  as path";
    // sql += "	,(SELECT sub.filename FROM saltern_map sub WHERE sub.saltern_info_seq = main.saltern_info_seq)  as map_ver";
    // sql += "	,(SELECT sub.url FROM saltern_map sub WHERE sub.saltern_info_seq = main.saltern_info_seq)  as map_url";
    // sql += " , (  SELECT COUNT(*) FROM saltern_map WHERE saltern_info_seq = main.saltern_info_seq  )  AS mapCount ";
    // sql += " FROM saltern_Info main WHERE is_deleted = 0  ";

    dao.doQuery(sql, callback);
}
exports.getOperationSalternList = getOperationSalternList;