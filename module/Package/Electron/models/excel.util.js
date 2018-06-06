let webUtil = require('./web.util');
// const _ = require('underscore');
const _ = require('lodash');
const XLSX = require('xlsx');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} createExcelOption
 * @property {Array.<viewInverterDataPacket>} viewInverterPacketList
 * @property {Object[]} inverterTrend
 * @property {chartData} powerChartData
 * @property {chartDecoration} powerChartDecoration
 * @property {Array.<waterLevelDataPacket>} waterLevelDataPacketList
 * 
 * @property {Array.<weatherTrend>} weatherTrend
 * @property {Array.<weatherChartOption>} weatherChartOptionList
 * @property {Array.<weatherCastRowDataPacket>} weatherCastRowDataPacketList
 * @property {searchRange} searchRange
 */

/**
 * searchRange Type
 * @typedef {Object} waterLevelDataPacket
 * @property {number} inverter_seq 인버터 장치 시퀀스
 * @property {number} water_level 수위
 * @property {string} view_date 차트에 표현할 Date Format
 * @property {string} group_date 그룹 처리한 Date Format
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
 * 인버터 현황 정보
 * @typedef {Object} viewInverterDataPacket
 * @property {number} inverter_seq 
 * @property {string} target_id 
 * @property {string} target_name
 * @property {string} target_type 
 * @property {string} target_category 
 * @property {number} amount scale 10:1 인버터 용량
 * @property {string} chart_sort_rank 
 * @property {string} compare_inverter_seq 
 * @property {string} columnName 
 */



/**
 * @typedef {Object} weatherCastRowDataPacket
 * @property {string} view_date 차트에 표현할 Date Format
 * @property {string} group_date 그룹 처리한 Date Format
 * @property {number} avg_sky 평균 운량
 */

/**
 * @typedef {Object} weatherChartOption
 * @property {string} name 기상 데이터 명
 * @property {string} color 차트 색상
 * @property {string} selectKey 데이터 Key
 * @property {string} dateKey 묶는 기준 날짜 ket
 */


/**
 * @typedef {Object} weatherTrend
 * @property {string} view_date 차트에 표현할 Date Format
 * @property {string} group_date 그룹 처리한 Date Format
 * @property {number} avg_sm_infrared 평균 적외선 감지 값
 * @property {number} avg_temp 평균 기온
 * @property {number} avg_reh 평균 습도
 * @property {number} avg_solar 평균 일사량
 * @property {number} total_interval_solar 기간 총 일사량
 * @property {number} avg_ws 평균 풍속
 */ 


/**
  * @typedef {Object} chartDecoration
  * @property {string} mainTitle
  * @property {string} xAxisTitle
  * @property {string} yAxisTitle
  */

/**
 * 차트 데이터
 * @param {string} char 
 * @param {number} nextIndex 
 */
function getNextAlphabet(char, nextIndex) {
  let charHexCode = Number(char.charCodeAt());
  charHexCode += nextIndex;
  return Buffer.from([charHexCode]).toString();
}

/**
 * 차트 데이터
 * @param {createExcelOption} resource 
 */
