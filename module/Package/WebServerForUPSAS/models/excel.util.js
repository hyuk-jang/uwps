const _ = require('underscore');
const XLSX = require('xlsx');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} createExcelOption
 * @property {chartData} powerChartData
 * @property {chartDecoration} powerChartDecoration
 * @property {searchRange} searchRange
 */

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
 * @typedef {Object} chartData 차트 그리기 위한 데이터 형태
 * @property {Array} range 날짜 범위
 * @property {Array.<chartSeries>} series 차트를 그리기 위한 각각의 객체 리스트
 */

/**
  * @typedef {Object} chartSeries
  * @property {string} name
  * @property {number[]} data
  * @property {string=} color 차트 색상
  * @property {chartDataOption} option 차트 색상
  */

/**
 * @typedef {Object} chartDataOption
 * @property {number=} sort 차트를 정렬 처리할 순서
 * @property {number} max 해당 RowPacketList 최대 값
 * @property {number} min 해당 RowPacketList 최소 값
 * @property {number} aver 해당 RowPacketList 평균 값
 */

/**
  * @typedef {Object} chartDecoration
  * @property {string} mainTitle
  * @property {string} xAxisTitle
  * @property {string} yAxisTitle
  */



/**
 * 차트 데이터
 * @param {createExcelOption} resource 
 */
function makeChartDataToReport(resource){
  let powerChartData = resource.powerChartData;
  let powerChartDecoration = resource.powerChartDecoration;
  let searchRange = resource.searchRange;


  let searchList = [];
  let titleList = [];
  let realTotalPowerList = [];
  let totalPowerList = [];
  let efficiencyList = [];



  // BU.CLI(searchRange);
  const excelTitleList = _.pluck(powerChartData.series, 'name'); 

  // 데이터 그래프
  const resourceList = powerChartData.series;
  // 검색 기간
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);

  searchList = ['검색 기간', powerChartDecoration.mainTitle];
            
  // 메인 제목
  titleList = ['시간'].concat(excelTitleList);
  titleList.push('날씨');
  titleList.push('수심');


  let powerName = '';
  // 기간 발전량 
  switch (searchRange.searchType) {
  case 'hour':
  case 'min10':
    powerName = '1일';
    break;
  default:
    powerName = '총';
    break;
  }

  totalPowerList = [`${powerName} ${powerChartDecoration.yAxisTitle}`];
  
  // 총 발전량
  
  const optionList = _.map(resourceList, resource => resource.option);
  let maxList = _.pluck(optionList, 'max'); 
  maxList.forEach((currentItem, index) => {
    maxList[index] = isNaN(currentItem) ? '' : currentItem;
  });

  



  // let accumulateList = [ `누적 ${powerChartDecoration.yAxisTitle}`];
  // accumulateList = accumulateList.concat(maxList);
  realTotalPowerList = ['기간 발전량'];
  // 검색 기간의 최대 최소 값의 차를 빼서 계산
  optionList.forEach(option => {
    let intervalPower = Number(option.max - option.min); 
    intervalPower = isNaN(intervalPower) ? '' : intervalPower;
    realTotalPowerList.push(intervalPower);
  });
  // 각 행들의 합을 계산
  powerChartData.series.forEach(chartData => {
    let sum = chartData.data.reduce((prev, curr) => {
      return Number(prev) + Number(curr);
    });     
    totalPowerList.push(sum);
  });
  // BU.CLI(powerChartData);
  efficiencyList = ['비교(%)'];
  if(totalPowerList.length === 7){
    totalPowerList.forEach((accumulate, index) => {
      switch (index) {
      case 1:
      case 2:
        efficiencyList.push(100);
        break;
      case 3:
      case 4:
        efficiencyList.push((accumulate / totalPowerList[1] * 100).toFixed(1));
        break;
      case 5:
      case 6:
        efficiencyList.push((accumulate / totalPowerList[2] * 100).toFixed(1));
        break;
      default:
        break;
      }
    });
  }


  // 차트에 표현된 날짜 기간
  const dataLength = powerChartData.range.length;
  // 데이터 그래프
  const dataResourceList = [];
  // 날짜를 1순위에 Push
  dataResourceList.push(powerChartData.range);
  // 발전량 Chart를 순서대로 Push
  powerChartData.series.forEach(currentItem => {
    dataResourceList.push(currentItem.data);
  });

  const excelDataList = [];
  // 차트를 그리기 위한 데이터 정의
  for (let index = 0; index < dataLength; index++) {
    const row = [];
    dataResourceList.forEach((chartColumnList) => {
      let nowValue = chartColumnList[index] === undefined ? '' : chartColumnList[index];
      row.push(nowValue); 
    });
    excelDataList.push(row);
  }

  let powerHeader = [];
  powerHeader.push(searchList);
  powerHeader.push(titleList);
  powerHeader.push(efficiencyList);
  // powerHeader.push(realTotalPowerList);
  // powerHeader.push(accumulateList);
  powerHeader.push(totalPowerList);


  var wb = XLSX.utils.book_new();
  wb.SheetNames = [sheetName]; 
  let ws = XLSX.utils.aoa_to_sheet([]);
  XLSX.utils.sheet_add_aoa(ws, powerHeader, {origin: 'A2'});
  XLSX.utils.sheet_add_aoa(ws, excelDataList, {origin: -1});

  // BU.CLI(ws);
  wb.Sheets[sheetName] = ws;

  return wb;
}
exports.makeChartDataToWorkBook = makeChartDataToReport;



