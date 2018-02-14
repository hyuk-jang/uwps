const _ = require('underscore');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;


class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  /**
   * 접속반 기준 Module 최신 데이터 가져옴
   *  
   * @param {number|Array} photovoltatic_seq Format => Number or Array or undefinded
   * @return {Promise} 최신 데이터 리스트
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
      sql += `WHERE pv.photovoltaic_seq = (${photovoltatic_seq})`;
    } else if (Array.isArray(photovoltatic_seq)) {
      sql += `WHERE pv.photovoltaic_seq IN (${photovoltatic_seq})`;
    }
    sql += 'ORDER BY ru.connector_seq, ru.connector_ch';

    return this.db.single(sql);
  }


  /**
   * 접속반 메뉴 에서 쓸 데이터 
   * @param {number[]=} moduleSeq null, String, Array
   * @return {Promise} SQL 실행 결과
   */
  getTodayConnectorReport(moduleSeq) {
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
      sql += `AND photovoltaic_seq IN (${moduleSeq})`;
    }
    sql += `
          GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
          ORDER BY photovoltaic_seq, writedate
    `;
    return this.db.single(sql);
  }




  /**
   * 검색 종류와 검색 기간에 따라 계산 후 검색 조건 객체 반환
   * @param {string} searchType hour, day, month, year, range
   * @param {string} start_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @param {string} end_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @return {searchRange} 검색 범위
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
    };

    let spliceIndex = 0;

    // 검색 시작 시분초 초기화
    startDate.setHours(0, 0, 0);
    if (searchType === 'hour' || searchType === '') {
      spliceIndex = 2;
      endDate = (new Date(startDate)).addDays(1);
    } else if (searchType === 'day') {
      spliceIndex = 1;
      startDate.setDate(1);
      endDate = (new Date(startDate)).addMonths(1);
    } else if (searchType === 'month') {
      spliceIndex = 0;
      startDate.setMonth(0, 1);
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


  
  /**
   * 종료일과 시작일 사이의 간격을 기준으로 조회 Interval Text 구함
   * @param {String} strEndDate 
   * @param {String} strStartDate 
   * @return {String} searchType
   */
  convertSearchTypeWithCompareDate(strEndDate, strStartDate) {
    let searchType = '';
    let gapDate = BU.calcDateInterval(strEndDate, strStartDate);
    let sumValues = Object.values(gapDate).sum();
    if (gapDate.remainDay >= 365) {
      searchType = 'year';
    } else if (gapDate.remainDay > 29) {
      searchType = 'month';
    } else if (gapDate.remainDay > 0 && sumValues > 1) {
      searchType = 'day';
    } else {
      searchType = 'hour';
    }
    return searchType;
  }

  /**
   * searchRange Type
   * @typedef {Object} searchRange
   * @property {string} searchType day, month, year, range
   * @property {string} strStartDate sql writedate range 사용
   * @property {string} strEndDate sql writedate range 사용
   * @property {string} rangeStart Chart 위에 표시될 시작 날짜
   * @property {string} rangeEnd Chart 위에 표시될 종료 날짜
   * @property {string} strStartDateInputValue input[type=text] 에 표시될 시작 날짜
   * @property {string} strEndDateInputValue input[type=text] 에 표시될 종료 날짜
   */

   

  /**
   * 인버터 발전량 구해옴
   * @param {searchRange} searchRange  검색 옵션
   * @param {number[]=} inverter_seq_list 
   * @return {{inverter_seq: number, group_date: string, }}
   */
  getInverterPower(searchRange, inverter_seq_list) {
    searchRange = searchRange ? searchRange : this.getSearchRange();
    let dataFormat = this.convertSearchType2DateFormat(searchRange.searchType);

    let sql = `
      SELECT
      inverter_seq,
      writedate, 
      DATE_FORMAT(writedate,'%H') AS hour_time,
      DATE_FORMAT(writedate,'${dataFormat}') AS group_date,
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
      WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
        `;
    if (Array.isArray(inverter_seq_list)) {
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
    }
    sql += `        
      GROUP BY DATE_FORMAT(writedate,'${dataFormat}'), inverter_seq
      `;
    return this.db.single(sql, '', false);
  }

  /**
   * searchType을 받아 dateFormat String 변환하여 반환
   * @param {string} searchType 
   * @return {string} dateFormat
   */
  convertSearchType2DateFormat(searchType) {
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
    return dateFormat;
  }

  /**
   * 모듈 Seq List와 SearchRange 객체를 받아 Report 생성 및 반환
   * @param {Array} moduleSeqList [photovoltaic_seq]
   * @param {searchRange} searchRange getSearchRange() Return 객체
   * @return {Object[]} {betweenDatePointObj, gridPowerInfo}
   */
  getModuleHistory(moduleSeqList, searchRange) {
    // TEST
    // endtDate = new Date('2017-11-16');
    // strEndDate = BU.convertDateToText(endtDate)
    // TEST

    // BU.CLI(searchRange)


    // 기간 검색일 경우 시작일과 종료일의 날짜 차 계산하여 searchType 정의
    if (searchRange.searchType === 'range') {
      searchRange.searchType = this.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate);
    }

    let dateFormat = this.convertSearchType2DateFormat(searchRange.searchType);

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
        WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
    `;
    if (moduleSeqList.length) {
      sql += `AND photovoltaic_seq IN (${moduleSeqList})`;
    }
    sql += `
        GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), photovoltaic_seq
        ORDER BY photovoltaic_seq, writedate
      ) md_group
      GROUP BY DATE_FORMAT(writedate,"${dateFormat}"), photovoltaic_seq
    `;
    return this.db.single(sql);
  }

  /**
   * 인버터 Report
   * @param {Array} inverter_seq [inverter_seq]
   * @param {Object} searchRange getSearchRange() Return 객체
   * @return {Object} {betweenDatePointObj, gridPowerInfo}
   */
  async getInverterReport(inverter_seq, searchRange) {
    let dateFormat = this.convertSearchType2DateFormat(searchRange.searchInterval);
    
    let sql = `
      SELECT *
      ,ROUND(SUM(sum_wh) / 1000, 2) AS total_s_kwh	
			,ROUND(SUM(c_wh) / 1000000, 3) AS total_c_mwh
  FROM
    (SELECT inverter_seq
        ,DATE_FORMAT(writedate,"${dateFormat}") AS group_date
				,ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a
				,ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v
				,ROUND(AVG(in_wh) / 10, 1) AS avg_in_wh
				,ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a
				,ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v
				,ROUND(AVG(out_wh) / 10, 1) AS avg_out_wh
				,ROUND(AVG(avg_p_f) / 10, 1) AS avg_p_f
				,ROUND(SUM(wh) / 100, 1) AS sum_wh
				,ROUND(MAX(c_wh) / 10, 1) AS c_wh
    FROM
      (SELECT id.inverter_seq
          ,writedate
          ,AVG(in_a) AS avg_in_a
					,AVG(in_v) AS avg_in_v
					,AVG(in_w) AS in_wh
					,AVG(out_a) AS avg_out_a
					,AVG(out_v) AS avg_out_v
					,AVG(out_w) AS out_wh
          ,AVG(CASE WHEN p_f > 0 THEN p_f END) AS avg_p_f
					,AVG(out_a) * AVG(out_v) AS wh
					,MAX(c_wh) AS c_wh
          ,DATE_FORMAT(writedate,"%H") AS hour_time
      FROM inverter_data id
            WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"

    `;
    if (inverter_seq !== 'all') {
      sql += `AND inverter_seq = ${inverter_seq}`;
    }
    sql += `            
    GROUP BY DATE_FORMAT(writedate,"%Y-%m-%d %H"), inverter_seq
    ORDER BY inverter_seq, writedate) AS id_group
  GROUP BY inverter_seq, DATE_FORMAT(writedate,"${dateFormat}")
  ) AS id_report
      GROUP BY group_date
      ORDER BY group_date DESC
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


  /**
   * 경보 내역 리스트
   * @param {searchRange} searchRange 검색 조건 객체
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



  /**
   * 접속반, Relation, trend를 융합하여 chart data 를 뽑아냄
   * @param {Object} connectorInfo 
   * @param {Array} upsasProfile 
   * @param {Array} moduleReportList 
   */
  processModuleReport(upsasProfile, moduleReportList, searchRange) {
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
      trendReportObj.data = [];

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
    });

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
    return Number(returnValue);
  }

  makeChartOption(searchRange) {
    let mainTitle = '';
    let xAxisTitle = '';
    let yAxisTitle = '';
    switch (searchRange.searchType) {
    case 'year':
      xAxisTitle = '시간(년)';
      yAxisTitle = '발전량(MWh)';
      break;
    case 'month':
      xAxisTitle = '시간(월)';
      yAxisTitle = '발전량(kWh)';
      break;
    case 'day':
      xAxisTitle = '시간(일)';
      yAxisTitle = '발전량(kWh)';
      break;
    case 'hour':
      xAxisTitle = '시간(시)';
      yAxisTitle = '발전량(Wh)';
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
    };
  }




}
module.exports = BiModule;