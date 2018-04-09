const _ = require('underscore');
const bmjh = require('base-model-jh');
const BU = require('base-util-jh').baseUtil;


class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  /**
   * 기상 관측 장비의 최신 데이터 1row를 가져옴.
   */
  getWeather() {
    let sql = 'SELECT * FROM weather_device_data ORDER BY writedate DESC LIMIT 1';
    return this.db.single(sql, '', false);
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
      curr_data.*	 		  
        FROM
        photovoltaic pv
        JOIN relation_upms ru
          ON ru.photovoltaic_seq = pv.photovoltaic_seq
        LEFT JOIN saltern_block sb
          ON sb.saltern_block_seq = ru.saltern_block_seq
        LEFT OUTER JOIN 
        (
        SELECT 
            md.photovoltaic_seq,
          ROUND(md.amp / 10, 1) AS amp,
          ROUND(md.vol / 10, 1) AS vol,
          md.writedate
      FROM module_data md
      INNER JOIN
        (
          SELECT MAX(module_data_seq) AS module_data_seq
          FROM module_data
          GROUP BY photovoltaic_seq
        ) b
      ON md.module_data_seq = b.module_data_seq
        ) curr_data
          ON curr_data.photovoltaic_seq = pv.photovoltaic_seq
    `;
    if (Number.isInteger(photovoltatic_seq)) {
      sql += `WHERE pv.photovoltaic_seq = (${photovoltatic_seq})`;
    } else if (Array.isArray(photovoltatic_seq)) {
      sql += `WHERE pv.photovoltaic_seq IN (${photovoltatic_seq})`;
    }
    sql += 'ORDER BY pv.target_id';

    return this.db.single(sql, '', false);
  }


  /**
   * 접속반 메뉴 에서 쓸 데이터 
   * @param {searchRange} searchRange  검색 옵션
   * @param {number[]=} module_seq_list null, String, Array
   * @return {Promise} SQL 실행 결과
   */
  getConnectorPower(searchRange, module_seq_list) {
    searchRange = searchRange ? searchRange : this.getSearchRange();
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');

    let sql = `
      SELECT
        md.photovoltaic_seq,
        ROUND(AVG(amp / 10), 1) AS amp,
        ROUND(AVG(vol / 10), 1) AS vol,
        ROUND(AVG(amp) * AVG(vol) / 100, 1) AS wh,
        DATE_FORMAT(writedate,'%H') AS hour_time,
        ${dateFormat.selectViewDate},
        pv.chart_color,
        pv.chart_sort_rank
        FROM module_data md
        LEFT OUTER JOIN photovoltaic pv
        ON pv.photovoltaic_seq = md.photovoltaic_seq        
        WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
    `;
    if (module_seq_list) {
      sql += `AND md.photovoltaic_seq IN (${module_seq_list})`;
    }
    sql += `
          GROUP BY ${dateFormat.firstGroupByFormat}, md.photovoltaic_seq
          ORDER BY md.photovoltaic_seq, writedate
    `;
    return this.db.single(sql, '', false);
  }


  /** 
   * 기상청 날씨를 가져옴
   * @return {Array.<{temp: number, pty: number, wf_kor: string, wf_en: string, pop: number, r12: number, ws:number, wd: number, reh: number, applydate: Date}>} 날씨 정보
   */
  getCurrWeatherCast() {
    let sql = `
      SELECT *, 
              ABS(CURRENT_TIMESTAMP() - applydate) AS cur_interval 
       FROM kma_data
      ORDER BY cur_interval 
      LIMIT 1
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
    let startDate = start_date ? BU.convertTextToDate(start_date) : new Date();
    let endDate = searchType === 'range' && end_date !== '' ? BU.convertTextToDate(end_date) : new Date(startDate);
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
   * 장치 타입 종류 가져옴
   * @param {string} deviceType 장치 타입
   */
  async getDeviceList(deviceType) {
    let returnValue = [];
    deviceType = deviceType ? deviceType : 'all';
    if (deviceType === 'all' || deviceType === 'inverter') {
      let inverterList = await this.getTable('inverter');
      inverterList = _.sortBy(inverterList, 'chart_sort_rank');
      _.each(inverterList, info => {
        returnValue.push({type: 'inverter', seq: info.inverter_seq, target_name: info.target_name});
      });
    }
    // 인버터 이름순으로 정렬
    // returnValue = _.sortBy(returnValue, 'target_name');
    
    if (deviceType === 'all' || deviceType === 'connector') {
      let connectorList = await this.getTable('connector');
      connectorList = _.sortBy(connectorList, 'chart_sort_rank');
      _.each(connectorList, info => {
        returnValue.push({type: 'connector', seq: info.connector_seq, target_name: info.target_name});
      });
    }
    // 모든 셀렉트 박스 정리 끝낸 후 최상단에 보일 셀렉트 박스 정의
    returnValue.unshift({
      type: 'all',
      seq: 'all',
      target_name: '전체'
    });
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
   * @param {number[]=} inverter_seq_list 
   * @return {{inverter_seq: number, group_date: string, }}
   */
  getInverterPower(searchRange, inverter_seq_list) {
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
        ROUND(AVG(out_w) / 10, 1) AS out_w,
        ROUND(MAX(c_wh) / 10, 1) AS max_c_wh,
        ROUND((MAX(c_wh) - MIN(c_wh)) / 10, 1) AS interval_wh
        FROM inverter_data
        WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
        `;
    if (Array.isArray(inverter_seq_list)) {
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
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
   * 기상 관측 데이터 구해옴
   * @param {searchRange} searchRange  검색 옵션
   */
  getWeatherTrend(searchRange) {
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');
    let sql = `
      SELECT
      ${dateFormat.selectViewDate},
      ${dateFormat.selectGroupDate},
        ROUND(AVG(sm_infrared), 1) AS avg_sm_infrared,
        ROUND(AVG(temp), 1) AS avg_temp,
        ROUND(AVG(reh), 1) AS avg_reh,
        ROUND(AVG(solar), 0) AS avg_solar,
        ROUND(AVG(wd), 0) AS avg_wd,	
        ROUND(AVG(ws), 1) AS avg_ws,	
        ROUND(AVG(uv), 0) AS avg_uv
       FROM weather_device_data
       WHERE writedate>= "${searchRange.strStartDate}" and writedate<"${searchRange.strEndDate}"
       GROUP BY ${dateFormat.groupByFormat}
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
    searchRange = searchRange ? searchRange : this.getSearchRange();
    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');
    // BU.CLI(searchRange);
    // BU.CLI(dateFormat);
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
          ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_wh,
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
   * 모듈 Seq List와 SearchRange 객체를 받아 Report 생성 및 반환
   * @param {Array} moduleSeqList [photovoltaic_seq]
   * @param {searchRange} searchRange getSearchRange() Return 객체
   * @return {Object[]} {betweenDatePointObj, gridPowerInfo}
   */
  getConnectorTrend(moduleSeqList, searchRange) {
    // TEST
    // endtDate = new Date('2017-11-16');
    // strEndDate = BU.convertDateToText(endtDate)
    // TEST

    // 기간 검색일 경우 시작일과 종료일의 날짜 차 계산하여 searchType 정의
    if (searchRange.searchType === 'range') {
      searchRange.searchType = this.convertSearchTypeWithCompareDate(searchRange.strEndDate, searchRange.strStartDate);
    }

    let dateFormat = this.makeDateFormatForReport(searchRange, 'writedate');

    let sql = `
      SELECT
        md_group.photovoltaic_seq,
        ${dateFormat.selectViewDate},
        ${dateFormat.selectGroupDate},
        ROUND(SUM(avg_amp), 1) AS total_amp,
        ROUND(AVG(avg_vol), 1) AS avg_vol,
        ROUND(SUM(avg_amp) * AVG(avg_vol), 1) AS total_wh,
        pv.chart_color, pv.chart_sort_rank
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
        GROUP BY ${dateFormat.firstGroupByFormat}, photovoltaic_seq
        ORDER BY photovoltaic_seq, writedate
      ) md_group
      LEFT OUTER JOIN photovoltaic pv
        ON pv.photovoltaic_seq = md_group.photovoltaic_seq	
      GROUP BY ${dateFormat.groupByFormat}, md_group.photovoltaic_seq
    `;
    return this.db.single(sql, '', false);
  }

  /**
   * 레포트 Date Format 자동 작성
   * @param {searchRange} searchRange 
   * @param {string} dateName 
   * @return {{groupByFormat: string, firstGroupByFormat: string, selectGroupDate: string, selectViewDate: string}} 
   */
  makeDateFormatForReport(searchRange, dateName) {
    const returnValue = {
      groupByFormat: '',
      firstGroupByFormat: '',
      selectGroupDate: '',
      selectViewDate: ''
    };
    // BU.CLI(returnValue.selectViewDate);

    dateName = dateName == null ? 'writedate' : dateName;
    // BU.CLI(searchRange);
    let dateFormat = this.convertSearchType2DateFormat(searchRange.searchInterval);
    // BU.CLI(dateFormat);
    if(searchRange.searchInterval === 'min10'){
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
   * @param {number=|Array=} inverter_seq [inverter_seq]
   * @param {searchRange} searchRange getSearchRange() Return 객체
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getInverterReport(inverter_seq, searchRange) {
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
        ROUND(SUM(interval_wh) / 1000, 2) AS total_s_kwh,
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
            ROUND((MAX(max_c_wh) - MIN(min_c_wh)) / 10, 1) AS interval_wh
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
   * 경보 페이지. 인버터 접속반 둘다 가져옴.
   * @param {string} errorStatus 오류 상태 (all, deviceError, systemError)
   * @param {searchRange} searchRange 
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getAlarmReport(errorStatus, searchRange) {
    let sql = `
      SELECT trouble_list.* 
        FROM
        ( 
          SELECT itd_list.*
          FROM
            (SELECT 
                itd.inverter_seq AS device_seq,
                itd.is_error AS is_error,
                itd.code AS code,
                itd.msg AS msg,
                itd.occur_date AS occur_date,
                itd.fix_date AS fix_date,
                ivt.target_name AS target_name,
                'inverter' AS device_e_name,
                '인버터' AS device_k_name
            FROM
              (SELECT * FROM inverter_trouble_data
                WHERE occur_date>= "${searchRange.strStartDate}" and occur_date<"${searchRange.strEndDate}"
                `;
    if(errorStatus === 'deviceError'){
      sql += 'AND is_error = "0"';
    } else if(errorStatus === 'systemError'){
      sql += 'AND is_error = "1"';
    }
    sql += `
              ) AS itd
            JOIN inverter ivt
              ON ivt.inverter_seq = itd.inverter_seq ) AS itd_list
          UNION
          SELECT ctd_list.*
          FROM
            (SELECT 
                ctd.connector_seq AS device_seq,
                ctd.is_error AS is_error,
                ctd.code AS code,
                ctd.msg AS msg,
                ctd.occur_date AS occur_date,
                ctd.fix_date AS fix_date,
                cnt.target_name AS target_name,
                'connector' AS device_e_name,
                '접속반' AS device_k_name
            FROM
              (SELECT * FROM connector_trouble_data
                WHERE occur_date>= "${searchRange.strStartDate}" and occur_date<"${searchRange.strEndDate}"
                `;
    if(errorStatus === 'deviceError'){
      sql += 'AND is_error = "0"';
    } else if(errorStatus === 'systemError'){
      sql += 'AND is_error = "1"';
    }
    sql += `
              ) AS ctd
            JOIN connector cnt
              ON cnt.connector_seq = ctd.connector_seq 
            ) AS ctd_list
        ) AS trouble_list
        ORDER BY trouble_list.occur_date DESC
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
   * 인버터 에러만 가져옴
   * @param {string} errorStatus 오류 상태 (all, deviceError, systemError)
   * @param {searchRange} searchRange 
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getAlarmReportForInverter(errorStatus, searchRange) {
    let sql = `
        SELECT 
            itd.inverter_seq AS device_seq,
            itd.is_error AS is_error,
            itd.code AS code,
            itd.msg AS msg,
            itd.occur_date AS occur_date,
            itd.fix_date AS fix_date,
            ivt.target_name AS target_name,
            'inverter' AS device_e_name,
            '인버터' AS device_k_name
        FROM
          (SELECT * FROM inverter_trouble_data
            WHERE occur_date>= "${searchRange.strStartDate}" and occur_date<"${searchRange.strEndDate}"
            `;
    if(errorStatus === 'deviceError'){
      sql += 'AND is_error = "0"';
    } else if(errorStatus === 'systemError'){
      sql += 'AND is_error = "1"';
    }
    sql += `
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
   * 인버터 에러만 가져옴
   * @param {string} errorStatus 오류 상태 (all, deviceError, systemError)
   * @param {searchRange} searchRange 
   * @return {{totalCount: number, report: []}} 총 갯수, 검색 결과 목록
   */
  async getAlarmReportForConnector(errorStatus, searchRange) {
    let sql = `
        SELECT 
            ctd.connector_seq AS device_seq,
            ctd.is_error AS is_error,
            ctd.code AS code,
            ctd.msg AS msg,
            ctd.occur_date AS occur_date,
            ctd.fix_date AS fix_date,
            cnt.target_name AS target_name,
            'connector' AS device_e_name,
            '접속반' AS device_k_name
        FROM
            (SELECT * FROM connector_trouble_data
              WHERE occur_date>= "${searchRange.strStartDate}" and occur_date<"${searchRange.strEndDate}"
              `;
    if(errorStatus === 'deviceError'){
      sql += 'AND is_error = "0"';
    } else if(errorStatus === 'systemError'){
      sql += 'AND is_error = "1"';
    }
    sql += `
            ) AS ctd
        JOIN connector cnt
          ON cnt.connector_seq = ctd.connector_seq 
        ORDER BY ctd.occur_date DESC	
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

    let chartDecorationInfo = this.makeChartDecorator(searchRange);
    // BU.CLI('moudlePowerReport', moudlePowerReport);
    return {
      hasData: _.isEmpty(moduleReportList.gridPowerInfo) ? false : true,
      columnList: moduleReportList.betweenDatePointObj.shortTxtPoint,
      chartDecorationInfo,
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