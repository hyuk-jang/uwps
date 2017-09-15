var dao = require("./dao.js");
var BU = require("../../public/js/util/baseUtil.js");

// 기상청위치 정보 리스트 조회
/**
 * Saltern에 연결된 기상청 동네예보 위치 가져옴
 * @param {fn} callback 
 */
var getWeatherLocationList = function (callback) {
    var sql = "SELECT";
    sql += "    @ROWNUM := @ROWNUM + 1 AS ROWNUM";
    sql += "    ,main.weather_location_seq, sub.x, sub.y ";
    sql += " FROM";
    sql += "    saltern_info main";
    sql += "    left outer join weather_location sub on main.weather_location_seq = sub.weather_location_seq";
    sql += "    ,(SELECT @ROWNUM := 0) R";
    sql += "    WHERE main.is_deleted = 0";
    sql += "    GROUP BY main.weather_location_seq DESC";

    //console.log(sql)
    dao.doQuery(sql, callback);
}
exports.getWeatherLocationList = getWeatherLocationList;


// DB에 저장된 일기예보 추출
var getPrevWeatherCast = function (locationX, locationY, currDate, callback) {
    //BU.CLIS(WeatherDeviceStatusList)
    var sql = "SELECT Result.* FROM(";
    sql += "	SELECT @RNUM := @RNUM + 1 AS ROWNUM, main.*";
    sql += "	FROM";
    sql += "	  (";
    sql += "	    SELECT *";
    sql += "	    FROM weathercast_data t";
    sql += "	    WHERE t.x = " + locationX + " AND t.y = " + locationY + "";
    sql += "		 AND IF(applydate > '" + currDate + "', 1, 0) = 1";
    sql += "	    ORDER BY weathercast_data_seq DESC";
    sql += "	  ) main,";
    sql += "	( SELECT @RNUM := 0 ) R";
    sql += " ) Result";
    sql += " WHERE Result.ROWNUM <= 24";

    dao.doQuery(sql, callback);
}
exports.getPrevWeatherCast = getPrevWeatherCast;

// Controller에서 요청 시
var getTomorrowPop = function (param, callback) {
    var controllerNum = param.controllerNum;
    var sql = " SELECT Max(pop) Max FROM";
    sql += " (";
    sql += " SELECT A.saltern_info_seq, A.weather_location_seq ";
    sql += " ,(SELECT B.x FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) x";
    sql += " ,(SELECT B.y FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) y";
    sql += " FROM saltern_info A ";
    sql += " WHERE A.saltern_info_seq = " + controllerNum + " ";
    sql += " ) C";
    sql += " LEFT OUTER JOIN weathercast_data D ON C.x = D.x AND D.y = C.y";
    sql += " WHERE DATE_FORMAT(applydate, '%Y-%m-%d') = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";

    dao.doQuery(sql, callback);
}
exports.getTomorrowPop = getTomorrowPop;


// 신규 일기예보 입력
var insertWeatherCast = function ({x, y, applydate,  temp, pty, pop, r12, ws, wd, reh}, callback) {
    //BU.CLIS(WeatherDeviceStatusList)
    //console.log("InsertWeatherCast");
    var sql = "INSERT INTO";
    sql += "	weathercast_data";
    sql += "	(x, y, applydate, temp, pty, pop, r12, ws, wd,reh, writedate, updatedate)";
    sql += "	  VALUES";
    sql += "	(" + x + "," + y + ",'" + applydate + "', " + temp + ", " + pty + "";
    sql += "	, " + pop + "," + r12 + "," + ws + ", " + wd + ", " + reh + "";
    sql += "	, '" + BU.convertDateToText(new Date()) + "', '" + BU.convertDateToText(new Date()) + "')";
    //console.log(sql);
    dao.doQuery(sql, callback);
}
exports.insertWeatherCast = insertWeatherCast;

// 일기예보 수정 입력
var updateWeatherCast = function ({x, y, applydate,  temp, pty, pop, r12, ws, wd, reh}, weathercast_data_seq, callback) {
    //BU.CLIS(WeatherDeviceStatusList)
    
    var sql = "UPDATE weathercast_data SET";
    sql += "	temp = " + temp + "";
    sql += "	,pty = " + pty + "";
    sql += "	,pop = " + pop + "";
    sql += "	,r12 = " + r12 + "";
    sql += "	,ws = " + ws + "";
    sql += "	,wd = " + wd + "";
    sql += "	,reh = " + reh + "";
    sql += "	,updatedate = '" + BU.convertDateToText(new Date()) + "'";
    sql += "WHERE";
    sql += "	weathercast_data_seq = " + weathercast_data_seq + "";
    dao.doQuery(sql, callback);
}
exports.updateWeatherCast = updateWeatherCast;