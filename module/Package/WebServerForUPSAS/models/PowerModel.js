'use strict';
const _ = require('lodash');

const BU = require('base-util-jh').baseUtil;

const BiModule = require('../models/BiModule.js');
let webUtil = require('../models/web.util');
let excelUtil = require('../models/excel.util');
// TEST
const tempSacle = require('../temp/tempSacle');

const Promise = require('bluebird');


class PowerModel extends BiModule {
  constructor(dbInfo) {
    super(dbInfo);

  }


  /**
   * 테스트 수행 여부, 수위, 일사량, 온도, 운량 등을 달력을 생성하기 위한 데이터로 반환
   * @return {{title: string, color: string, start: string}[]} title: 내용, color: 배경 색상, start: 시작 날짜
   */
  async getCalendarEventList() {
    const moment = require('moment');
    let startDate = moment().subtract(1, 'years').format();
    let endDate = new Date(moment().format());
    let searchRange = this.getSearchRange('fixRange', startDate, endDate);
    searchRange.searchInterval = 'min10';
    searchRange.resultGroupType = 'day';

    const weatherTrendList = await this.getWeatherTrend(searchRange); 
    // BU.CLI(weatherTrendList);
    // 수위는 수중 일반(단) 기준으로 가져옴
    const waterLevelList = await this.getWaterLevel(searchRange, 4); 
    // BU.CLI(waterLevelList);

    const weatherCastList = await this.getWeatherCastAverage(searchRange); 
    // BU.CLI(weatherCastList);
    const calendarCommentList = await this.getCalendarComment(searchRange); 
    // BU.CLI(calendarCommentList);

    /** @type {{title: string, start: string, color: string=}[]} */
    let calendarEventList = [];

    calendarCommentList.forEach(currentItem => {
      let event = {
        title: '',
        start: currentItem.group_date
      };

      if(currentItem.is_error){
        event.title = '▶ 테스트 X';
        event.color = 'red';
        // let addEvent = {
        //   start: currentItem.group_date,
        //   rendering: 'background',
        //   color: 'red'
        // };
        // calendarEventList.push(addEvent);
        
      } else {
        event.title = '▶ 테스트 O';
        event.color = 'blue';
      }

      const comment = _.get(currentItem, 'comment');
      if(comment !== null && comment !== ''){
        event.title += `\n  ${comment}`;
      }
      
      calendarEventList.push(event);
    });

    waterLevelList.forEach(currentItem => {
      let event = {
        title: `수위: ${currentItem.water_level}`,
        start: currentItem.group_date,
      };
      calendarEventList.push(event);
    });

    weatherCastList.forEach(currentItem => {
      let event = {
        title: `운량: ${currentItem.avg_sky}`,
        start: currentItem.group_date,
      };
      calendarEventList.push(event);
    });
    
    weatherTrendList.forEach(currentItem => {
      let event = {
        title: `일사량: ${currentItem.total_interval_solar}`,
        start: currentItem.group_date
      };
      calendarEventList.push(event);
      
      event = {
        title: `온도: ${currentItem.avg_temp}`,
        start: currentItem.group_date
      };
      calendarEventList.push(event);
    });
    return calendarEventList;
  }