function makeChartDataToExcelWorkSheet(resource) {
  let ws = XLSX.utils.aoa_to_sheet([]);


  let allDataList = resource.allDataList;

  let keysData = _.keys(_.head(allDataList));

  keysData.forEach(currentItem => {
    
  });


  // 시작 지점 입력
  const fixedSummeryColumn = 'C';
  let summeryColumn = fixedSummeryColumn;
  // 인버터 종류별로 반복
  viewInverterPacketList.forEach(currentItem => {
    // 컬럼 HexCode 값을 Str으로 변형
    currentItem.columnName = summeryColumn;
    summeryColumn = getNextAlphabet(summeryColumn, 2);
  });

  // 인버터 리스트 반복
  ws[fixedSummeryColumn + 3] = { t: 's', v: '인버터 출력(W)' };
  ws[getNextAlphabet(fixedSummeryColumn, viewInverterPacketList.length) + '12'] = { t: 's', v: `인버터 ${powerChartDecoration.yAxisTitle}` };
  viewInverterPacketList.forEach((viewInverterPacket, index) => {
    let foundOptionIt = _.find(optionList, {sort: viewInverterPacket.chart_sort_rank});
    let subData = _.subtract(_.get(foundOptionIt, 'max'), _.get(foundOptionIt, 'min'));
    let columnName = viewInverterPacket.columnName;
    let strDataName = viewInverterPacket.target_name;
    // 인버터 명
    ws[columnName + '3'] = { t: 's', v: strDataName };
    // 가중치 미적용
    ws[columnName + '4'] = { t: 'n', v: subData };
    XLSX.utils.cell_set_number_format(ws[columnName + '4'], '#,#0.0##');
   
    // 데이터 상세 리스트 제목도 같이 구성
    strDataName = _.replace(strDataName, '(', '\n(');
    ws[getNextAlphabet(fixedSummeryColumn, index) + '13'] = { t: 's', v: strDataName };
    ws[getNextAlphabet(fixedSummeryColumn, index + viewInverterPacketList.length) + '13'] = { t: 's', v: strDataName };
  });

  // BU.CLI(ws);
  /** 기상 개요 구성 시작 */
  summeryColumn = getNextAlphabet(summeryColumn, 1);
  
  const excelDataList = [];
  // 차트에 표현된 날짜 기간

  const defaultRange = powerChartData.range;
  const groupInverterTrend = _.groupBy(inverterTrend, 'target_name');
  // BU.CLI(groupInverterTrend);
  // console.time('111');
  // FIXME 선택한 인버터의 갯수에 따라서 동적으로 배치하는 논리 적용 필요
  for (let index = 0; index < defaultRange.length; index++) {
    let row = [];
    row.push(defaultRange[index]);

    let wList = [];
    let powerList = [];
    // 인버터 발전량 데이터 추출
    powerTitleList.forEach(powerTitle => {
      const foundIt = _.find(groupInverterTrend[powerTitle], {view_date: defaultRange[index]});
      wList.push(_.isEmpty(foundIt) ? '' : foundIt.grid_out_w);
      powerList.push(_.isEmpty(foundIt) ? '' : foundIt.interval_power);
    });

    row = _.concat(row, wList, powerList);
    // row = row.concat(wList, powerList);
    // 한칸 띄우기
    row.push('');

    // // 기상청 데이터 추출
    // weatherCastOptionList.forEach(weatherCastOption => {
    //   const foundIt = _.find(weatherCastRowDataPacketList, {view_date: defaultRange[index]});
    //   row.push(_.isEmpty(foundIt) ? '' : foundIt[weatherCastOption.selectKey]);
    // });


    // let weatherCastData = _.find(weatherCastRowDataPacketList, {view_date: defaultRange[index]});
    // row.push(_.isEmpty(weatherCastData) ? '' : weatherCastData.avg_sky);
    excelDataList.push(row);
  }
  // BU.CLI(excelDataList);
  // console.timeEnd('111');
  // 각 행들의 합을 계산
  sumIntervalPowerList = ['', `합산 ${powerName} ${powerChartDecoration.yAxisTitle}`, '', '', '', '', '', ''];
  powerChartData.series.forEach(chartData => {
    sumIntervalPowerList.push(_.sum(_.without(chartData.data, '') ));
  });
  let powerHeader = [searchList];

  // XLSX.utils.cell_add_comment(ws['B10'], '출력(W)은 발전량을 토대로 계산한 값으로 실제 인버터에서 계측한 출력(W)은 아닙니다.');

  var wb = XLSX.utils.book_new();
  wb.SheetNames = [sheetName];

  /* TEST: properties */
  wb.Props = {
    Title: sheetName,
    Subject: 'pv_led',
    Author: 'SmSoft',
    Manager: '',
    Company: 'SmSoft',
    Category: 'pv_led',
    Keywords: 'Power',
    Comments: 'Nothing to say here',
    LastAuthor: 'j.hyuk',
    CreatedDate: new Date()
  };


  ws['!merges'] = [
    XLSX.utils.decode_range('C2:H2'), 

    XLSX.utils.decode_range('C3:D3'),
    XLSX.utils.decode_range('C4:D4'),
    XLSX.utils.decode_range('C5:D5'),
    XLSX.utils.decode_range('C6:D6'),
    XLSX.utils.decode_range('C7:D7'),
    XLSX.utils.decode_range('C8:D8'),
    XLSX.utils.decode_range('C9:D9'),
    XLSX.utils.decode_range('C10:D10'),

    XLSX.utils.decode_range('E3:F3'),
    XLSX.utils.decode_range('E4:F4'),
    XLSX.utils.decode_range('E5:F5'),
    XLSX.utils.decode_range('E6:F6'),
    XLSX.utils.decode_range('E7:F7'),
    XLSX.utils.decode_range('E8:F8'),
    XLSX.utils.decode_range('E9:F9'),
    XLSX.utils.decode_range('E10:F10'),

    XLSX.utils.decode_range('G3:H3'),
    XLSX.utils.decode_range('G4:H4'),
    XLSX.utils.decode_range('G5:H5'),
    XLSX.utils.decode_range('G6:H6'),
    XLSX.utils.decode_range('G7:H7'),
    XLSX.utils.decode_range('G8:H8'),
    XLSX.utils.decode_range('G9:H9'),
    XLSX.utils.decode_range('G10:H10'),

    XLSX.utils.decode_range('I3:J3'),
    XLSX.utils.decode_range('I4:J4'),
    XLSX.utils.decode_range('I5:J5'),
    XLSX.utils.decode_range('I6:J6'),
    XLSX.utils.decode_range('I7:J7'),
    XLSX.utils.decode_range('I8:J8'),
    XLSX.utils.decode_range('I9:J9'),
    XLSX.utils.decode_range('I10:J10'),

    XLSX.utils.decode_range('K3:L3'),
    XLSX.utils.decode_range('K4:L4'),
    XLSX.utils.decode_range('K5:L5'),
    XLSX.utils.decode_range('K6:L6'),
    XLSX.utils.decode_range('K7:L7'),
    XLSX.utils.decode_range('K8:L8'),
    XLSX.utils.decode_range('K9:L9'),
    XLSX.utils.decode_range('K10:L10'),

    XLSX.utils.decode_range('M3:N3'),
    XLSX.utils.decode_range('M4:N4'),
    XLSX.utils.decode_range('M5:N5'),
    XLSX.utils.decode_range('M6:N6'),
    XLSX.utils.decode_range('M7:N7'),
    XLSX.utils.decode_range('M8:N8'),
    XLSX.utils.decode_range('M9:N9'),
    XLSX.utils.decode_range('M10:N10'),

    XLSX.utils.decode_range('P3:T3'),

    // XLSX.utils.decode_range('B12:B13'),

    XLSX.utils.decode_range('C12:D12'),
    XLSX.utils.decode_range('E12:F12'),

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
    { wch: 3 }, 
    { wch: 13 }, 
  ];

  /* TEST: column props */
  ws['!cols'] = colsInfoList;

  // /* TEST: row props */
  let rowsInfoList = [{ hpt: 10 }, { hpt: 24 }, { hpt: 22}, { hpt: 35 }, { hpt: 20 }, { hpt: 20 }, { hpt: 35 }, { hpt: 20 }, { hpt: 20 }, { hpt: 20 }, { hpt: 15 }, { hpt: 24 }, { hpt: 35 }];
  ws['!rows'] = rowsInfoList;

  XLSX.utils.sheet_add_aoa(ws, powerHeader, { origin: 'B2' });
  // XLSX.utils.sheet_add_aoa(ws, [reportTitleList], { origin: 'C11' });
  // XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});
  // BU.CLI(ws);
  XLSX.utils.sheet_add_aoa(ws, excelDataList, { origin: 'B14' });
  XLSX.utils.sheet_add_aoa(ws, [sumIntervalPowerList], {origin: -1});

  wb.Sheets[sheetName] = ws;

  return {sheetName, ws};
  // return wb;
}
exports.makeChartDataToExcelWorkSheet = makeChartDataToExcelWorkSheet;


