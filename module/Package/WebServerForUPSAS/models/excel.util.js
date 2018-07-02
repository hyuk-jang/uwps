let webUtil = require('./web.util');
// const _ = require('underscore');
const _ = require('lodash');
const XLSX = require('xlsx');

const BU = require('base-util-jh').baseUtil;

/**
 * @typedef {Object} createExcelOption
 * @prop {weatherTrend[]} weatherTrend
 * @prop {Array.<calendarComment>} calendarCommentList
 * @prop {searchRange} searchRange
 * @prop {chartData} powerChartData
 * @prop {Array.<weatherCastRowDataPacket>} weatherCastRowDataPacketList
 * @prop {Array.<viewInverterDataPacket>} viewInverterPacketList
 * @prop {chartDecoration} powerChartDecoration
 * @prop {Array.<waterLevelDataPacket>} waterLevelDataPacketList
 * @prop {Object[]} inverterTrend
 * @prop {Array.<weatherChartOption>} weatherChartOptionList
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
 * @typedef {Object} calendarComment
 * @property {string} comment 테스트 내용에 부연 설명을 필요로 할때
 * @property {number} is_error 테스트 에러 여부
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

  
const weatherCastOptionList= [
  { name: '운량', selectKey: 'avg_sky', dateKey: 'group_date'},
];


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
  let powerChartData = resource.powerChartData;

  let viewInverterPacketList = _.sortBy(resource.viewInverterPacketList, 'chart_sort_rank');
  // BU.CLI(viewInverterPacketList);

  // BU.CLI(powerChartData);
  let inverterTrend = resource.inverterTrend;
  let powerChartDecoration = resource.powerChartDecoration;
  let weatherTrend = resource.weatherTrend;
  let weatherChartOptionList = resource.weatherChartOptionList;
  let waterLevelDataPacketList = resource.waterLevelDataPacketList;
  let weatherCastRowDataPacketList = resource.weatherCastRowDataPacketList;
  let calendarCommentList = resource.calendarCommentList;
  // BU.CLI(calendarCommentList);
  
  let searchRange = resource.searchRange;

  let searchList = [];
  let sumIntervalPowerList = [];

  // 데이터 그래프
  const resourceList = powerChartData.series;
  // BU.CLI(powerChartData.series);
  // 검색 기간
  let rangeStart = searchRange.rangeStart;
  let sheetName = rangeStart + (searchRange.rangeEnd === '' ? '' : ` ~ ${searchRange.rangeEnd}`);



  /** 개요 구성 시작 */
  searchList = ['검색 기간', powerChartDecoration.mainTitle];

  const commentInfo = ['특이사항'];
  let comment = '';
  const calendarComment = _.head(calendarCommentList);
  const calendarErrorNum = _.get(calendarComment, 'is_error');

  switch (calendarErrorNum) {
  case 0:
    comment += '(테스트 0)';
    break;
  case 1:
    comment += '(테스트 X: 기타)';
    break;
  case 2:
    comment += '(테스트 X: 비)';
    break;
  default:
    break;
  }

  comment += ' ' + _.get(calendarComment, 'comment', '') || '';
  commentInfo.push(comment);

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
  let powerTitleList = _.map(powerChartData.series, 'name');
  ws['B4'] = { t: 's', v: `가중치 미적용 \n${powerName} ${powerChartDecoration.yAxisTitle}` };
  ws['B5'] = { t: 's', v: '비교(%)'};
  ws['B6'] = { t: 's', v: '가중치' };
  ws['B7'] = { t: 's', v: `가중치 적용 \n${powerName} ${powerChartDecoration.yAxisTitle}`};
  ws['B8'] = { t: 's', v: '비교(%)'};
  ws['B9'] = { t: 's', v: '이용률(%)'};
  ws['B10'] = { t: 's', v: '수위(cm)'};
  ws['B13'] = { t: 's', v: powerChartDecoration.xAxisTitle };
  
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
  ws[fixedSummeryColumn + 12] = { t: 's', v: '인버터 출력(W)' };
  ws[getNextAlphabet(fixedSummeryColumn, viewInverterPacketList.length) + '12'] = { t: 's', v: `인버터 ${powerChartDecoration.yAxisTitle}` };
  viewInverterPacketList.forEach((viewInverterPacket, index) => {
    let foundOptionIt = _.find(optionList, {sort: viewInverterPacket.chart_sort_rank});
    let foundForeginOptionIt = _.find(viewInverterPacketList, {compare_inverter_seq: viewInverterPacket.compare_inverter_seq});
    let subData = _.subtract(_.get(foundOptionIt, 'max'), _.get(foundOptionIt, 'min'));
    let columnName = viewInverterPacket.columnName;
    let strDataName = viewInverterPacket.target_name;
    let waterLevel = _.get(_.find(waterLevelDataPacketList, {inverter_seq: viewInverterPacket.inverter_seq}), 'water_level', ''); 
    // 인버터 명
    ws[columnName + '3'] = { t: 's', v: strDataName };
    // 가중치 미적용
    ws[columnName + '4'] = { t: 'n', v: subData };
    XLSX.utils.cell_set_number_format(ws[columnName + '4'], '#,#0.0##');
    // 가중치 미적용 비교
    ws[columnName + '5'] = { t: 'n', f: `${columnName}4/${foundForeginOptionIt.columnName}4` };
    XLSX.utils.cell_set_number_format(ws[columnName + '5'], '0.0%');
    // 가중치
    ws[columnName + '6'] = { t: 'n', v: _.get(foundOptionIt, 'scale') || '' };
    // 가중치 적용
    ws[columnName + '7'] = { t: 'n', f: `${columnName}4*${columnName}6` };
    XLSX.utils.cell_set_number_format(ws[columnName + '7'], '#,#0.0##');
    // 가중치 적용 비교
    ws[columnName + '8'] = { t: 'n', f: `${columnName}7/${foundForeginOptionIt.columnName}7` };
    XLSX.utils.cell_set_number_format(ws[columnName + '8'], '0.0%');

    // 24시간 발전 용량 Wh(kw -> w 1000배, Scale 10 나눔 ---> 100(시간당 발전용량))
    // FIXME 월 단위는 계산식 틀림. 일단 놔둠.
    // BU.CLI(viewInverterPacket.pv_amount);
    let inverterAmount = _.multiply(viewInverterPacket.pv_amount);
    inverterAmount = webUtil.convertValueBySearchType(inverterAmount, searchRange.searchType);
    // 24시간 대비 이용률
    ws[columnName + '9'] = { t: 'n', f: `${columnName}7/(${inverterAmount}*24)` };
    XLSX.utils.cell_set_number_format(ws[columnName + '9'], '0.0%');
   
    // BU.CLI(ws);
    // 수위
    ws[columnName + '10'] = { t: 'n', v: waterLevel};
   
    // 데이터 상세 리스트 제목도 같이 구성
    strDataName = _.replace(strDataName, '(', '\n(');
    ws[getNextAlphabet(fixedSummeryColumn, index) + '13'] = { t: 's', v: strDataName };
    ws[getNextAlphabet(fixedSummeryColumn, index + viewInverterPacketList.length) + '13'] = { t: 's', v: strDataName };
  });

  // BU.CLI(ws);
  /** 기상 개요 구성 시작 */
  summeryColumn = getNextAlphabet(summeryColumn, 1);
  ws[summeryColumn + 3] = { t: 's', v: '기상계측장치' };
  ws[summeryColumn + 12] = { t: 's', v: '기상계측장치' };
  /** 데이터 레포트를 출력하기 위한 테이블 제목 세팅 */
  // 기상 계측 장치 옵션 만큼 반복
  weatherChartOptionList.forEach(currentItem => {
    let strDataName = currentItem.name;
    // 데이터 상세 리스트 제목도 같이 구성
    ws[summeryColumn + '13'] = { t: 's', v: strDataName };
    strDataName = _.replace(strDataName, '(', '\n(');
    let data = 0;
    switch (currentItem.selectKey) {
    case 'avg_solar':
      var tempStr = ['min', 'min10', 'hour'].includes(searchRange.searchType) ? 'Wh/m²' : 'kWh/m²';
      strDataName = `총 일사량\n(${tempStr})`;
      data = _.sumBy(weatherTrend, 'total_interval_solar');
      break;
    default:
      strDataName = `평균 ${strDataName}`;
      data = _.meanBy(weatherTrend, currentItem.selectKey);
      break;
    }
    data =_.round(data, 1);
    ws[summeryColumn + '4'] = { t: 's', v: strDataName };
    ws[summeryColumn + '5'] = { t: 'n', v: data };
    XLSX.utils.cell_set_number_format(ws[summeryColumn + '5'], '#,#0.0##');
    currentItem.columnName = summeryColumn;
    summeryColumn = getNextAlphabet(summeryColumn, 1);
  });

  ws[summeryColumn + 3] = { t: 's', v: '기상청' };
  ws[summeryColumn + 12] = { t: 's', v: '기상청' };
  weatherCastOptionList.forEach(currentItem => {
    let strDataName = currentItem.name;
    ws[summeryColumn + '13'] = { t: 's', v: strDataName };
    strDataName = _.replace(strDataName, '(', '\n(');
    let data = 0;
    switch (currentItem.selectKey) {
    case '':
    default:
      strDataName = `평균 ${strDataName}`;
      data = _.round(_.meanBy(weatherCastRowDataPacketList, currentItem.selectKey), 1);
      break;
    }
    ws[summeryColumn + '4'] = { t: 's', v: strDataName };
    ws[summeryColumn + '5'] = { t: 'n', v: data };
    XLSX.utils.cell_set_number_format(ws[summeryColumn + '5'], '#,#0.0##');
    currentItem.columnName = summeryColumn;
    summeryColumn = getNextAlphabet(summeryColumn, 1);
  });

  /** 기상 개요 구성 끝 */
  

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
    // 기상 관측 장비 데이터 추출
    weatherChartOptionList.forEach(weatherChartOption => {
      const foundIt = _.find(weatherTrend, {view_date: defaultRange[index]});
      row.push(_.isEmpty(foundIt) ? '' : foundIt[weatherChartOption.selectKey]);
    });

    // 기상청 데이터 추출
    weatherCastOptionList.forEach(weatherCastOption => {
      const foundIt = _.find(weatherCastRowDataPacketList, {view_date: defaultRange[index]});
      row.push(_.isEmpty(foundIt) ? '' : foundIt[weatherCastOption.selectKey]);
    });


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
    XLSX.utils.decode_range('Q8:T8'), 

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

    XLSX.utils.decode_range('C12:H12'),
    XLSX.utils.decode_range('I12:N12'),
    XLSX.utils.decode_range('P12:S12'),

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
  XLSX.utils.sheet_add_aoa(ws, [commentInfo], { origin: 'P8' });
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