  /**
   * 인버터 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   * @return {{inverterPowerChartData: chartData, inverterTrend: Object[], viewInverterPacketList: Array.<viewInverterDataPacket>}} chartData
   */
  async getInverterChart(searchOption, searchRange, betweenDatePoint) {
    // BU.CLI(searchRange);
    let inverterPowerChartData = {
      range: [],
      series: []
    };
    let returnValue = {
      inverterPowerChartData,
      inverterTrend: []
    };
    // 장비 종류가 접속반, 장비 선택이 전체라면 즉시 종료
    if (searchOption.device_type === 'connector' && searchOption.device_list_type === 'all') {
      return returnValue;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if (searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'inverter') {
      return returnValue;
    }

    let device_seq = !isNaN(searchOption.device_seq) ? Number(searchOption.device_seq) : 'all';
    // TEST
    // searchRange = this.getSearchRange('day', '2018-02-17', '2018-02-18');
    // searchRange.searchType = 'hour';
    // TODO 인버터 모듈 이름을 가져오기 위한 테이블. 성능을 위해서라면 다른 쿼리문 작성 사용 필요
    let viewInverterPacketList = await this.getTable('v_inverter_status');
    // BU.CLI(viewInverterPacketList);
    // 인버터 차트 데이터 불러옴
    // BU.CLI(searchRange);
    let inverterTrend = await this.getInverterTrend(searchRange, device_seq);
    // BU.CLI(inverterTrend);



    // 하루 데이터(10분 구간)는 특별히 데이터를 정제함.
    if (searchRange.searchType === 'min' || searchRange.searchType === 'min10' || searchRange.searchType === 'hour') {
      let maxRequiredDateSecondValue = 0;
      switch (searchRange.searchType) {
      case 'min':
        maxRequiredDateSecondValue = 120;
        break;
      case 'min10':
        maxRequiredDateSecondValue = 1200;
        break;
      case 'hour':
        maxRequiredDateSecondValue = 7200;
        break;
      default:
        break;
      }
      let calcOption = {
        calcMaxKey: 'max_c_wh',
        calcMinKey: 'min_c_wh',
        resultKey: 'interval_power',
        groupKey: 'inverter_seq',
        rangeOption: {
          dateKey: 'group_date',
          maxRequiredDateSecondValue,
          minRequiredCountKey: 'total_count',
          minRequiredCountValue: 9
        }
      };
      webUtil.calcRangePower(inverterTrend, calcOption);
    }
    webUtil.addKeyToReport(inverterTrend, viewInverterPacketList, 'target_id', 'inverter_seq');
    webUtil.addKeyToReport(inverterTrend, viewInverterPacketList, 'target_name', 'inverter_seq');
    // 기간 발전량을 기준으로 실제 계통 출력량을 계산하여 추가함(grid_out_w)
    webUtil.calcRangeGridOutW(inverterTrend, searchRange, 'interval_power');
    // 검색 기간을 기준으로 data 비율을 조정함
    // BU.CLI(inverterTrend);
    webUtil.calcScaleRowDataPacket(inverterTrend, searchRange, ['interval_power', 'max_c_wh', 'min_c_wh']);
    // BU.CLI(inverterTrend);

    
    

    let chartOption = {
      selectKey: 'interval_power',
      maxKey: 'max_c_wh',
      minKey: 'min_c_wh',
      dateKey: 'group_date',
      groupKey: 'target_id',
      colorKey: 'chart_color',
      sortKey: 'chart_sort_rank'
    };
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    inverterPowerChartData = webUtil.makeStaticChartData(inverterTrend, betweenDatePoint, chartOption);
    // BU.CLI(inverterTrend);
    // return;
    this.tempApplyScaleInverter(inverterPowerChartData);
    chartOption = {
      selectKey: 'avg_out_w',
      maxKey: 'max_c_wh',
      minKey: 'min_c_wh',
      dateKey: 'group_date',
      groupKey: 'target_id',
      colorKey: 'chart_color',
      sortKey: 'chart_sort_rank'
    };

    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataName(inverterPowerChartData, viewInverterPacketList, 'target_id', 'target_name');

    return {
      inverterPowerChartData,
      inverterTrend,
      viewInverterPacketList
    };
  }


  /**
   * 기상 관측 차트 반환
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   */
  async getWeatherChart(searchRange, betweenDatePoint) {

    let weatherTrend = await this.getWeatherTrend(searchRange);
    webUtil.calcScaleRowDataPacket(weatherTrend, searchRange, ['total_interval_solar']);

    let weatherChartOptionList = [{
      name: '일사량(W/m²)',
      color: 'red',
      yAxis: 1,
      selectKey: 'avg_solar',
      dateKey: 'group_date'
    },
    {
      name: '기온(℃)',
      color: 'green',
      yAxis: 1,
      selectKey: 'avg_temp',
      maxKey: 'avg_temp',
      minKey: 'avg_temp',
      averKey: 'avg_temp',
      dateKey: 'group_date'
    },
    ];

    let weatherChartData = {
      range: betweenDatePoint.shortTxtPoint,
      series: []
    };

    weatherChartOptionList.forEach(chartOption => {
      let staticChart = webUtil.makeStaticChartData(weatherTrend, betweenDatePoint, chartOption);
      let chart = _.head(staticChart.series);
      chart.name = chartOption.name;
      chart.color = chartOption.color;
      chart.yAxis = chartOption.yAxis;

      weatherChartData.series.push(chart);
    });

    let addWeatherChartOptionList = [{
      name: '풍향',
      color: 'brown',
      yAxis: 0,
      selectKey: 'avg_wd',
      dateKey: 'group_date'
    },
    {
      name: '풍속(m/s)',
      color: 'purple',
      yAxis: 0,
      selectKey: 'avg_ws',
      dateKey: 'group_date'
    },
    {
      name: '습도(%)',
      color: 'pink',
      yAxis: 0,
      selectKey: 'avg_reh',
      dateKey: 'group_date'
    },
      // { name: '자외선(uv)', color: 'skyblue', yAxis:0, selectKey: 'avg_uv', dateKey: 'group_date'},
    ];

    weatherChartOptionList = weatherChartOptionList.concat(addWeatherChartOptionList);


    // BU.CLI(chartData);
    return {
      weatherChartData,
      weatherTrend,
      weatherChartOptionList
    };
  }

  /**
   * @param {searchRange} searchRange 
   * @param {number} searchInterval 
   */
  async makeExcelSheet(searchRange, searchInterval){
    let startDate = new Date(searchRange.strBetweenStart);
    let endDate = new Date(searchRange.strBetweenEnd);
    let searchRangeList = [searchRange];

    if(_.includes(['min', 'min10', 'hour'], searchRange.searchType) === false){
      while (startDate < endDate) {
        let newSearchRange = this.getSearchRange(searchInterval, startDate, endDate);
        searchRangeList.push(newSearchRange);
        startDate.setDate(startDate.getDate() + 1);
      }
    }

    // BU.CLI(searchRangeList);
    let workSheetInfoList = await Promise.all(searchRangeList.map(sr => {
      return this.getExcelWorkSheet(sr);
    }));

    let fileName = _.head(workSheetInfoList).sheetName;
    // BU.CLIN(workSheetInfoList);
    let excelContents = excelUtil.makeExcelWorkBook(fileName, workSheetInfoList);

    // return false;
    return {workBook:excelContents, fileName};
  }


  /**
   * 
   * @param {searchRange} searchRange 
   */
  async getExcelWorkSheet(searchRange){
    let searchOption = {
      device_list_type: 'inverter',
      device_seq: 'all',
    };
    let betweenDatePoint = BU.getBetweenDatePoint(searchRange.strBetweenEnd, searchRange.strBetweenStart, searchRange.searchInterval);
    let {inverterPowerChartData, inverterTrend, viewInverterPacketList} = await this.getInverterChart(searchOption, searchRange, betweenDatePoint);

    // BU.CLI(searchRange);
    // BU.CLI(inverterPowerChartData);
    let {weatherTrend, weatherChartOptionList} = await this.getWeatherChart(searchRange, betweenDatePoint);
    let weatherCastRowDataPacketList =  await this.getWeatherCastAverage(searchRange);
    let chartDecoration = webUtil.makeChartDecoration(searchRange);
    let powerChartData = inverterPowerChartData;

    let waterLevelDataPacketList = await this.getWaterLevel(searchRange);
    let calendarCommentList = await this.getCalendarComment(searchRange);
    BU.CLI(calendarCommentList);
    
    let createExcelOption = {
      viewInverterPacketList,
      inverterTrend,
      powerChartData, 
      powerChartDecoration: chartDecoration, 
      waterLevelDataPacketList,
      weatherCastRowDataPacketList,
      weatherTrend, 
      weatherChartOptionList,
      calendarCommentList,
      searchRange
    };
    return excelUtil.makeChartDataToExcelWorkSheet(createExcelOption);
  }


  /**
   * Scale 적용
   * @param {chartData} chartData 
   */
  tempApplyScaleInverter(chartData) {
    chartData.series.forEach(currentItem => {
      let foundIt = _.find(tempSacle.inverterScale, {
        target_id: currentItem.name
      });
      currentItem.option.scale = foundIt.scale;
      currentItem.data.forEach((data, index) => {
        currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
      });
    });
  }




  /**
   * 접속반 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange 
   * @param {{fullTxtPoint: [], shortTxtPoint: []}}
   * @return {chartData} chartData
   */
  async getConnectorChart(searchOption, searchRange, betweenDatePoint) {
    let chartData = { range: [], series: [] };

    // 장비 종류가 인버터, 장비 선택이 전체라면 즉시 종료
    if (searchOption.device_type === 'inverter' && searchOption.device_list_type === 'all') {
      return chartData;
    }

    // 인버터나 전체를 검색한게 아니라면 즉시 리턴
    if (searchOption.device_list_type !== 'all' && searchOption.device_list_type !== 'connector') {
      return chartData;
    }

    // TEST
    // searchRange = biModule.getSearchRange('range', '2018-02-10', '2018-02-14');
    // TODO 접속반 모듈 이름을 가져오기 위한 테이블. 성능을 위해서라면 다른 쿼리문 작성 사용 필요
    let upsasProfile = await this.getTable('v_upsas_profile');
    // BU.CLI(searchRange);
    // 접속반 리스트 불러옴(선택한 접속반의 모듈을 가져오기 위함)
    let connectorList = await this.getTable('connector');
    // BU.CLIS(searchOption, connectorList);
    // 선택한 접속반 seq 정의
    let connectorSeqList = !isNaN(searchOption.device_seq) ? [Number(searchOption.device_seq)] : _.map(connectorList, 'connector_seq');
    // 선택한 접속반에 물려있는 모듈의 seq를 배열에 저장
    let moduleSeqList = _.chain(upsasProfile).filter(profile => {
      return _.includes(connectorSeqList, profile.connector_seq);
    }).map('photovoltaic_seq').union().value();

    /** 모듈 데이터 가져옴 */
    let connectorTrend = await this.getConnectorTrend(moduleSeqList, searchRange);
    // BU.CLI(connectorTrend);

    let chartOption = { selectKey: 'total_wh', dateKey: 'group_date', groupKey: 'photovoltaic_seq', colorKey: 'chart_color', sortKey: 'chart_sort_rank' };
    
    /** 정해진 column을 기준으로 모듈 데이터를 정리 */
    chartData = webUtil.makeStaticChartData(connectorTrend, betweenDatePoint, chartOption);

    // BU.CLI(chartData);

    /* Scale 적용 */
    chartData.series.forEach(currentItem => {
      let foundIt = _.find(tempSacle.moduleScale, { photovoltaic_seq: Number(currentItem.name) });
      currentItem.scale = foundIt.scale;
      currentItem.data.forEach((data, index) => {
        currentItem.data[index] = data === '' ? '' : Number((data * foundIt.scale).scale(1, 1));
      });
    });


    // BU.CLI(chartData);
    /** Grouping Chart에 의미있는 이름을 부여함. */
    webUtil.mappingChartDataNameForModule(chartData, upsasProfile);
    /** searchRange 조건에 따라서 Chart Data의 비율을 변경 */
    webUtil.applyScaleChart(chartData, searchRange.searchType);
    // BU.CLI(chartData);

    return chartData;
  }


}
module.exports = PowerModel;



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