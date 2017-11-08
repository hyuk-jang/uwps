

const bmjh = require('base-model-jh');

class B_Kma extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);


  }



  // DB에 저장된 일기예보 추출
  getPrevWeatherCast(currDate) {
    let sql = `SELECT * FROM kma_data WHERE applydate > CURDATE() ORDER BY kma_data_seq DESC  LIMIT 24`;

    return this.db.single(sql);
  }


  // Controller에서 요청 시
  // TODO 예전에 쓰던 내일 우천 확율 구하기.
  getTomorrowPop(controllerNum) {
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

    return this.db.single(sql);
  }

}
module.exports = B_Kma;