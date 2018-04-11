const _ = require('underscore');
const XLSX = require('xlsx');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} createExcelOption
 * @property {Object[]} inverterTrend
 * @property {chartData} powerChartData
 * @property {chartDecoration} powerChartDecoration
 * @property {chartData} weatherChartData
 * @property {Object[]} weatherTrend
 * @property {Object[]} weatherChartOptionList
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

  // BU.CLI(powerChartData);
  let inverterTrend = resource.inverterTrend;
  let powerChartDecoration = resource.powerChartDecoration;
  let weatherTrend = resource.weatherTrend;
  let weatherChartOptionList = resource.weatherChartOptionList;
  let searchRange = resource.searchRange;

  let searchList = [];
  let sumIntervalPowerList = [];

  // BU.CLI(searchRange);
  
  // let sssss = (_.pluck(powerChartData.series, 'name').join('@@')).split('@');
  // BU.CLI(sssss);

  // 데이터 그래프
  const resourceList = powerChartData.series;

  // BU.CLI(powerChartData.series);
  // 검색 기간
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);


  searchList = ['검색 기간', powerChartDecoration.mainTitle];

  // 메인 제목
  
  // titleList.push('수심');

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
  let powerTitleList = _.pluck(powerChartData.series, 'name');
  let titleScaleList = _.pluck(optionList, 'scale');
  // 검색 기간의 최대 최소 값의 차를 빼서 계산

  ws['B4'] = { t: 's', v: `가중치 미적용 \n${powerName} ${powerChartDecoration.yAxisTitle}` };
  ws['B5'] = { t: 's', v: '가중치' };
  ws['B6'] = { t: 's', v: `가중치 적용 \n${powerName} ${powerChartDecoration.yAxisTitle}`};
  ws['B7'] = { t: 's', v: '비교(%)'};
  
  let summeryColumnList = ['C', 'E', 'G', 'I', 'K', 'M'];

  optionList.forEach((option, index) => {
    let intervalPower = Number(option.max - option.min);
    intervalPower = isNaN(intervalPower) ? '' : intervalPower;
    let column = summeryColumnList[index];

    ws[column + '3'] = { t: 's', v: powerTitleList[index] };
    ws[column + '4'] = { t: 'n', v: intervalPower };
    ws[column + '5'] = { t: 'n', v: titleScaleList[index] };
    ws[column + '6'] = { t: 'n', f: `${column}4*${column}5` };
    XLSX.utils.cell_set_number_format(ws[column + '6'], '0.00');
    // scaleTotalPowerList.push((intervalPower * option.scale).scale(1, 3));
  });

  summeryColumnList.forEach((column, index) => {
    switch (index) {
    case 0:
    case 2:
    case 3:
      ws[column + '7'] = { t: 'n', f: `${column}6/C6` };
      break;
    case 1:
    case 4:
    case 5:
      ws[column + '7'] = { t: 'n', f: `${column}6/E6` };
      break;
    default:
      break;
    }
    XLSX.utils.cell_set_number_format(ws[column + '7'], '0.0%');
  });
  
  /** 데이터 레포트를 출력하기 위한 테이블 제목 세팅 */
  const weatherTitleList = _.pluck(weatherChartOptionList, 'name');
  ws['B10'] = { t: 's', v: powerChartDecoration.xAxisTitle };
  let reportTitleList = powerTitleList.concat(weatherTitleList);
  let reportColumnList = ['C', 'E', 'G', 'I', 'K', 'M', 'O'];
  let reportSubTitleList = [];
  reportColumnList.forEach((currentItem, index) => {
    if(reportColumnList.length === index + 1){
      ws[currentItem + 10] = { t: 's', v: '기상계측장치' };
    } else {
      ws[currentItem + 10] = { t: 's', v: reportTitleList[index] };
      reportSubTitleList = reportSubTitleList.concat(['출력(W)', powerChartDecoration.yAxisTitle]);
    }
  });
  
  let weatherColumnList = ['O', 'P', 'Q', 'R', 'S'];
  weatherColumnList.forEach((currentItem, index) => {
    ws[currentItem + 11] = { t: 's', v: weatherTitleList[index] };
  });
  /** 데이터 레포트를 출력하기 위한 테이블 제목 세팅 */


  const excelDataList = [];
  // 차트에 표현된 날짜 기간

  const defaultRange = powerChartData.range;
  const groupInverterTrend = _.groupBy(inverterTrend, 'target_name');
  for (let index = 0; index < defaultRange.length; index++) {
    const row = [];
    row.push(defaultRange[index]);
    powerTitleList.forEach(powerTitle => {
      const foundIt = _.findWhere(groupInverterTrend[powerTitle], {view_date: defaultRange[index]});
      row.push(_.isEmpty(foundIt) ? '' : foundIt.grid_out_w);
      row.push(_.isEmpty(foundIt) ? '' : foundIt.interval_wh);
    });

    weatherChartOptionList.forEach(weatherChartOption => {
      const foundIt = _.findWhere(weatherTrend, {view_date: defaultRange[index]});
      row.push(_.isEmpty(foundIt) ? '' : foundIt[weatherChartOption.selectKey]);
    });
    excelDataList.push(row);
  }
  // 각 행들의 합을 계산
  sumIntervalPowerList = ['', `합산 ${powerName} ${powerChartDecoration.yAxisTitle}`];
  powerChartData.series.forEach(chartData => {
    let sum = chartData.data.reduce((prev, curr) => {
      return Number(prev) + Number(curr);
    });
    sumIntervalPowerList.push('');
    sumIntervalPowerList.push(sum);
  });

  let powerHeader = [searchList];

  XLSX.utils.cell_add_comment(ws['B10'], '출력(W)은 발전량을 토대로 계산한 값으로 실제 인버터에서 계측한 출력(W)은 아닙니다.');

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


  ws['!merges'] = [
    XLSX.utils.decode_range('C2:H2'), 
    XLSX.utils.decode_range('C3:D3'),
    XLSX.utils.decode_range('E3:F3'),
    XLSX.utils.decode_range('G3:H3'),
    XLSX.utils.decode_range('I3:J3'),
    XLSX.utils.decode_range('K3:L3'),
    XLSX.utils.decode_range('M3:N3'),
    XLSX.utils.decode_range('C4:D4'),
    XLSX.utils.decode_range('E4:F4'),
    XLSX.utils.decode_range('G4:H4'),
    XLSX.utils.decode_range('I4:J4'),
    XLSX.utils.decode_range('K4:L4'),
    XLSX.utils.decode_range('M4:N4'),
    XLSX.utils.decode_range('C5:D5'),
    XLSX.utils.decode_range('E5:F5'),
    XLSX.utils.decode_range('G5:H5'),
    XLSX.utils.decode_range('I5:J5'),
    XLSX.utils.decode_range('K5:L5'),
    XLSX.utils.decode_range('M5:N5'),
    XLSX.utils.decode_range('C6:D6'),
    XLSX.utils.decode_range('E6:F6'),
    XLSX.utils.decode_range('G6:H6'),
    XLSX.utils.decode_range('I6:J6'),
    XLSX.utils.decode_range('K6:L6'),
    XLSX.utils.decode_range('M6:N6'),
    XLSX.utils.decode_range('C7:D7'),
    XLSX.utils.decode_range('E7:F7'),
    XLSX.utils.decode_range('G7:H7'),
    XLSX.utils.decode_range('I7:J7'),
    XLSX.utils.decode_range('K7:L7'),
    XLSX.utils.decode_range('M7:N7'),
    XLSX.utils.decode_range('B10:B11'),
    XLSX.utils.decode_range('C10:D10'),
    XLSX.utils.decode_range('E10:F10'),
    XLSX.utils.decode_range('G10:H10'),
    XLSX.utils.decode_range('I10:J10'),
    XLSX.utils.decode_range('K10:L10'),
    XLSX.utils.decode_range('M10:N10'),
    XLSX.utils.decode_range('O10:S10'),
  ];
  
  let colsInfoList = [
    { wch: 3 }, 
    { wch: 15 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 10 }, 
    { wch: 13 }, 
  ];

  /* TEST: column props */
  ws['!cols'] = colsInfoList;

  // /* TEST: row props */
  let rowsInfoList = [{ hpt: 10 }, { hpt: 24 }, { hpt: 22}, { hpt: 35 }, { hpt: 20 }, { hpt: 35 }, { hpt: 20 }, { hpt: 15 }, { hpt: 15 }, { hpt: 24 }, { hpt: 24 }];
  ws['!rows'] = rowsInfoList;

  XLSX.utils.sheet_add_aoa(ws, powerHeader, { origin: 'B2' });
  XLSX.utils.sheet_add_aoa(ws, [reportSubTitleList], { origin: 'C11' });
  // XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});
  // BU.CLI(ws);
  XLSX.utils.sheet_add_aoa(ws, excelDataList, { origin: 'B12' });
  XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});

  wb.Sheets[sheetName] = ws;

  return wb;
}
exports.makeChartDataToWorkBook = makeChartDataToReport;



// 누적 발전량 (쓰이지 않음)
// let maxList = _.pluck(optionList, 'max');
// maxList.forEach((currentItem, index) => {
//   maxList[index] = isNaN(currentItem) ? '' : currentItem;
// });


/* TEST: row props */
// let rowsInfoList = [{ hpt: 20 }, { hpt: 20 }, { hpt: 20}, { hpt: 40 }, { hpt: 20 }, { hpt: 40 }];
// ws['!rows'] = rowsInfoList;
// reportSubTitleList;
