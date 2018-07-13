const _ = require('underscore');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object[]} weatherRowDataPacketList
 * @property {string} view_date 차트에 표현할 Date Format
 * @property {string} group_date 그룹 처리한 Date Format
 * @property {number} avg_sky 평균 운량
 */

/**
 * @typedef {Object[]} weatherDeviceRowDataPacketList
 * @property {string} view_date 차트에 표현할 Date Format
 * @property {string} group_date 그룹 처리한 Date Format
 * @property {number} avg_sky 평균 운량
 */ 


class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }


  /**
   * 장치 데이터 가져옴
   * @param {searchRange} searchRange
   * @param {number[]=} inverter_seq 
   * @return {Object[]} chartData
   */
  async getAllOriginalData(searchRange, inverter_seq) {
    // searchRange = searchRange ? searchRange : this.getSearchRange();
    let sql = `
    SELECT 
          DATE_FORMAT(writedate,"%Y-%m-%d %H:%i") AS 측정날짜,
          main.target_name AS PCS_Name,
          main.in_a AS PV_A,
          main.in_v AS PV_V,
          main.in_kw AS 'PV_P(kW)',
          main.out_a AS Grid_A,
          main.out_v AS Grid_V,
          main.out_kw AS 'Grid_P(kW)',
          main.out_total_kwh AS 'Grid_Total_Power(kWh)',
          main.operation_has_v AS Mode_PowerLoss,
          main.operation_mode AS Mode_State,
          main.operation_status AS Mode_Fault,
          main.battery_v AS Battery_V,
          main.battery_a AS Battery_A,
          main.battery_charging_kw AS 'Battery_Charging_Power(kW)',
          main.battery_discharging_kw AS 'Battery_Discharging_Power(kW)',
          main.battery_total_charging_kwh AS 'Battery_Total_Charging_Power(kWh)',
          main.total_pv_generating_kwh AS 'Total_PV_Generating_Power(kWh)',
          main.battery_total_discharging_kwh 'AS Battery_Total_Discharging_Power(kWh)',
          main.led_dc_v AS LED_DC_V,
          main.led_dc_a AS LED_DC_A,
          main.led_using_kw AS 'LED_Using_P(kW)',
          main.led_total_using_kwh AS 'LED_Total_Using_P(kWh)',
          main.input_line_kw AS 'Input_Power_From_Linepower(kW)',
          main.input_total_line_kwh AS 'Total_Input_From_Line(kWh)'
    FROM
    (
    SELECT 
          inverter.target_name,
          inverter_data.*
     FROM 
    inverter_data
    LEFT OUTER JOIN inverter
      ON inverter.inverter_seq = inverter_data.inverter_seq
      WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
      `;
    if (inverter_seq !== '' && inverter_seq && inverter_seq !== 'all') {
      sql += `AND inverter_data.inverter_seq = ${inverter_seq}`;
    }
    sql +=  `
      ORDER BY writedate, inverter_seq
    ) main
    `;
    return this.db.single(sql, '', false);
  }


  /**
   * 검색 종류와 검색 기간에 따라 계산 후 검색 조건 객체 반환
   * @param {string} searchType min10, hour, day, month, year, range
   * @param {string} start_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @param {string} end_date '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @return {searchRange} 검색 범위
   */
  getSearchRange(searchType, start_date, end_date) {
    // BU.CLIS(searchType, start_date, end_date);
    searchType = searchType ? searchType : 'min';
    let startDate = start_date instanceof Date ? start_date : _.isString(start_date) && start_date !== '' ? BU.convertTextToDate(start_date) : new Date();
    let endDate = end_date instanceof Date ? end_date : searchType === 'range' && end_date !== '' ? BU.convertTextToDate(end_date) : startDate;
    // let endDate = searchType === 'range' && end_date !== '' ? BU.convertTextToDate(end_date) : new Date(startDate);
    let convertEndDate = null;
    // BU.CLI(BU.convertDateToText(startDate), endDate);
    let returnValue = {
      searchType,
      searchInterval: searchType,
      strStartDate: null, // sql writedate range 사용
      strEndDate: null, // sql writedate range 사용
      rangeStart: '', // Chart 위에 표시될 시작 날짜
      rangeEnd: '', // Chart 위에 표시될 종료 날짜
      strStartDateInputValue: '', // input에 표시될 시작 날짜
      strEndDateInputValue: '', // input에 표시될 종료 날짜
      strBetweenStart: '',
      strBetweenEnd: '',
    };

    let spliceIndex = 0;

    // 검색 시작 시분초 초기화
    startDate.setHours(0, 0, 0, 0);
    if (searchType === 'hour' || searchType === '') {
      spliceIndex = 2;
      convertEndDate = endDate = (new Date(startDate)).addDays(1);
      // 검색 종료날짜가 현재 날짜라면 시간단위로 지정
      let currDate = new Date().setHours(0, 0, 0, 0);
      currDate = new Date(currDate).addDays(1);
      if(BU.convertDateToText(currDate) === BU.convertDateToText(endDate)){
        convertEndDate = new Date(new Date().setMinutes(0, 0, 0));
      }
    } else if (searchType === 'min' || searchType === 'min10'){
      spliceIndex = 2;
      convertEndDate = endDate = (new Date(startDate)).addDays(1);
      // 검색 종료날짜가 현재 날짜라면 시간단위로 지정
      let currDate = new Date().setHours(0, 0, 0, 0);
      currDate = new Date(currDate).addDays(1);
      if(BU.convertDateToText(currDate) === BU.convertDateToText(endDate)){
        let fixedMinutes = Math.floor(new Date().getMinutes() * 0.1) * 10; 
        convertEndDate = new Date(new Date().setMinutes(fixedMinutes, 0, 0));
      }
    } else if (searchType === 'day') {
      spliceIndex = 1;
      startDate.setDate(1);
      convertEndDate = endDate = (new Date(startDate)).addMonths(1);
    } else if (searchType === 'month') {
      spliceIndex = 0;
      startDate.setMonth(0, 1);
      convertEndDate = endDate = (new Date(startDate)).addYear(1);
    } else if (searchType === 'range') {
      spliceIndex = 2;
      // chart title에 사용될 기간을 설정
      returnValue.rangeEnd = BU.convertDateToText(endDate, 'kor', spliceIndex, 0);
      // 검색 조건 input value txt 설정
      returnValue.strEndDateInputValue = BU.convertDateToText(endDate, '', spliceIndex, 0);
      // SQL 날짜 검색에 사용할 범위를 위하여 하루 증가
      convertEndDate = endDate = (new Date(endDate)).addDays(1);
    } 

    
    returnValue.rangeStart = BU.convertDateToText(startDate, 'kor', spliceIndex, 0);
    returnValue.strStartDateInputValue = BU.convertDateToText(startDate, '', spliceIndex, 0);
    returnValue.strStartDate = BU.convertDateToText(startDate);
    returnValue.strEndDate = BU.convertDateToText(convertEndDate);

    returnValue.strBetweenStart = returnValue.strStartDate;
    returnValue.strBetweenEnd = BU.convertDateToText(endDate);
    // BU.CLI(returnValue)
    return returnValue;
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
    case 'min10':
      dateFormat = '%Y-%m-%d %H:%i';
      break;
    case 'min':
      dateFormat = '%Y-%m-%d %H:%i';
      break;
    default:
      dateFormat = '%Y-%m-%d %H:';
      break;
    }
    return dateFormat;
  }

  /**
   * 장치 타입 종류 가져옴
   */
  async getDeviceList() {
    let returnValue = [];
    let inverterList = await this.getTable('inverter');
    inverterList = _.sortBy(inverterList, 'chart_sort_rank');
    _.each(inverterList, info => {
      returnValue.push({type: 'inverter', seq: info.inverter_seq, target_name: info.target_name});
    });

    // 모든 셀렉트 박스 정리 끝낸 후 최상단에 보일 셀렉트 박스 정의
    returnValue.unshift({
      type: 'all',
      seq: 'all',
      target_name: '전체'
    });
    return returnValue;
  }
  

  /**
   * searchRange Type
   * @typedef {Object} searchRange
   * @property {string} searchType day, month, year, range
   * @property {string} searchInterval min, min10, hour, day, month, year, range
   * @property {string} strStartDate sql writedate range 사용
   * @property {string} strEndDate sql writedate range 사용
   * @property {string} rangeStart Chart 위에 표시될 시작 날짜
   * @property {string} rangeEnd Chart 위에 표시될 종료 날짜
   * @property {string} strStartDateInputValue input[type=text] 에 표시될 시작 날짜
   * @property {string} strEndDateInputValue input[type=text] 에 표시될 종료 날짜
   * @property {string} strBetweenStart static chart 범위를 표현하기 위한 시작 날짜
   * @property {string} strBetweenEnd static chart 범위를 표현하기 위한 종료 날짜
   */

  /**
   * 인버터 총 누적 발전량을 구함
   * @param {number[]=} inverter_seq_list 
   */
  getInverterCumulativePower(inverter_seq_list){
    let sql = `
      SELECT
        inverter_seq,
        ROUND(MAX(c_wh) / 10, 1) AS max_c_wh
      FROM inverter_data
      `;
    if (typeof(inverter_seq_list) === 'number' ||  Array.isArray(inverter_seq_list)) {
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
    }
    sql += `        
    GROUP BY inverter_seq
    `;
    return this.db.single(sql, '', false);
  }

  /**
   * 인버터 발전량 구해옴
   * @param {searchRange} searchRange  검색 옵션
   * @param {number} inverter_seq 
   * @return {{inverter_seq: number, group_date: string, }}
   */
  getInverterPower(searchRange, inverter_seq) {
    searchRange = searchRange ? searchRange : this.getSearchRange();
    // let dateFormat = this.convertSearchType2DateFormat(searchRange.searchType);
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');
    // BU.CLI(dateFormat);
    let sql = `
    SELECT
			main.*,
			 (SELECT iv.target_id FROM inverter iv WHERE iv.inverter_seq = main.inverter_seq LIMIT 1) AS ivt_target_id,
       ivt.chart_color, ivt.chart_sort_rank
    FROM
      (
      SELECT
        inverter_seq,
        writedate, 
        ${dateFormat.selectViewDate},
        ROUND(AVG(in_kw), 3) AS in_kw,
        ROUND(AVG(out_kw), 3) AS out_kw
        FROM inverter_data
        WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
        `;
    if (inverter_seq !== '' && inverter_seq && inverter_seq !== 'all') {
      sql += ` AND inverter_seq IN (${inverter_seq})`;
    }
    sql += `        
    GROUP BY ${dateFormat.firstGroupByFormat}, inverter_seq
    ) AS main
    LEFT OUTER JOIN inverter ivt
    ON ivt.inverter_seq = main.inverter_seq
    `;
    return this.db.single(sql, '', false);
  }

  /**
   * 인버터 발전량 구해옴
   * @param {searchRange} searchRange  검색 옵션
   * @param {number[]=} inverter_seq 
   * @return {{inverter_seq: number, group_date: string, }}
   */
  getInverterTrend(searchRange, inverter_seq) {
    // BU.CLI(searchRange);
    searchRange = searchRange ? searchRange : this.getSearchRange();
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');
    // BU.CLI(searchRange);
    let sql = `
    SELECT 
          id_group.inverter_seq,
          ${dateFormat.selectViewDate},
          ${dateFormat.selectGroupDate},
          ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a,
          ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v,
          ROUND(AVG(avg_in_w) / 10, 1) AS avg_in_w,
          ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a,
          ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v,
          ROUND(AVG(avg_out_w) / 10, 1) AS avg_out_w,
          ROUND(AVG(avg_p_f) / 10, 1) AS avg_p_f,
          ROUND(MAX(max_c_wh) / 10, 1) AS max_c_wh,
          ROUND(MIN(min_c_wh) / 10, 1) AS min_c_wh,
          ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_power,
          ivt.chart_color, ivt.chart_sort_rank,
          SUM(first_count) as total_count
    FROM
      (SELECT 
              id.inverter_seq,
              writedate,
              DATE_FORMAT(writedate,"%H") AS hour_time,
              AVG(in_a) AS avg_in_a,
              AVG(in_v) AS avg_in_v,
              AVG(in_w) AS avg_in_w,
              AVG(out_a) AS avg_out_a,
              AVG(out_v) AS avg_out_v,
              AVG(out_w) AS avg_out_w,
              AVG(CASE WHEN p_f > 0 THEN p_f END) AS avg_p_f,
              MAX(c_wh) AS max_c_wh,
              MIN(c_wh) AS min_c_wh,
              COUNT(*) AS first_count
      FROM inverter_data id
            WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
    `;
    if (inverter_seq !== '' && inverter_seq && inverter_seq !== 'all') {
      sql += `AND id.inverter_seq = ${inverter_seq}`;
    }
    sql += `            
      GROUP BY ${dateFormat.firstGroupByFormat}, id.inverter_seq
      ORDER BY id.inverter_seq, writedate) AS id_group
      LEFT OUTER JOIN inverter ivt
      ON ivt.inverter_seq = id_group.inverter_seq
    GROUP BY id_group.inverter_seq, ${dateFormat.groupByFormat}
    `;

    return this.db.single(sql, '', false);
  }

  /**
   * 레포트 Date Format 자동 작성
   * @param {searchRange} searchRange 
   * @param {string} dateName 
   * @return {{groupByFormat: string, firstGroupByFormat: string, selectGroupDate: string, selectViewDate: string, devideTimeNumber: number}} 
   */
  makeDateFormatForReport(searchRange, dateName) {
    const returnValue = {
      groupByFormat: '',
      firstGroupByFormat: '',
      selectGroupDate: '',
      selectViewDate: '',
      devideTimeNumber: 1
    };
    // BU.CLI(returnValue.selectViewDate);

    dateName = dateName == null ? 'writedate' : dateName;
    // BU.CLI(searchRange);
    let dateFormat = this.convertSearchType2DateFormat(searchRange.searchInterval);
    // BU.CLI(dateFormat);
    if(searchRange.searchInterval === 'min10'){
      returnValue.devideTimeNumber = 6;
      returnValue.selectGroupDate = `CONCAT(LEFT(DATE_FORMAT(${dateName},"%Y-%m-%d %H:%i"), 15), "0")  AS group_date`;
      returnValue.selectViewDate = `CONCAT(LEFT(DATE_FORMAT(${dateName},"%H:%i"), 4), "0")  AS view_date`;
      // returnValue.firstGroupByFormat = dateFormat;
      returnValue.firstGroupByFormat = `LEFT(DATE_FORMAT(${dateName},"%Y-%m-%d %H:%i"), 15)`;
      returnValue.groupByFormat = `LEFT(DATE_FORMAT(${dateName},"%Y-%m-%d %H:%i"), 15)`;
    } else {
      returnValue.selectGroupDate = `DATE_FORMAT(${dateName},"${dateFormat}") AS group_date`;
      

      let viewFormat = dateFormat;
      let firstGroupFormat = '%Y-%m-%d %H';
      switch (searchRange.searchType) {
      case 'min':
        viewFormat = viewFormat.slice(9, 14);
        firstGroupFormat = '%Y-%m-%d %H:%i';
        returnValue.devideTimeNumber = 60;
        break;
      case 'hour':
        viewFormat = viewFormat.slice(9, 11);
        break;
      case 'day':
        viewFormat = viewFormat.slice(6, 8);
        break;
      case 'month':
        viewFormat = viewFormat.slice(3, 5);
        break;
      default:
        break;
      }
      returnValue.selectViewDate = `DATE_FORMAT(${dateName},"${viewFormat}") AS view_date`;
      returnValue.firstGroupByFormat = `DATE_FORMAT(${dateName},"${firstGroupFormat}")`;
      returnValue.groupByFormat = `DATE_FORMAT(${dateName},"${dateFormat}")`;
    }
    return returnValue;
  }

  /**
   * 인버터 Report
   * @param {searchRange} searchRange getSearchRange() Return 객체
   * @param {number=|Array=} inverter_seq [inverter_seq]
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getInverterReport(searchRange, inverter_seq) {
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');
    
    let sql = `
    SELECT
        group_date,
        ROUND(AVG(avg_in_a) / 10, 1) AS avg_in_a,
        ROUND(AVG(avg_in_v) / 10, 1) AS avg_in_v,
        ROUND(AVG(avg_in_w) / 10, 1) AS avg_in_w,
        ROUND(AVG(avg_out_a) / 10, 1) AS avg_out_a,
        ROUND(AVG(avg_out_v) / 10, 1) AS avg_out_v,
        ROUND(AVG(avg_out_w) / 10, 1) AS avg_out_w,
        ROUND(AVG(CASE WHEN avg_p_f > 0 THEN avg_p_f END) / 10, 1) AS avg_p_f,
        ROUND(SUM(interval_power) / 1000, 2) AS total_s_kwh,
        ROUND(SUM(max_c_wh) / 1000000, 3) AS total_c_mwh
    FROM
      (SELECT
            inverter_seq,
            ${dateFormat.selectViewDate},
            ${dateFormat.selectGroupDate},
            AVG(avg_in_a) AS avg_in_a,
            AVG(avg_in_v) AS avg_in_v,
            AVG(avg_in_w) AS avg_in_w,
            AVG(avg_out_a) AS avg_out_a,
            AVG(avg_out_v) AS avg_out_v,
            AVG(avg_out_w) AS avg_out_w,
            AVG(CASE WHEN avg_p_f > 0 THEN avg_p_f END) AS avg_p_f,
            ROUND(MAX(max_c_wh) / 10, 1) AS max_c_wh,
            ROUND(MIN(min_c_wh) / 10, 1) AS min_c_wh,
            ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_power
      FROM
        (SELECT
              id.inverter_seq,
              writedate,
              DATE_FORMAT(writedate,"%H") AS hour_time,
              AVG(in_a) AS avg_in_a,
              AVG(in_v) AS avg_in_v,
              AVG(in_w) AS avg_in_w,
              AVG(out_a) AS avg_out_a,
              AVG(out_v) AS avg_out_v,
              AVG(out_w) AS avg_out_w,
              AVG(CASE WHEN p_f > 0 THEN p_f END) AS avg_p_f,
              MAX(c_wh) AS max_c_wh,
              MIN(c_wh) AS min_c_wh
        FROM inverter_data id
        WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
        `;
    if (inverter_seq !== 'all') {
      sql += `AND inverter_seq = ${inverter_seq}`;
    }
    sql += `  
        GROUP BY ${dateFormat.firstGroupByFormat}, inverter_seq
        ORDER BY inverter_seq, writedate) AS id_group
      GROUP BY inverter_seq, ${dateFormat.groupByFormat}) AS id_report
    GROUP BY group_date
    ORDER BY group_date ASC
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

  makeChartDecorator(searchRange) {
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
      yAxisTitle = '발전량(wh)';
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