const BU = require('base-util-jh').baseUtil;

const bmjh = require('base-model-jh');

class B_Kma extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);


  }

  /**
   * 저장소에 저장된 내역을 기준으로 insert, update 수행 후 Promise 반환
   * @param {Object} storage TempStroage Class Object
   * @param {String} tblName 
   * @param {String} updateKey 
   * @return {Promise}
   */
  async doQuery(storage, tblName, updateKey, hasViewQuery) {
    let finalStorage = storage.getFinalStorage();

    await this.setTables(tblName, finalStorage.insertObjList, hasViewQuery);

    await this.updateTablesByPool(tblName, updateKey, finalStorage.updateObjList);

    return true;
  }

  /**
   * DB에 저장된 일기예보 추출
   * @param {number} x
   * @param {number} y
   * @return {Array.<{kma_data_seq: number, x: number, y: number, temp: number, pty: number, pop: number, r12: number, wf_kor: string, wf_en: string, ws: number, wd: number, reh: number, applydate: Date, writedate: Date, updatedate: Date}> }
   */
  getPrevWeatherCast(x, y) {
    let sql = `SELECT * FROM kma_data WHERE applydate > CURDATE() AND x = ${x} AND y = ${y} ORDER BY kma_data_seq DESC  LIMIT 24`;

    return this.db.single(sql, '', false);
  }


  // Controller에서 요청 시
  // TODO 예전에 쓰던 내일 우천 확율 구하기.
  getTomorrowPop(controllerNum) {
    var sql = ' SELECT Max(pop) Max FROM';
    sql += ' (';
    sql += ' SELECT A.saltern_info_seq, A.weather_location_seq ';
    sql += ' ,(SELECT B.x FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) x';
    sql += ' ,(SELECT B.y FROM weather_location B WHERE B.weather_location_seq = A.weather_location_seq) y';
    sql += ' FROM saltern_info A ';
    sql += ' WHERE A.saltern_info_seq = ' + controllerNum + ' ';
    sql += ' ) C';
    sql += ' LEFT OUTER JOIN kma_data D ON C.x = D.x AND D.y = C.y';
    sql += ' WHERE DATE_FORMAT(applydate, \'%Y-%m-%d\') = DATE_ADD(CURDATE(), INTERVAL 1 DAY)';

    return this.db.single(sql);
  }

}
module.exports = B_Kma;