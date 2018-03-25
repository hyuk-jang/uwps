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

  const excelTitleList = _.pluck(powerChartData.series, 'name'); 


  // 데이터 그래프
  const resourceList = powerChartData.series;
  // 검색 기간
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);

  const searchList = ['검색 기간', powerChartDecoration.mainTitle];
            
  // 메인 제목
  const titleList = ['시간'].concat(excelTitleList);
  // 기간 발전량 
  let accumulateList = [ `누적 ${powerChartDecoration.yAxisTitle}`];
  const totalPowerList = [`기간 ${powerChartDecoration.yAxisTitle}`];
  titleList.push('날씨');
  titleList.push('수심');
  // 총 발전량

  const optionList = _.map(resourceList, resource => resource.option);
  let maxList = _.pluck(optionList, 'max'); 
  maxList.forEach((currentItem, index) => {
    maxList[index] = isNaN(currentItem) ? '' : currentItem;
  });
  accumulateList = accumulateList.concat(maxList);

  optionList.forEach(option => {
    let intervalPower = Number(option.max - option.min); 
    intervalPower = isNaN(intervalPower) ? '' : intervalPower;
    totalPowerList.push(intervalPower);
  });


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
  // BU.CLI(dataResourceList);
  // Chart Data의 
  const excelDataList = [];
  for (let index = 0; index < dataLength; index++) {
    const row = [];
    dataResourceList.forEach(currentItem => {
      row.push(currentItem[index] === undefined ? '' : currentItem[index]); 
    });
    excelDataList.push(row);
  }

  let powerHeader = [];
  powerHeader.push(searchList);
  powerHeader.push(titleList);
  powerHeader.push(accumulateList);
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



