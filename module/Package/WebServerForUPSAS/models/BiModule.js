const bmjh = require('base-model-jh');
const Promise = require('bluebird')
const BU = require('base-util-jh').baseUtil;

class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  /**
   * 접속반 기준 Module 최신 데이터 가져옴
   *  
   * @param {} photovoltatic_seq Format => Number or Array or undefinded
   */
  getModuleStatus(photovoltatic_seq) {
    let sql = `
      SELECT
        pv.*,
        ru.connector_ch,
        (SELECT amp / 10 FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS amp,
        (SELECT vol / 10 FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS vol,
        (SELECT writedate FROM module_data md WHERE md.photovoltaic_seq = pv.photovoltaic_seq ORDER BY md.writedate DESC LIMIT 1) AS writedate
        FROM
        photovoltaic pv
        JOIN relation_upms ru
          ON ru.photovoltaic_seq = pv.photovoltaic_seq
        LEFT JOIN saltern_block sb
          ON sb.saltern_block_seq = ru.saltern_block_seq
    `;
    if (Number.isInteger(photovoltatic_seq)) {
      sql += `WHERE pv.photovoltaic_seq = (${photovoltatic_seq})`
    } else if (Array.isArray(photovoltatic_seq)) {
      sql += `WHERE pv.photovoltaic_seq IN (${photovoltatic_seq})`
    }
    sql += 'ORDER BY ru.connector_seq, ru.connector_ch';

    return this.db.single(sql);
  }

  /**
   * Inverter에서 수집된 월의 발전량을 출력
   * @param {Date} targetDate 해당 월
   * @param {} inverter_seq Format => Number or Array or undefinded
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
      sql += `WHERE pv.inverter_seq = (${inverter_seq})`
    } else if (Array.isArray(inverter_seq)) {
      sql += `WHERE pv.inverter_seq IN (${inverter_seq})`
    }
    sql += `
          GROUP BY DATE_FORMAT(writedate,"%Y-%m"), inverter_seq
        ) AS step_2
        WHERE group_date = "${BU.convertDateToText(targetDate, '', 1, 0)}"
        GROUP BY group_date	
    `;
    let monthData = await this.db.single(sql);
    if (monthData.length) {
      return monthData[0].m_kwh;
    } else {
      return 0;
    }
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
   * 접속반에서 쓸 데이터 
   * @param {} moduleSeq null, String, Array
   */
  getModuleReportForConnector(moduleSeq) {
    let sql = `
      SELECT
        md.photovoltaic_seq,
        ROUND(AVG(amp / 10), 1) AS amp,
        ROUND(AVG(vol / 10), 1) AS vol,
        ROUND(AVG(amp) * AVG(vol) / 100, 1) AS wh,
        DATE_FORMAT(writedate,'%H') AS hour_time
        FROM module_data md
          WHERE writedate>= CURDATE() and writedate<CURDATE() + 1
    `;
    if (moduleSeq) {
      sql += `AND photovoltaic_seq IN (${moduleSeq})`
    }
    sql += `
          GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
          ORDER BY photovoltaic_seq, writedate
    `;
    return this.db.single(sql);
  }

  getModuleTrendByConnector(moduleSeq, searchRange) {
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
      SELECT
        md_group.photovoltaic_seq,
        DATE_FORMAT(writedate,"${dateFormat}") AS group_date,
        ROUND(SUM(avg_amp), 1) AS total_amp,
        ROUND(AVG(avg_vol), 1) AS avg_vol,
        ROUND(SUM(avg_amp) * AVG(avg_vol), 1) AS total_wh
        FROM
        (
        SELECT
          md.photovoltaic_seq,
          writedate,
          ROUND(AVG(amp / 10), 1) AS avg_amp,
          ROUND(AVG(vol / 10), 1) AS avg_vol,
          DATE_FORMAT(writedate,"%H") AS hour_time
          FROM module_data md
        WHERE writedate>= "${strStartDate}" and writedate<"${strEndDate}"
    `;
    if (moduleSeq.length) {
      sql += `AND photovoltaic_seq IN (${moduleSeq})`
    }
    sql += `
        GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
        ORDER BY photovoltaic_seq, writedate
      ) md_group
      GROUP BY DATE_FORMAT(writedate,"${dateFormat}"), photovoltaic_seq
    `;

    let betweenDatePointObj = BU.getBetweenDatePoint(strEndDate, strStartDate, searchType);
    // BU.CLI(betweenDatePointObj)

    // return this.db.single(sql, '', true)
      return this.db.single(sql)
      .then(result => {
        let groupByResult = _.groupBy(result, 'photovoltaic_seq')

        return {
          betweenDatePointObj,
          gridPowerInfo: groupByResult
        }
      });
  }

  /**
   * 접속반, Relation, trend를 융합하여 chart data 를 뽑아냄
   * @param {Object} connectorInfo 
   * @param {Array} upsasProfile 
   * @param {Array} moduleReportList 
   */
  processTrendByConnector(upsasProfile, moduleReportList, searchRange) {
    // BU.CLI('processTrendByConnector', searchRange)
    // 트렌드를 구할 모듈 정보 초기화
    let trendReportList = [];

    // 모듈 기본정보 입력
    _.each(moduleReportList.gridPowerInfo, (moduleDataList, moduleSeq) => {
      // BU.CLI(moduleSeq)
      let findProfile = _.findWhere(upsasProfile, {
        photovoltaic_seq: Number(moduleSeq)
      });
      // BU.CLI(findProfile)
      let trendReportObj = {};
      trendReportObj.id = `id_${moduleSeq}`;
      trendReportObj.name = `CH_${findProfile.connector_ch} ${findProfile.pv_target_name}`;
      trendReportObj.group_date = moduleReportList.betweenDatePointObj.fullTxtPoint;
      trendReportObj.data = []

      moduleReportList.betweenDatePointObj.fullTxtPoint.forEach((strDateFormat, ftpIndex) => {
        // BU.CLIS(strDateFormat, moduleDataList)
        let findGridObj = _.findWhere(moduleDataList, {
          group_date: strDateFormat
        });

        // BU.CLI(findGridObj)
        let data = _.isEmpty(findGridObj) ? '' : this.convertValueBySearchType(searchRange.searchType, findGridObj.total_wh);
        trendReportObj.data.push(data);
      });
      trendReportList.push(trendReportObj);
    })

    // BU.CLI(trendReportList);

    let chartOptionInfo = this.makeChartOption(searchRange);
    // BU.CLI('moudlePowerReport', moudlePowerReport);
    return {
      hasData: _.isEmpty(moduleReportList.gridPowerInfo) ? false : true,
      columnList: moduleReportList.betweenDatePointObj.shortTxtPoint,
      chartOptionInfo,
      series: trendReportList
    };
  }


  /**
   * 
   * @param {String} searchType 
   * @param {Number} number 
   */
  convertValueBySearchType(searchType, number) {
    // BU.CLI('convertValueBySearchType', searchType, number)
    let returnValue = 0;
    switch (searchType) {
      case 'year':
        returnValue = (number / 1000 / 1000).toFixed(4);
        break;
      case 'month':
        returnValue = (number / 1000).toFixed(3);
        break;
      case 'day':
        returnValue = (number / 1000).toFixed(3);
        break;
      case 'hour':
      default:
        returnValue = number;
        break;
    }
    return Number(returnValue)
  }

  makeChartOption(searchRange) {
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
    return {
      mainTitle,
      xAxisTitle,
      yAxisTitle
    }
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

    return this.db.single(sql)
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
    if (inverterSeqList) {
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

    return this.db.single(sql)
      // return this.db.single(sql)
      .then(result => {
        return {
          betweenDatePointObj,
          gridPowerInfo: result
        }
      });
  }

  /**
   * 검색 종류와 검색 기간에 따라 검색 시작 값과 종료 값 반환
   * @param {String} searchType day, month, year, range
   * @param {String} start_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @param {String} end_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @return {Object} {startDate, endDate}
   */
  getSearchRange(searchType, start_date, end_date) {
    // BU.CLIS(searchType, start_date, end_date)
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
      DATE_FORMAT(writedate,'%H') AS hour_time,
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