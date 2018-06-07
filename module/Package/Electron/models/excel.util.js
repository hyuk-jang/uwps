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
  let searchRange = resource.searchRange;
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);

  let allDataList = resource.allDataList;

  let keysData = _.keys(_.head(allDataList));

  // BU.logFile(keysData);
  // // 시작 지점 입력
  // const fixedSummeryColumn = 'C';
  // let summeryColumn = fixedSummeryColumn;
  // keysData.forEach(currentItem => {
  //   ws[summeryColumn + 3] = { t: 's', v: currentItem };
  //   summeryColumn = getNextAlphabet(summeryColumn, 1);
  // });

  const excelDataList = [];
  allDataList.forEach(currentItem => {
    let row = [];
    _.forEach(currentItem, item => {
      row.push(item);
    });
    excelDataList.push(row);
  });

  var wb = XLSX.utils.book_new();
  wb.SheetNames = [sheetName];
  BU.logFile(sheetName);
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

  XLSX.utils.sheet_add_aoa(ws, [keysData], { origin: 'B3' });
  XLSX.utils.sheet_add_aoa(ws, excelDataList, { origin: 'B4' });

  wb.Sheets[sheetName] = ws;

  return {sheetName, ws};
  // return wb;
}
exports.makeChartDataToExcelWorkSheet = makeChartDataToExcelWorkSheet;


/**
 * 
 * @param {Array.<{sheetName: string, ws: Object}>} excelContentsList 
 */
function makeExcelWorkBook(workSheetInfo) {
  var wb = XLSX.utils.book_new();
  // wb.SheetNames = [_.map(excelContentsList, 'sheetName')];
  // BU.CLI(wb.SheetNames);
  /* TEST: properties */
  wb.Props = {
    Title: workSheetInfo.sheetName,
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

  XLSX.utils.book_append_sheet(wb, workSheetInfo.ws, workSheetInfo.sheetName);

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