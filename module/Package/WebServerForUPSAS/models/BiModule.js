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
  getConnectorHistory(connector = {
    connector_seq,
    ch_number
  }) {
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
      });
  }

  /**
   * return connector report
   * @param {Object} connector {connector_seq, ch_number}
   * @param {Object} searchRange 
   */
  getReportByConnector(connector = {
    connector_seq,
    ch_number
  }, searchRange = {
    searchType,
    strStartDate,
    strEndDate
  }) {
    let searchType = searchRange.searchType;
    let strStartDate = searchRange.strStartDate;
    let strEndDate = searchRange.strEndDate;

    let startDate = new Date(strStartDate);
    let endDate = new Date(strEndDate);

    // TEST
    // endtDate = new Date('2017-11-16');
    // strEndDate = BU.convertDateToText(endtDate)
    // TEST

    // BU.CLI(searchRange)


    // 기간 검색일 경우 시작일과 종료일의 날짜 차 계산하여 searchType 정의
    if (searchType === 'range') {
      let gapDate = BU.calcDateInterval(strEndDate, strStartDate);
      // remainDay + remainHour + remainMin + remainSec
      let sumValues = Object.values(gapDate).sum();
      if (gapDate.remainDay >= 365) {
        searchRange.searchType = searchType = 'year';
      } else if (gapDate.remainDay > 29) {
        searchRange.searchType = searchType = 'month';
      } else if (gapDate.remainDay > 0 && sumValues > 1) {
        searchRange.searchType = searchType = 'day';
      } else {
        searchRange.searchType = searchType = 'hour';
      }
    }

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

    let betweenDatePointObj = BU.getBetweenDatePoint(strEndDate, strStartDate, searchType);
    // BU.CLI(betweenDatePointObj)

    // return this.db.single(sql, '', true)
    return this.db.single(sql)
      .then(result => {
        return {
          betweenDatePointObj,
          gridPowerInfo: result
        }
      });
  }

    /**
   * return connector report
   * @param {Array} inverterSeqList {connector_seq, ch_number}
   * @param {Object} searchRange 
   */
  getReportByInverter(inverterSeqList, searchRange) {
    let searchType = searchRange.searchType;
    let strStartDate = searchRange.strStartDate;
    let strEndDate = searchRange.strEndDate;

    let startDate = new Date(strStartDate);
    let endDate = new Date(strEndDate);

    // TEST
    // endtDate = new Date('2017-11-16');
    // strEndDate = BU.convertDateToText(endtDate)
    // TEST

    // BU.CLI(searchRange)


    // 기간 검색일 경우 시작일과 종료일의 날짜 차 계산하여 searchType 정의
    if (searchType === 'range') {
      let gapDate = BU.calcDateInterval(strEndDate, strStartDate);
      // remainDay + remainHour + remainMin + remainSec
      let sumValues = Object.values(gapDate).sum();
      if (gapDate.remainDay >= 365) {
        searchRange.searchType = searchType = 'year';
      } else if (gapDate.remainDay > 29) {
        searchRange.searchType = searchType = 'month';
      } else if (gapDate.remainDay > 0 && sumValues > 1) {
        searchRange.searchType = searchType = 'day';
      } else {
        searchRange.searchType = searchType = 'hour';
      }
    }

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
      SELECT trend_ivt_tbl.*, 
      DATE_FORMAT(writedate,"${dateFormat}") AS group_date,
      SUM(in_wh) AS total_in_wh,
      SUM(out_wh) AS total_out_wh
      FROM
        (
        SELECT
        inverter_seq,
        writedate,
        DATE_FORMAT(writedate, "${dateFormat}") AS dateFormat
        ,ROUND(in_w / 10, 1) AS in_wh
        ,ROUND(in_v / 10, 1) AS in_vol
        ,ROUND(out_w / 10, 1) AS out_wh
        ,ROUND(out_v / 10, 1) AS out_vol
        FROM inverter_data
        WHERE writedate>= "${strStartDate}" and writedate<"${strEndDate}"
      `;
      if(inverterSeqList){
        sql += `AND inverter_seq IN (${inverterSeqList})`;
      }
        sql += `
        GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
        ORDER BY inverter_seq, writedate
        ) trend_ivt_tbl
      GROUP BY DATE_FORMAT(writedate,"${dateFormat}"), inverter_seq
    `;

    let betweenDatePointObj = BU.getBetweenDatePoint(strEndDate, strStartDate, searchType);
    // BU.CLI(betweenDatePointObj)

    return this.db.single(sql, '', true)
    // return this.db.single(sql)
      .then(result => {
        return {
          betweenDatePointObj,
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
  processReportByConnector(connectorInfo = {
    ch_number,
    connector_seq
  }, relationInfo, connectorHistory = {
    betweenDatePointObj,
    gridPowerInfo
  }, searchRange) {
    BU.CLI('processModulePowerTrend', searchRange)
    // 트렌드를 구할 모듈 정보 초기화
    let moudlePowerReport = [];
    let hasData = false;  // 데이터가 있는지 없는지
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
    connectorHistory.betweenDatePointObj.fullTxtPoint.forEach((strDateFormat, ftpIndex) => {
      // dateFormat 이 같은 데이터 추출
      let findGridObj = _.findWhere(connectorHistory.gridPowerInfo, {
        group_date: strDateFormat
      });
      // 같은 데이터가 없다면 빈 데이터 삽입
      if (_.isEmpty(findGridObj)) {
        moudlePowerReport.forEach(element => {
          element.data.push('');
        });
      } else {
        // 정의된 접속반 연결 채널 수 만큼 반복
        for (let cnt = 1; cnt <= connectorInfo.ch_number; cnt++) {
          // 고유 채널명 정의
          let targetId = `id_${findGridObj.connector_seq}_${cnt}`;
          // 고유 채널과 일치하는 moudlePowerReport 객체 찾아옴
          let findPowerReport = _.findWhere(moudlePowerReport, {
            id: targetId
          });
          // 해당 데이터 삽입
          let totalPower = findGridObj[`total_ch_wh_${cnt}`];
          hasData = totalPower ? true : hasData;  // 데이터가 한개라면 있다면 true
          switch (searchRange.searchType) {
            case 'year':
              totalPower = (totalPower / 1000 / 1000).toFixed(4);
              break;
            case 'month':
              totalPower = (totalPower / 1000).toFixed(3);
              break;
            case 'day':
              totalPower = (totalPower / 1000).toFixed(3);
              break;
            case 'hour':
              break;
            default:
              break;
          }
          // BU.CLI('totalPower',totalPower)
          findPowerReport.data.push(Number(totalPower));
        }
      }
    });

    let mainTitle = '';
    let xAxisTitle = '';
    let yAxisTitle = '';
    switch (searchRange.searchType) {
      case 'year':
        xAxisTitle = '시간(년)'
        yAxisTitle = '발전량(MWh)'
        break;
      case 'month':
        xAxisTitle = '시간(월)'
        yAxisTitle = '발전량(kWh)'
        break;
      case 'day':
        xAxisTitle = '시간(일)'
        yAxisTitle = '발전량(kWh)'
        break;
      case 'hour':
        xAxisTitle = '시간(시)'
        yAxisTitle = '발전량(Wh)'
        break;
      default:
        break;
    }

    if (searchRange.rangeEnd !== '') {
      mainTitle = `[ ${searchRange.rangeStart} ~ ${searchRange.rangeEnd} ]`;
    } else {
      mainTitle = `[ ${searchRange.rangeStart} ]`;
    }

    // BU.CLI('moudlePowerReport', moudlePowerReport);
    return {
      hasData,
      chartOptionInfo: {
        mainTitle,
        xAxisTitle,
        yAxisTitle,
        columnList:connectorHistory.betweenDatePointObj.shortTxtPoint
      },
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
    let endDate = searchType === 'range' && end_date !== '' ? BU.convertTextToDate(end_date) : new Date(startDate);

    let returnValue = {
      searchType,
      strStartDate: null, // sql writedate range 사용
      strEndDate: null, // sql writedate range 사용
      rangeStart: '', // Chart 위에 표시될 시작 날짜
      rangeEnd: '', // Chart 위에 표시될 종료 날짜
      strStartDateInputValue: '', // input에 표시될 시작 날짜
      strEndDateInputValue: '', // input에 표시될 종료 날짜
    }

    let spliceIndex = 0;

    // 검색 시작 시분초 초기화
    startDate.setHours(0, 0, 0);
    if (searchType === 'hour' || searchType === '') {
      spliceIndex = 2;
      endDate = (new Date(startDate)).addDays(1);
    } else if (searchType === 'day') {
      spliceIndex = 1;
      startDate.setDate(1)
      endDate = (new Date(startDate)).addMonths(1);
    } else if (searchType === 'month') {
      spliceIndex = 0;
      startDate.setMonth(0, 1)
      endDate = (new Date(startDate)).addYear(1);
    } else if (searchType === 'range') {
      spliceIndex = 2;
      // endDate = end_date ? new Date(end_date) : new Date();
      // chart title에 사용될 기간을 설정
      returnValue.rangeEnd = BU.convertDateToText(endDate, 'kor', spliceIndex, 0);
      // 검색 조건 input value txt 설정
      returnValue.strEndDateInputValue = BU.convertDateToText(endDate, '', spliceIndex, 0);
      // SQL 날짜 검색에 사용할 범위를 위하여 하루 증가
      endDate = (new Date(endDate)).addDays(1);
    }
    returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', spliceIndex, 0);
    returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', spliceIndex, 0);
    returnValue.strStartDate = BU.convertDateToText(startDate);
    returnValue.strEndDate = BU.convertDateToText(endDate);
    // BU.CLI(returnValue)
    return returnValue;
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