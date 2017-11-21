const bmjh = require('base-model-jh');
const Promise = require('bluebird')
const BU = require('base-util-jh').baseUtil;

class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  getDailyPowerReport() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w` +
      ` from inverter_data ` +
      ` where writedate>= CURDATE() and writedate<CURDATE() + 1` +
      ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
      .then(result => {
        // BU.CLI(result)
        let dateList = _.pluck(result, 'writedate');
        let whList = _.pluck(result, 'out_w');
        let chartList = [
          dateList,
          whList,
        ];

        return {
          chartList,
          dailyPowerRange: {
            start: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + '00:00:00',
            end: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + _.last(dateList) + ':00',
          }
        }
      });
  }

  /**
   * return connector report
   * @param {Object} connector {connector_seq, ch_number}
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {String} selectType day or month or tear
   */
  getConnectorHistory(connector = {connector_seq,ch_number}) {
    let range = [];
    let sql = `
      SELECT 
        connector_seq,
        writedate, 
        DATE_FORMAT(writedate,'%H:%i') AS hour_time,
        ROUND(v / 10, 1) AS vol
    `;
    for (let i = 1; i <= connector.ch_number; i++) {
      sql += ` 
        ${i === 1 ? ',' : ''}
        ROUND(ch_${i}/10,1) AS ch_${i}
        ${i === connector.ch_number ? '' : ','}
      `;
    }
    
    sql += `
    FROM connector_data
    WHERE writedate>= CURDATE() and writedate<CURDATE() + 1
      AND connector_seq = ${connector.connector_seq}
    GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), connector_seq
    ORDER BY connector_seq, writedate
    `;

    return this.db.single(sql, '', true)
      .then(result => {
        return {
          range,
          gridInfo: result
        }
      })
    ;
  }

  /**
   * return connector report
   * @param {Object} connector {connector_seq, ch_number}
   * @param {String} startDate 
   * @param {String} endDate 
   * @param {String} searchType day or month or tear
   */
  getTrendHistory(connector = {
    connector_seq,
    ch_number
  }, searchRange = {
    strStartDate,
    strEndDate
  }, searchType) {
    let strStartDate = searchRange.strStartDate;
    let strEndDate = searchRange.strEndDate;

    let startDate = new Date(strStartDate);
    let endDate = new Date(strEndDate);

    // TEST
    // endtDate = new Date('2017-11-16');
    // strEndDate = BU.convertDateToText(endtDate)
    // TEST

    
    
    
    // 기간 검색일 경우 시작일과 종료일의 날짜 차 계산하여 searchType 정의
    if(searchType === 'range'){
      let gapDate =  BU.calcDateInterval(strEndDate, strStartDate)
      BU.CLI(gapDate)
      if(gapDate.remainDay >= 365){
        searchType = 'year';
      } else if(gapDate.remainDay > 29){
        searchType = 'month';
      } else if(gapDate.remainDay > 0){
        searchType = 'day';
      } else {
        searchType = 'hour';
      }
    }

    

    // let range = BU.getBetweenDatePoint(strEndDate, strStartDate, searchType);
    // BU.CLI(range)

    let dateFormat = '';
    switch (searchType) {
      case 'year':
        dateFormat = '%Y';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      case 'day':
        dateFormat = '%Y-%m-%d';
        break;
      case 'hour':
        dateFormat = '%Y-%m-%d %H';
        break;
      default:
        dateFormat = '%Y-%m';
        break;
    }

    let sql = `
    SELECT calc_cnt.*, DATE_FORMAT(writedate,"${dateFormat}") AS group_date
        ,AVG(vol) AS avg_vol
     `;
    for (let i = 1; i <= connector.ch_number; i++) {
      sql += ` ${i === 1 ? ',' : ''}SUM(ch_a_${i}) AS total_ch_a_${i}
      ,ROUND(SUM(ch_a_1 * vol), 2) AS total_ch_wh_${i}
      ${i === connector.ch_number ? '' : ','}
      `;
    };

    sql += `
     FROM(
      SELECT 
        connector_seq,
        writedate, 
        DATE_FORMAT(writedate, "${dateFormat}") AS dateFormat,
        ROUND(v / 10, 1) AS vol
    `;
    for (let i = 1; i <= connector.ch_number; i++) {
      sql += `${i === 1 ? ',' : ''}ROUND(ch_${i}/10,1) AS ch_a_${i}${i === connector.ch_number ? '' : ','}`;
    }

    sql += `
      FROM connector_data
      WHERE writedate>= "${strStartDate}" and writedate<"${strEndDate}"
        AND connector_seq = ${connector.connector_seq}
      GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), connector_seq
      ORDER BY connector_seq, writedate) calc_cnt
    GROUP BY DATE_FORMAT(writedate,"${dateFormat}"), connector_seq
    `;

    // return this.db.single(sql, '', true)
      return this.db.single(sql)
      .then(result => {
        return {
          // range,
          gridPowerInfo: result
        }
      });
  }

  /**
   * 접속반, Relation, trend를 융합하여 chart data 를 뽑아냄
   * @param {Object} connectorInfo 
   * @param {Array} relationInfo 
   * @param {Array} connectorHistory 
   */
  processModulePowerTrend(connectorInfo = {ch_number,connector_seq}, relationInfo, connectorHistory = {range, gridPowerInfo}) {
    // 트렌드를 구할 모듈 정보 초기화
    let moudlePowerReport = [];
    for (let cnt = 1; cnt <= connectorInfo.ch_number; cnt++) {
      let moduleInfo = _.findWhere(relationInfo, {
        connector_seq: connectorInfo.connector_seq,
        channel: cnt
      });
      let addObj = {};
      addObj.id = `id_${moduleInfo.connector_seq}_${cnt}`;
      addObj.name = `CH_${cnt} ${moduleInfo.target_name}`;
      addObj.group_date = [];
      addObj.data = []
      moudlePowerReport.push(addObj);
    }

    // 검색 기간 만큼 반복
    connectorHistory.range.forEach(strDateFormat => {
      // dateFormat 이 같은 데이터 추출
      let findGridObj = _.findWhere(connectorHistory.gridPowerInfo, {group_date:strDateFormat});
      // 같은 데이터가 없다면 빈 데이터 삽입
      if (_.isEmpty(findGridObj)) {
        moudlePowerReport.forEach(element => {
          element.data.push('');
        });
      } else {
        // 정의된 접속반 연결 채널 수 만큼 반복
        for (let cnt = 1; cnt <= connectorInfo.ch_number; cnt++) {
          // 고유 채널명 정의
          let targetId =`id_${findGridObj.connector_seq}_${cnt}`;
          // 고유 채널과 일치하는 moudlePowerReport 객체 찾아옴
          let findPowerReport = _.findWhere(moudlePowerReport, {id:targetId});
          // 해당 데이터 삽입
          findPowerReport.data.push(findGridObj[`total_ch_wh_${cnt}`]);
        }
      }
    });

    // BU.CLI('moudlePowerReport', moudlePowerReport);
    return {
      range: connectorHistory.range,
      series: moudlePowerReport
    };
  }

  /**
   * 검색 종류와 검색 기간에 따라 검색 시작 값과 종료 값 반환
   * @param {String} searchType day, month, year, range
   * @param {String} start_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @param {String} end_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @return {Object} {startDate, endDate}
   */
  getSearchRange(searchType, start_date, end_date) {
    BU.CLIS(searchType, start_date, end_date)
    let startDate = start_date ? BU.convertTextToDate(start_date) : new Date();
    let endDate = end_date ? BU.convertTextToDate(end_date) : new Date(startDate);

    let returnValue = {
      searchType,
      strStartDate: null, // sql writedate range 사용
      strEndDate: null,   // sql writedate range 사용
      rangeStart: '',     // Chart 위에 표시될 시작 날짜
      rangeEnd: '',       // Chart 위에 표시될 종료 날짜
      strStartDateInputValue: '',   // input에 표시될 시작 날짜
      strEndDateInputValue: '',     // input에 표시될 종료 날짜
    }

    // 검색 시작 시분초 초기화
    startDate.setHours(0, 0, 0);
    if (searchType === 'hour' || searchType === '') {
      endDate = (new Date(startDate)).addDays(1);
      returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', 2);
      returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', 2);
    } else if (searchType === 'day') {
      startDate.setDate(1)
      endDate = (new Date(startDate)).addMonths(1);
      returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', 1);
      returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', 1);
      // returnValue.rangeEnd = BU.convertDateToText((new Date(endDate)).setDate(-1), '', 2);
    } else if (searchType === 'month') {
      startDate.setMonth(0, 1)
      endDate = (new Date(startDate)).addYear(1);
      returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', 0);
      returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', 0);
      // returnValue.rangeEnd = BU.convertDateToText((new Date(endDate)).setDate(-1), '', 2);
    } else if (searchType === 'range') {
      endDate = end_date ? new Date(end_date) : new Date();

      returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', 2);
      returnValue.rangeEnd = BU.convertDateToText(endDate, 'kor', 2);

      returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', 2);
      returnValue.strEndDateInputValue = BU.convertDateToText(endDate, '', 2);
    } 
    returnValue.strStartDate = BU.convertDateToText(startDate);
    returnValue.strEndDate = BU.convertDateToText(endDate);
    // returnValue.rangeStart = BU.convertDateToText(startDate, '', 2);
    // BU.CLI(returnValue)
    return returnValue;
  }

  getMeasureTime(gridReport, startDate, endDate, selectedType) {
    // BU.CLI(gridReport);


  }



  getInverterHistory(inverter_seq_list, startDate, endDate) {
    startDate = startDate ? startDate : 'CURDATE()';
    endDate = endDate ? endDate : 'CURDATE() + 1';

    let sql = `
      SELECT 
      inverter_seq,
      writedate, 
      DATE_FORMAT(writedate,'%H:%i:%S') AS hour_time,
      ROUND(in_a / 10, 1) AS in_a,
      ROUND(in_v / 10, 1) AS in_v,
      ROUND(in_w / 10, 1) AS in_w,
      ROUND(out_a / 10, 1) AS out_a,
      ROUND(out_v / 10, 1) AS out_v,
      ROUND(out_w / 10, 1) AS out_w,
      ROUND(p_f / 10, 1) AS p_f,
      ROUND(d_wh / 10, 1) AS d_wh,
      ROUND(c_wh / 10, 1) AS c_wh
      FROM inverter_data
        WHERE writedate>= ${startDate} AND writedate<${endDate}
    `;
    if (Array.isArray(inverter_seq_list)) {
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
    }
    sql += `
      GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
      ORDER BY inverter_seq, writedate
    `;

    return this.db.single(sql)
      .then(result => {
        return _.groupBy(result, rows => rows.inverter_seq);
      })
  }

}
module.exports = BiModule;