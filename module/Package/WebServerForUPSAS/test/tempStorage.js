const _ = require('underscore');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;



class Temp extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);
  }


  /**
   * Inverter에서 수집된 월의 발전량을 출력
   * @param {Date} targetDate 해당 월
   * @param {number|Array} inverter_seq Format => Number or Array or undefinded
   * @return {Promise} m_kwh 반환
   */
  async getMonthPower(targetDate, inverter_seq) {
    targetDate = targetDate instanceof Date ? targetDate : new Date();
    let sql = ` 
      SELECT 
        ROUND(SUM(sum_d_wh) / 10 / 1000, 3) AS m_kwh
        FROM
        (
        SELECT
          *,
          DATE_FORMAT(writedate,"%Y-%m") AS group_date,
          SUM(max_d_wh) AS sum_d_wh
          FROM
          (SELECT 
            *,
            MAX(d_wh) AS max_d_wh
            FROM 
            inverter_data
            GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d"), inverter_seq
          ) AS step_1
      `;
    if (Number.isInteger(inverter_seq)) {
      sql += `WHERE pv.inverter_seq = (${inverter_seq})`;
    } else if (Array.isArray(inverter_seq)) {
      sql += `WHERE pv.inverter_seq IN (${inverter_seq})`;
    }
    sql += `
          GROUP BY DATE_FORMAT(writedate,"%Y-%m"), inverter_seq
        ) AS step_2
        WHERE group_date = "${BU.convertDateToText(targetDate, '', 1, 0)}"
        GROUP BY group_date	
    `;
    let monthData = await this.db.single(sql, '', false);
    if (monthData.length) {
      return monthData[0].m_kwh;
    } else {
      return 0;
    }
  }

  
  /**
   * 금일 발전 레포트 가져옴
   * @param {searchRange} searchRange 
   * @return {{chartList: Array.<{dateList: Array, whList: Array}>, dailyPowerRange: {start: string, end: string} }} 차트 구성 정보 목록(날짜, 출력 전류), 금일 발전현황(시작 날짜, 종료 날짜)
   */
  getDailyPowerReport(searchRange) {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w
       from inverter_data
       WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
       group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql, '', true)
      .then(result => {
        // BU.CLI(result)
        let dateList = _.pluck(result, 'writedate');
        let whList = _.pluck(result, 'out_w');
        let chartList = [
          dateList,
          whList,
        ];

        let dateOffset = _.isEmpty(dateList) ? '23:00' : _.last(dateList);
        

        return {
          chartList,
          dailyPowerRange: {
            start: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + '00:00:00',
            end: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + dateOffset + ':00',
          }
        };
      });
  }
  /**
   * 
   * @param {number[]=} inverter_seq_list 
   * @param {string} strStartDate 
   * @param {string} strEndDate 
   */
  getInverterHistory(inverter_seq_list, strStartDate, strEndDate) {
    strStartDate = strStartDate ? `'${strStartDate}'` : 'CURDATE()';
    strEndDate = strEndDate ? `'${strEndDate}'` : 'CURDATE() + 1';

    let sql = `
      SELECT 
      inverter_seq,
      writedate, 
      DATE_FORMAT(writedate,'%H') AS hour_time,
      ROUND(AVG(in_a) / 10, 1) AS in_a,
      ROUND(AVG(in_v) / 10, 1) AS in_v,
      ROUND(AVG(in_w) / 10, 1) AS in_w,
      ROUND(AVG(out_a) / 10, 1) AS out_a,
      ROUND(AVG(out_v) / 10, 1) AS out_v,
      ROUND(AVG(out_w) / 10, 1) AS out_w,
      ROUND(AVG(p_f) / 10, 1) AS p_f,
      ROUND(d_wh / 10, 1) AS d_wh,
      ROUND(MAX(c_wh) / 10, 1) AS max_c_wh,
      ROUND(MIN(c_wh) / 10, 1) AS min_c_wh,
      ROUND((MAX(c_wh) - MIN(c_wh)) / 10, 1) AS interval_wh
      FROM inverter_data
        WHERE writedate>= ${strStartDate} AND writedate<${strEndDate}
    `;
    if (Array.isArray(inverter_seq_list)) {
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
    }
    sql += `
      GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
      ORDER BY inverter_seq, writedate
    `;
    return this.db.single(sql, '', false);
    // .then(result => {
    //   return _.groupBy(result, rows => rows.inverter_seq);
    // });
  }


  /**
   * 경보 내역 리스트
   * @param {searchRange} searchRange 검색 조건 객체
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getAlarmList(searchRange){
    let sql = `
      SELECT itd.*
      , ivt.target_name
       FROM
        (
        SELECT * FROM inverter_trouble_data
        WHERE occur_date>= "${searchRange.strStartDate}" and occur_date<"${searchRange.strEndDate}"
        ) AS itd
      JOIN inverter ivt
        ON ivt.inverter_seq = itd.inverter_seq 
      ORDER BY itd.occur_date DESC	
    `;

    // 총 갯수 구하는 Query 생성
    let totalCountQuery = `SELECT COUNT(*) AS total_count FROM (${sql}) AS count_tbl`;
    // Report 가져오는 Query 생성
      
    let mainQuery = `${sql}\n LIMIT ${(searchRange.page - 1) * searchRange.pageListCount}, ${searchRange.pageListCount}`;
    let resTotalCountQuery = await this.db.single(totalCountQuery, '', false);
    let totalCount = resTotalCountQuery[0].total_count;
    let resMainQuery = await this.db.single(mainQuery, '', false);

    return {
      totalCount,
      report: resMainQuery
    };
  }



}
module.exports = Temp;