const _ = require('underscore');
const XLSX = require('xlsx');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} createExcelOption
 * @property {chartData} powerChartData
 * @property {chartData} gridKwChartData
 * @property {chartDecoration} powerChartDecoration
 * @property {chartData} weatherChartData
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
 * @property {string=} scale 원시 데이터에 곱한 가중치 값
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
function makeChartDataToReport(resource) {
  let ws = XLSX.utils.aoa_to_sheet([]);

  let powerChartData = resource.powerChartData;
  let gridKwChartData = resource.gridKwChartData;

  // BU.CLI(powerChartData);
  let powerChartDecoration = resource.powerChartDecoration;
  let weatherChartData = resource.weatherChartData;
  let searchRange = resource.searchRange;


  let searchList = [];
  let titleList = [];
  let scaleList = [];
  let realTotalPowerList = [];
  let scaleTotalPowerList = [];
  let efficiencyList = [];
  let sumIntervalPowerList = [];



  // BU.CLI(searchRange);
  let powerTitleList = [];
  let tempPowerTitleList = _.pluck(powerChartData.series, 'name');
  // NOTE 구조 수정 할라다가 말음
  // tempPowerTitleList.forEach((currentItem, index) => {
  //   powerTitleList.push(currentItem);
  //   powerTitleList.push('');
  // });
  powerTitleList = tempPowerTitleList;
  // const gridTitleList = _.pluck(gridKwChartData.series, 'name'); 
  const weatherTitleList = _.pluck(weatherChartData.series, 'name');

  // 데이터 그래프
  const resourceList = powerChartData.series;

  // BU.CLI(powerChartData.series);
  // 검색 기간
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);


  searchList = ['검색 기간', powerChartDecoration.mainTitle];

  // 메인 제목
  titleList = [''].concat(powerTitleList, weatherTitleList);
  titleList.push('수심');




  let powerName = '';
  // 기간 발전량 
  switch (searchRange.searchType) {
  case 'hour':
  case 'min10':
  case 'min':
    powerName = '1일';
    break;
  default:
    powerName = '총';
    break;
  }



  // 총 발전량

  const optionList = _.map(resourceList, resource => resource.option);
  let maxList = _.pluck(optionList, 'max');
  maxList.forEach((currentItem, index) => {
    maxList[index] = isNaN(currentItem) ? '' : currentItem;
  });


  // let accumulateList = [ `누적 ${powerChartDecoration.yAxisTitle}`];
  // accumulateList = accumulateList.concat(maxList);
  scaleList = ['가중치'].concat(_.pluck(optionList, 'scale'));
  realTotalPowerList = [`가중치 미적용 ${powerName} ${powerChartDecoration.yAxisTitle}`];
  scaleTotalPowerList = [`가중치 적용 ${powerName} ${powerChartDecoration.yAxisTitle}`];
  // 검색 기간의 최대 최소 값의 차를 빼서 계산
  let columnList = ['B', 'C', 'D', 'E', 'F', 'G'];
  optionList.forEach((option, index) => {
    let intervalPower = Number(option.max - option.min);
    intervalPower = isNaN(intervalPower) ? '' : intervalPower;
    realTotalPowerList.push(intervalPower);
    let column = columnList[index];
    ws[column + '6'] = { t: 'n', f: `${column}4*${column}5` };
    // scaleTotalPowerList.push((intervalPower * option.scale).scale(1, 3));
  });

  // BU.CLI(scaleTotalPowerList);
  // BU.CLI(powerChartData);

  efficiencyList = ['비교(%)'];
  columnList.forEach((column, index) => {
    switch (index) {
    case 0:
    case 2:
    case 3:
      ws[column + '7'] = { t: 'n', f: `${column}6/B6` };
      // efficiencyList.push((accumulate / scaleTotalPowerList[1] * 100).scale(1, 1));
      break;
    case 1:
    case 4:
    case 5:
      ws[column + '7'] = { t: 'n', f: `${column}6/C6` };
      // efficiencyList.push((accumulate / scaleTotalPowerList[2] * 100).scale(1, 1));
      break;
    default:
      break;
    }
    XLSX.utils.cell_set_number_format(ws[column + '7'], '0.0%');
  });

  // 차트에 표현된 날짜 기간
  const dataLength = powerChartData.range.length;
  // 데이터 그래프
  const dataResourceList = [];
  // 날짜를 1순위에 Push
  dataResourceList.push(powerChartData.range);
  // 발전량 Chart를 순서대로 Push
  gridKwChartData.series.forEach(currentItem => {
    dataResourceList.push(currentItem.data);
  });

  // 기상 Chart를 순서대로 Push
  weatherChartData.series.forEach(currentItem => {
    dataResourceList.push(currentItem.data);
  });


  ws['A10'] = { t: 's', v: powerChartDecoration.xAxisTitle };
  ws['!merges'] = [XLSX.utils.decode_range('B10:G10')];
  ws['B10'] = { t: 's', v: '출력(W)', a: 'c' };

  // const excelDataList = [[powerChartDecoration.xAxisTitle]];
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

  // 각 행들의 합을 계산
  sumIntervalPowerList = [`합산 ${powerName} ${powerChartDecoration.yAxisTitle}`];
  powerChartData.series.forEach(chartData => {
    let sum = chartData.data.reduce((prev, curr) => {
      return Number(prev) + Number(curr);
    });
    sumIntervalPowerList.push(sum);
  });

  let powerHeader = [];
  powerHeader.push(searchList);
  powerHeader.push(titleList);
  powerHeader.push(realTotalPowerList);
  powerHeader.push(scaleList);
  powerHeader.push(scaleTotalPowerList);
  powerHeader.push(efficiencyList);
  // powerHeader.push(accumulateList);
  // powerHeader.push(sumIntervalPowerList);


  var wb = XLSX.utils.book_new();
  wb.SheetNames = [sheetName];

  /* TEST: properties */
  wb.Props = {
    Title: sheetName,
    Subject: '6kW TB',
    Author: 'SmSoft',
    Manager: 'Kepco',
    Company: 'SmSoft',
    Category: 'UPMS',
    Keywords: 'Power',
    Comments: 'Nothing to say here',
    LastAuthor: 'j.hyuk',
    CreatedDate: new Date()
  };


  ws['!merges'] = [XLSX.utils.decode_range('B2:D2'), XLSX.utils.decode_range('B10:G10')];
  // ws['!merges'] = [ XLSX.utils.decode_range('B2:D2'),
  //   XLSX.utils.decode_range('B3:C3'),
  //   XLSX.utils.decode_range('D3:E3'),
  //   XLSX.utils.decode_range('F3:G3'),
  //   XLSX.utils.decode_range('H3:I3'),
  //   XLSX.utils.decode_range('J3:K3'),
  //   XLSX.utils.decode_range('L3:M3') ];
  // ws['!merges'] = [ XLSX.utils.decode_range('B3:C3') ];

  
  let colsInfoList = [
    { wch: 28 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 15 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
  ];

  /* TEST: column props */
  ws['!cols'] = colsInfoList;

  /* TEST: row props */
  // let rowsInfoList = [{ hpt: 20 }, { hpt: 20 }, { hpt: 20}, { hpt: 40 }, { hpt: 20 }, { hpt: 40 }];
  // ws['!rows'] = rowsInfoList;

  XLSX.utils.sheet_add_aoa(ws, powerHeader, { origin: 'A2' });
  // XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});
  XLSX.utils.sheet_add_aoa(ws, excelDataList, { origin: 'A11' });
  // XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});

  // BU.CLI(ws);
  wb.Sheets[sheetName] = ws;

  return wb;
}
exports.makeChartDataToWorkBook = makeChartDataToReport;