/**
 * 
 * @param {Array.<{sheetName: string, ws: Object}>} excelContentsList 
 */
function makeExcelWorkBook(sheetName, excelContentsList) {
  var wb = XLSX.utils.book_new();
  // wb.SheetNames = [_.map(excelContentsList, 'sheetName')];
  // BU.CLI(wb.SheetNames);
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

  excelContentsList.forEach((currentItem, index) => {
    XLSX.utils.book_append_sheet(wb, currentItem.ws, currentItem.sheetName);
  });
  // BU.CLI(wb);

  return wb;

}
exports.makeExcelWorkBook = makeExcelWorkBook;


// 누적 발전량 (쓰이지 않음)
// let maxList = _.pluck(optionList, 'max');
// maxList.forEach((currentItem, index) => {
//   maxList[index] = isNaN(currentItem) ? '' : currentItem;
// });


/* TEST: row props */
// let rowsInfoList = [{ hpt: 20 }, { hpt: 20 }, { hpt: 20}, { hpt: 40 }, { hpt: 20 }, { hpt: 40 }];
// ws['!rows'] = rowsInfoList;
// reportSubTitleList;

  
// let reportColumnList = ['C', 'I'];
// let reportSubTitleList = [];
// reportColumnList.forEach((currentItem, index) => {
//   if(reportColumnList.length === index + 1){
//     ws[currentItem + 10] = { t: 's', v: '기상계측장치' };
//   } else {
//     ws[currentItem + 10] = { t: 's', v: reportTitleList[index] };
//     reportSubTitleList = reportSubTitleList.concat(['출력(W)', powerChartDecoration.yAxisTitle]);
//   }
// });