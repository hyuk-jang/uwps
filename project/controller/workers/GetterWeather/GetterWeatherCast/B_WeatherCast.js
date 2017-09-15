const Dao = require('./Dao.js');

class B_WeatherCast extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }

  getWeatherLocationList(callback) {
    var sql = "SELECT";
    sql += "    @ROWNUM := @ROWNUM + 1 AS ROWNUM";
    sql += "    ,main.weather_location_seq";
    sql += " FROM";
    sql += "    saltern_info main";
    sql += "    left outer join weather_location sub on main.weather_location_seq = sub.weather_location_seq";
    sql += "    ,(SELECT @ROWNUM := 0) R";
    sql += "    WHERE main.is_deleted = 0";
    sql += "    GROUP BY main.weather_location_seq DESC";

    //console.log(sql)
    this.doQuery(sql, callback);
  }

  // DB에 저장된 일기예보 추출
  getPrevWeatherCast(currDate, callback) {
    var sql = "SELECT Result.* FROM(";
    sql += "	SELECT @RNUM := @RNUM + 1 AS ROWNUM, main.*";
    sql += "	FROM";
    sql += "	  (";
    sql += "	    SELECT *";
    sql += "	    FROM kma_data t";
    sql += "	    WHERE IF(applydate > '" + currDate + "', 1, 0) = 1";
    sql += "	    ORDER BY kma_data_seq DESC";
    sql += "	  ) main,";
    sql += "	( SELECT @RNUM := 0 ) R";
    sql += " ) Result";
    sql += " WHERE Result.ROWNUM <= 24";
      // BU.CLI(this)
    this.doQuery(sql, callback);
  }

  // Controller에서 요청 시
  getTomorrowPop(param, callback) {
    var controllerNum = param.controllerNum;
    var sql = " SELECT Max(pop) Max FROM";
    sql += " (";
    sql += " SELECT A.saltern_info_seq, A.weather_location_seq ";
    sql += " ,(SELECT B.x FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) x";
    sql += " ,(SELECT B.y FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) y";
    sql += " FROM saltern_info A ";
    sql += " WHERE A.saltern_info_seq = " + controllerNum + " ";
    sql += " ) C";
    sql += " LEFT OUTER JOIN kma_data D ON C.x = D.x AND D.y = C.y";
    sql += " WHERE DATE_FORMAT(applydate, '%Y-%m-%d') = DATE_ADD(CURDATE(), INTERVAL 1 DAY)";

    this.doQuery(sql, callback);
  }

  // 신규 일기예보 입력
  insertWeatherCast({
    x,
    y,
    applydate,
    temp,
    pty,
    pop,
    r12,
    ws,
    wd,
    reh
  }, callback) {
    //BU.CLIS(WeatherDeviceStatusList)
    //console.log("InsertWeatherCast");
    var sql = "INSERT INTO";
    sql += "	kma_data";
    sql += "	(applydate, temp, pty, pop, r12, ws, wd,reh, writedate, updatedate)";
    sql += "	  VALUES";
    sql += "	('" + applydate + "', " + temp + ", " + pty + "";
    sql += "	, " + pop + "," + r12 + "," + ws + ", " + wd + ", " + reh + "";
    sql += "	, '" + BU.convertDateToText(new Date()) + "', '" + BU.convertDateToText(new Date()) + "')";
    //console.log(sql);
    this.doQuery(sql, callback);
  }

  // 일기예보 수정 입력
  updateWeatherCast({
    applydate,
    temp,
    pty,
    pop,
    r12,
    ws,
    wd,
    reh
  }, kma_data_seq, callback) {
    //BU.CLIS(WeatherDeviceStatusList)

    var sql = "UPDATE kma_data SET";
    sql += "	temp = " + temp + "";
    sql += "	,pty = " + pty + "";
    sql += "	,pop = " + pop + "";
    sql += "	,r12 = " + r12 + "";
    sql += "	,ws = " + ws + "";
    sql += "	,wd = " + wd + "";
    sql += "	,reh = " + reh + "";
    sql += "	,updatedate = '" + BU.convertDateToText(new Date()) + "'";
    sql += "WHERE";
    sql += "	kma_data_seq = " + kma_data_seq + "";
    this.doQuery(sql, callback);
  }
}

module.exports = B_WeatherCast;