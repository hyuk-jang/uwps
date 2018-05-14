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
   * 인버터 차트 반환
   * @param {{device_type: string, device_list_type: string, device_type_list: [], device_seq: string, search_type: string}} searchOption
   * @param {searchRange} searchRange
   * @param {{fullTxtPoint: [], shortTxtPoint: []}} betweenDatePoint
   * @return {{inverterPowerChartData: chartData, inverterTrend: Object[], viewInverterPacketList: Array.<viewInverterDataPacket>}} chartData
   */
  async getInverterChart(searchOption, searchRange, betweenDatePoint) {
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
    // BU.CLI(inverterTrend);
    webUtil.addKeyToReport(inverterTrend, viewInverterPacketList, 'target_id', 'inverter_seq');
    webUtil.addKeyToReport(inverterTrend, viewInverterPacketList, 'target_name', 'inverter_seq');
    // 기간 발전량을 기준으로 실제 계통 출력량을 계산하여 추가함(grid_out_w)
    webUtil.calcRangeGridOutW(inverterTrend, searchRange, 'interval_power');
    // 검색 기간을 기준으로 data 비율을 조정함
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
      yAxis: 0,
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
      let staicChart = webUtil.makeStaticChartData(weatherTrend, betweenDatePoint, chartOption);
      let chart = _.head(staicChart.series);
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
   */
  async makeExcelSheet(searchRange){
    let startDate = new Date(searchRange.strStartDateInputValue);
    let endDate = new Date(searchRange.strEndDateInputValue);
    let searchRangeList = [searchRange];
    while (startDate < endDate) {
      let newSearchRange = this.getSearchRange(searchRange.searchType, startDate, endDate);
      searchRangeList.push(newSearchRange);
      startDate = startDate.addDays(1);
    }

    // BU.CLI(searchRangeList);
    let workSheetInfoList = await Promise.all(searchRangeList.map(sr => {
      return this.getExcelWorkSheet(sr);
    }));

    let fileName = _.head(workSheetInfoList).sheetName;
    let excelContents = excelUtil.makeExcelWorkBook(fileName, workSheetInfoList);

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
    let {weatherTrend, weatherChartOptionList} = await this.getWeatherChart(searchRange, betweenDatePoint);
    // BU.CLI(weatherTrend);
    let weatherCastRowDataPacketList =  await this.getWeatherCastAverage(searchRange);
    let chartDecoration = webUtil.makeChartDecoration(searchRange);
    let powerChartData = inverterPowerChartData;

    let waterLevelDataPacketList = await this.getWaterLevel(searchRange);
    
    let createExcelOption = {
      viewInverterPacketList,
      inverterTrend,
      powerChartData, 
      powerChartDecoration: chartDecoration, 
      waterLevelDataPacketList,
      weatherCastRowDataPacketList,
      weatherTrend, 
      weatherChartOptionList,
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