const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;


/**
 * @typedef {Object} calcRowPacketIntervalOption
 * @property {string} calcMaxKey
 * @property {string} calcMinKey
 * @property {string} resultKey
 * @property {string} groupKey
 * @property {{dateKey: string, maxRequiredDateSecondValue: number, minRequiredCountKey: string, minRequiredCountValue: number}} rangeOption
 */


/**
 * 기상청 날씨 변경
 * @param {{temp: number, pty: number, wf_kor: string, wf_en: string, pop: number, r12: number, ws:number, wd: number, reh: number, applydate: Date}} weatherCastInfo 
 * @return {{temp: number, wf: number}} 
 */
function convertWeatherCast(weatherCastInfo) {
  let returnValue = {temp: 0, wf: 0};

  if(_.isEmpty(weatherCastInfo)){
    return returnValue;
  }

  returnValue.temp = weatherCastInfo.temp;

  switch (weatherCastInfo.wf_en) {
  case 'Clear':
    returnValue.wf = 1;
    break;
  case 'Partly Cloudy':
    returnValue.wf = 2;
    break;
  case 'Mostly Cloudy':
    returnValue.wf = 3;
    break;
  case 'Cloudy':
    returnValue.wf = 4;
    break;
  case 'Rain':
    returnValue.wf = 5;
    break;
  case 'Snow/Rain':
    returnValue.wf = 6;
    break;
  case 'Snow':
    returnValue.wf = 7;
    break;
  default:
    returnValue.wf = 0;
    break;
  }

  return returnValue;
}
exports.convertWeatherCast = convertWeatherCast;

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
 * 기준이 되는 날을 기준으로 해당 데이터의 유효성을 검증. 10분 이상 차이가 나면 유효하지 않는 데이터로 처리.
 * @param {Array|Object} targetData 점검하고자 하는 데이터
 * @param {Date} baseDate 기준 날짜
 * @param {string} dateKey 검색 날짜와 매칭되는 키
 * @return {Array.<{hasValidData: boolean, data: Object}>} 의미 있는 데이터 체크
 */
function checkDataValidation(targetData, baseDate, dateKey) {
  if (_.isArray(targetData)) {
    let validDataList = [];

    targetData.forEach(data => {
      let result = checkDataValidation(data, baseDate, dateKey);
      validDataList = validDataList.concat(result);
    });
    return validDataList;
  } else if (_.isObject(targetData)) {
    let validData = {
      hasValidData: false,
      data: {}
    };

    const gapDate = BU.calcDateInterval(baseDate, targetData[dateKey]);
    // BU.CLIS(gapDate, BU.convertDateToText(baseDate), BU.convertDateToText(targetData[dateKey]))
    validData.hasValidData = gapDate.remainDay === 0 && gapDate.remainHour === 0 && gapDate.remainMin < 10 ? true : false;
    validData.data = targetData;

    return [validData];
  }
}
exports.checkDataValidation = checkDataValidation;

/**
 * checkDataValidation 수행 뒤의 Array의 특정 Key를 전부 합산 뒤 반환
 * @param {Array.<{hasValidData: boolean, data: Object}>} validDataList checkDataValidation를 수행하고 난 Array
 * @param {string} key 계산 Key
 * @param {boolean} hasAll hasValidData 여부에 상관없이 더할지
 * @return {number} 합산 값
 */
function calcValidDataList(validDataList, key, hasAll) {
  let validList = [];
  if (hasAll) {
    validList = _.pluck(validDataList, 'data');
  } else {
    _.each(validDataList, validData => {
      if (validData.hasValidData) {
        validList.push(validData.data);
      }
    });
  }
  // BU.CLI(validList);
  let returnNumber = _.reduce(_.pluck(validList, key), (accumulator, currentValue) => accumulator + currentValue);
  return _.isNumber(returnNumber) ? returnNumber : 0;
}
exports.calcValidDataList = calcValidDataList;

/**
 * 값을 합산
 * @param {Array.<{Object}>} dataList Object List 
 * @param {string} key 계산 Key
 * @return {number|string} 계산 결과 값 or ''
 */
function reduceDataList(dataList, key) {
  let returnNumber = _.reduce(_.pluck(dataList, key), (prev, next) => prev + next);
  return _.isNumber(returnNumber) ? returnNumber : '';
}
exports.reduceDataList = reduceDataList;

/**
 * 기준 값에 Scale 적용 후 소수 점 처리 후 반환
 * @param {number} value 계산 할려는 값
 * @param {number} scale 게산 식 etc: 0.001, 100, 10, 20 
 * @param {number|string} toFixedNumber 소수 점 자리
 */
function calcValue(value, scale, toFixedNumber) {
  // BU.CLIS(value, scale, toFixedNumber);
  if (_.isNumber(value) && _.isNumber(scale) && _.isNumber(toFixedNumber)) {
    return Number((value * scale).toFixed(toFixedNumber));
  }
  return '';
  // throw Error('argument 중 숫자가 아닌것이 있습니다.');
}
exports.calcValue = calcValue;




/**
 * 
 * @param {Object[]} rowDataPacketList 
 * @param {calcRowPacketIntervalOption} calcOption 
 */
function calcRangePower(rowDataPacketList, calcOption){
  // BU.CLI(calcOption);
  
  // 같은 Key 끼리 그루핑
  if (calcOption.groupKey) {
    // BU.CLI(groupKey);
    let groupRowDataPacketList = _.groupBy(rowDataPacketList, calcOption.groupKey);


    const hasCalcRange = _.isEmpty(calcOption.rangeOption) ? false : true;
    const hasCalcDate = hasCalcRange && calcOption.rangeOption.dateKey.length ? true : false;
    const hasCalcCount = hasCalcRange && calcOption.rangeOption.minRequiredCountKey.length ? true : false;
    
    _.each(groupRowDataPacketList, rowList => {
      let prevValue;
      let prevDate;
      rowList.forEach((rowData, index) => {
        let hasError = false;
        if(index === 0){
          prevValue = _.isEmpty(calcOption.calcMinKey) ? rowData[calcOption.calcMaxKey] : rowData[calcOption.calcMinKey];
        } 
        // BU.CLI(prevDate);
        // 날짜 계산 옵션이 있다면 날짜 임계치를 벗어났는지 체크

        if(hasCalcDate && prevDate instanceof Date){
          /** @type {Date} */
          let currDate = rowData[calcOption.rangeOption.dateKey];
          currDate = typeof currDate === 'string' ? BU.convertTextToDate(currDate) : currDate;
          // BU.CLI(BU.convertDateToText(prevDate), BU.convertDateToText(currDate));
          let thisCritical = (currDate.getTime() - prevDate.getTime()) * 0.001;
          // BU.CLIS(prevDate.getTime(), currDate.getTime(), currDate.getTime() - prevDate.getTime());
          if(thisCritical > calcOption.rangeOption.maxRequiredDateSecondValue){
            hasError = true;
          }
        } 

        if(hasCalcCount && calcOption.rangeOption.minRequiredCountValue > rowData[calcOption.rangeOption.minRequiredCountKey]){
          hasError = true;
        }

        // BU.CLI(hasError);
        rowData[calcOption.resultKey] = hasError ?  '' : rowData[calcOption.calcMaxKey] - prevValue;
        // BU.CLI(rowData);
        prevValue = rowData[calcOption.calcMaxKey];

        if(hasCalcDate){
          prevDate = rowData[calcOption.rangeOption.dateKey];
          prevDate = typeof prevDate === 'string' ? BU.convertTextToDate(prevDate) : prevDate;
        }
      });
      // rowList.shift();
    });

    return groupRowDataPacketList;
    
  } 
}
exports.calcRangePower = calcRangePower;


/**
 * 접속반 메뉴에서 사용될 데이터 선언 및 부분 정의
 * @param {Array.<{connector_ch: number, photovoltaic_seq: number, pv_target_name: string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string}>} viewUpsasProfile DB에서 
 * @param {number|string} connector_seq 선택한 접속반
 * @return {Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>}
 */
function refineSelectedConnectorList(viewUpsasProfile, connector_seq) {
  let sortedList = _.flatten(_.map(_.groupBy(viewUpsasProfile, profile => profile.connector_seq), group => _.sortBy(group, 'connector_ch')));
  if (connector_seq !== 'all') {
    sortedList = _.filter(sortedList, info => info.connector_seq === connector_seq);
  }
  return _.map(sortedList, info => {
    return {
      photovoltaic_seq: info.photovoltaic_seq,
      connector_ch: `CH ${info.connector_ch}`,
      pv_target_name: info.pv_target_name,
      pv_manufacturer: info.pv_manufacturer,
      cnt_target_name: info.cnt_target_name,
      ivt_target_id: info.ivt_target_id,
      ivt_target_name: info.ivt_target_name,
      inverter_seq: info.inverter_seq,
      install_place: info.sb_target_name ? info.sb_target_name : '육상',
      writedate: '',
      amp: '',
      vol: '',
      power: '',
      temperature: '',
      hasOperation: false
    };
  });
}
exports.refineSelectedConnectorList = refineSelectedConnectorList;

/**
 * Array.<{}> --> Array.<Array>
 * @param {Array} targetList 
 * @param {Array} priotyKeyList 
 * @param {number} repeatLength 
 * @return {Array} 
 */
function convertColumn2Rows(targetList, priotyKeyList, repeatLength) {
  const returnValue = {};
  priotyKeyList.forEach(key => {
    let pluckData = _.pluck(targetList, key);
    let space = repeatLength - pluckData.length;
    for (let i = 0; i < space; i++) {
      pluckData.push('');
    }
    returnValue[key] = pluckData;
  });

  return returnValue;
}
exports.convertColumn2Rows = convertColumn2Rows;
// 
/**
 * 인버터 메뉴에서 사용될 데이터 선언 및 부분 정의
 * @param {Object[]} viewInverterStatus DB에서 
 * @return {{totalInfo: {in_kw: number=, out_kw: number=, d_kwh: number=, c_mwh: number=}, dataList: Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>}}
 */
function refineSelectedInverterStatus(viewInverterStatus) {
  let returnValue = {
    totalInfo: {},
    dataList: []
  };
  let currInverterDataList = _.map(viewInverterStatus, info => {
    // BU.CLI(info)
    let hasValidData = info.hasValidData;
    let data = info.data;
    let addObj = {
      inverter_seq: data.inverter_seq,
      target_id: data.target_id,
      target_name: data.target_name,
      in_a: '',
      in_v: '',
      in_w: '',
      in_kw: '',
      out_a: '',
      out_v: '',
      out_w: '',
      out_kw: '',
      p_f: '',
      d_wh: '',
      d_kwh: '',
      c_mwh: '',
      writedate: data.writedate,
      hasOperation: false
    };

    // if (true) {
    if (hasValidData) {
      addObj.in_a = data.in_a;
      addObj.in_v = data.in_v;
      addObj.in_w = data.in_w;
      addObj.in_kw = _.isNumber(data.in_w) ? calcValue(data.in_w, 0.001, 3) : '';
      addObj.out_a = data.out_a;
      addObj.out_v = data.out_v;
      addObj.out_w = data.out_w;
      addObj.out_kw = _.isNumber(data.out_w) ? calcValue(data.out_w, 0.001, 3) : '';
      addObj.p_f = data.p_f;
      addObj.d_wh = data.d_wh;
      addObj.d_kwh = _.isNumber(data.d_wh) ? calcValue(data.d_wh, 0.001, 3) : '';
      addObj.c_mwh = _.isNumber(data.c_wh) ? calcValue(data.c_wh, 0.000001, 4) : '';
      addObj.hasOperation = true;
    }
    return addObj;
  });
  currInverterDataList = _.sortBy(currInverterDataList, 'target_name');
  // 인버터 실시간 데이터 테이블
  returnValue.dataList = currInverterDataList;
  returnValue.totalInfo.in_kw = calcValue(reduceDataList(currInverterDataList, 'in_kw'), 1, 3);
  returnValue.totalInfo.out_kw = calcValue(reduceDataList(currInverterDataList, 'out_kw'), 1, 3);
  returnValue.totalInfo.d_kwh = calcValue(reduceDataList(currInverterDataList, 'd_kwh'), 1, 3);
  returnValue.totalInfo.c_mwh = calcValue(reduceDataList(currInverterDataList, 'c_mwh'), 1, 4);

  return returnValue;
}
exports.refineSelectedInverterStatus = refineSelectedInverterStatus;


/**
 * @typedef {{range: [], series: Array.<{name: string, color: string=, data: []}>}} chartData 차트 그리기 위한 데이터 형태
 */

/**
 * Range에 맞는 차트 데이터 구성
 * @param {Object[]} rowDataPacketList 
 * @param {string} dataKey Chart에 표현할 Key
 * @param {string} rangeKey 차트 리스트 범위를 참조할 Key
 * @param {string} groupKey rowDataPacketList를 Group 처리 할 Key
 * @param {{colorKey: string, sortKey: string}=} option color 및 정렬 옵션
 * @return {chartData}
 */
function makeDynamicChartData(rowDataPacketList, dataKey, rangeKey, groupKey, option) {
  // BU.CLI(rowDataPacketList);

  // 반환 데이터 유형
  let returnValue = {
    range: _.sortBy(_.union(_.pluck(rowDataPacketList, rangeKey))),
    series: []
  };

  // 색상키가 정해져있찌 않다면 색상 없이 반환
  const hasColor = _.isEmpty(option) || _.isEmpty(option.colorKey) ? false : true;
  const hasSort = _.isEmpty(option) || _.isEmpty(option.sortKey) ? false : true;

  // BU.CLI(returnValue.range);
  // 같은 Key 끼리 그루핑
  if (groupKey) {
    // BU.CLI(groupKey);
    let groupDataList = _.groupBy(rowDataPacketList, groupKey);
    returnValue.series = _.map(groupDataList, (groupObj, gKey) => {
      let addObj = {
        name: gKey,
        data: []
      };

      let dataRow =  _.first(groupObj);
      if(hasColor){
        addObj.color = dataRow[option.colorKey];
      }
      if(hasSort){
        addObj.sort = dataRow[option.sortKey];
      }

      _.each(groupObj, gInfo => {
        let index = _.indexOf(returnValue.range, gInfo[rangeKey]);
        addObj.data[index] = gInfo[dataKey];
      });
      return addObj;
    });

    if(hasSort){
      returnValue.series = _.sortBy(returnValue.series, obj => obj.sort );
    } else {
      returnValue.series = _.sortBy(returnValue.series, obj => obj.name );
    }
  } else {  
    let addObj = {
      name: '',
      data: []
    };

    addObj.data = _.map(_.sortBy(_.groupBy(rowDataPacketList, rangeKey), rangeKey) , dataList => {
      let resReduce = reduceDataList(dataList, dataKey);
      return resReduce;
    });

    returnValue.series.push(addObj);
  }
  return returnValue;
}
exports.makeDynamicChartData = makeDynamicChartData;

/**
 * 차트 데이터
 * @param {Object[]} rowDataPacketList 
 * @param {{fullTxtPoint: [], shortTxtPoint: []}} baseRange 고정된 Column 객체
 * @param {string} dataKey Chart에 표현할 Key
 * @param {string} rangeKey 차트 리스트 범위를 참조할 Key
 * @param {string} groupKey rowDataPacketList를 Group 처리 할 Key
 * @param {{colorKey: string, sortKey: string}=} option color 및 정렬 옵션
 * @return {chartData}
 */
function makeStaticChartData(rowDataPacketList, baseRange, dataKey, rangeKey, groupKey, option) {
  // 반환 데이터 유형
  let returnValue = {
    range: baseRange.shortTxtPoint,
    series: []
  };

  // BU.CLI(rangeKey);
  
  // 색상키가 정해져있찌 않다면 색상 없이 반환
  const hasColor = _.isEmpty(option) || _.isEmpty(option.colorKey) ? false : true;
  const hasSort = _.isEmpty(option) || _.isEmpty(option.sortKey) ? false : true;

  // 같은 Key 끼리 그루핑
  if (groupKey) {
    let groupedRowPacketDataList = _.groupBy(rowDataPacketList, groupKey);

    returnValue.series = _.map(groupedRowPacketDataList, (groupObj, gKey) => {
      let addObj = {
        name: gKey,
        data: []
      };

      let dataRow =  _.first(groupObj);
      if(hasColor){
        addObj.color = dataRow[option.colorKey];
      }
      if(hasSort){
        addObj.sort = dataRow[option.sortKey];
      }

      baseRange.fullTxtPoint.forEach(fullTxtDate => {
        let resultFind = _.findWhere(groupObj, {
          [rangeKey]: fullTxtDate
        });

        // BU.CLI(findGridObj)
        let data = _.isEmpty(resultFind) ? '' : resultFind[dataKey];
        addObj.data.push(data);
      });
      return addObj;
    });

    if(hasSort){
      returnValue.series = _.sortBy(returnValue.series, obj => obj.sort );
    } else {
      returnValue.series = _.sortBy(returnValue.series, obj => obj.name );
    }
  } else {
    let addObj = {
      name: '',
      data: []
    };

    addObj.data = _.map(_.sortBy(_.groupBy(rowDataPacketList, rangeKey), rangeKey) , dataList => {
      return reduceDataList(dataList, dataKey);
    });

    returnValue.series.push(addObj);
  }
  return returnValue;
}
exports.makeStaticChartData = makeStaticChartData;

/**
 * 검색 조건 (year, month, day)에 따라서 비율을 변환하여 반환
 * @param {number} number 
 * @param {string} searchType 
 */
function convertValueBySearchType(number, searchType) {
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
exports.convertValueBySearchType = convertValueBySearchType;

/**
 * 차트 데이터 검색 조건에 따라서 데이터 비율 적용
 * @param {chartData} chartData 차트 데이터
 * @param {string} searchType 검색 타입 year, month, day, hour
 */
function applyScaleChart(chartData, searchType) {
  // BU.CLI(searchType);
  chartData.series.forEach(chart => {
    chart.data.forEach((data, index) => {
      // BU.CLI(data);
      chart.data[index] = _.isNumber(data) ? convertValueBySearchType(data, searchType) : '';
    });
  });
  return chartData;
}
exports.applyScaleChart = applyScaleChart;

/**
 * 차트를 생성하는데 필요한 부가적인 정보 생성
 * @param {searchRange} searchRange 검색 옵션
 * @return {{mainTitle: string, xAxisTitle: string, yAxisTitle: string}} x, y, title Text
 */
function makeChartOption(searchRange) {
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
    yAxisTitle = '발전량(Wh)';
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
exports.makeChartOption = makeChartOption;

/**
 * 차트 name을 의미있는 이름으로 변환
 * @param {chartData} chartData makeChartData 결과물
 * @param {Array.<{}>|string} mappingTarget Mapping 할 대상 데이터. 강제로 이름을 지정하고자 할 경우에 string
 * @param {string} matchingKey matchingKey
 * @param {string} mappingKey matchingKey
 * @return {chartData} Name 처리 한 후 반환
 */
function mappingChartDataName(chartData, mappingTarget, matchingKey, mappingKey, hasSort) {
  // BU.CLIS(mappingTarget, matchingKey);
  chartData.series.forEach(chart => {
    let chartKey = chart.name;
    if (_.isArray(mappingTarget)) {
      let findObj = _.findWhere(mappingTarget, {
        [matchingKey]: Number(chartKey)
      });
      if (_.isEmpty(findObj)) {
        findObj = _.findWhere(mappingTarget, {
          [matchingKey]: chartKey
        });
      }
      chart.name = _.isEmpty(findObj) ? chart.name : findObj[mappingKey];
    } else if (_.isString(mappingTarget)) {
      chart.name = mappingTarget;
    }
  });
  // Name을 새로이 입력했으므로 이름순으로 정렬
  chartData.series = hasSort ? _.sortBy(chartData.series, 'name') : chartData.series;

  return chartData;
}
exports.mappingChartDataName = mappingChartDataName;

/**
 * 모듈 차트 name을 의미있는 이름으로 변환
 * @param {chartData} chartData makeChartData 결과물
 * @param {Array.<{}>|string} mappingTarget Mapping 할 대상 데이터. 강제로 이름을 지정하고자 할 경우에 string
 * @param {string} matchingKey matchingKey
 * @param {string} mappingKey matchingKey
 * @return {chartData} Name 처리 한 후 반환
 */
function mappingChartDataNameForModule(chartData, mappingTarget) {
  chartData.series.forEach(chart => {
    let upsasInfo = _.findWhere(mappingTarget, {
      photovoltaic_seq: Number(chart.name)
    });
    chart.name = `${upsasInfo.cnt_target_name} ${upsasInfo.pv_target_name} (${upsasInfo.pv_manufacturer.slice(0, 2)})`;
    // chart.name = `${upsasInfo.cnt_target_name} ${upsasInfo.pv_target_name} CH ${upsasInfo.connector_ch} `;
  });
  chartData.series = _.sortBy(chartData.series, 'ivt_target_name');
  return chartData;
}
exports.mappingChartDataNameForModule = mappingChartDataNameForModule;


/**
 * DB 긁어온 내용에 key 추가
 * @param {Object[]} sourceList 
 * @param {Object[]} referenceList 
 * @param {string} addKey 
 * @param {string} referenceKey 
 */
function addKeyToReport(sourceList, referenceList, addKey, referenceKey){
  // BU.CLIS(sourceList, referenceList);
  sourceList.forEach(currentItem => {
    const findIt = _.findWhere(referenceList, {[referenceKey]: currentItem[referenceKey]});

    currentItem[addKey] = _.isEmpty(findIt) ? '' : findIt[addKey]; 
  });

  return sourceList;

}
exports.addKeyToReport = addKeyToReport;

// /**
//  * Range에 맞는 차트 데이터 구성
//  * @param {Object[]} rowDataPacketList 
//  * @param {string} dataKey Chart에 표현할 Key
//  * @param {string} outputKey 추가할 output Key
//  * @param {string} groupKey rowDataPacketList를 Group 처리 할 Key
//  * @param {string} sortKey 
//  * @return {Object[]} outputKey 가 추가된 rowDataPacketList
//  */
// function calcDailyPower(rowDataPacketList, groupKey, dataKey, outputKey, sortKey) {
//   // 그룹을 지어 계산할 거라면
//   if(groupKey){
//     const group = _.groupBy(rowDataPacketList, groupKey);
//     BU.CLI(group);
//     _.each(group, (list, key) => {
      
//       let reverseList = (_.sortBy(list, ele => {
//         return ele[sortKey];
//       })).reverse();

//       _.reduce(reverseList, (prev, next) => {
        
//       });

//       BU.CLI(reverseList);
//     });
//     // BU.CLI(group);
//   } else {

//   }

// }
// exports.calcDailyPower = calcDailyPower;


// if (groupKey === '' || groupKey === undefined) {
//   let addObj = {
//     name: '',
//     data: []
//   };

//   addObj.data = _.map(_.groupBy(rowDataPacketList, rangeKey), dataList => {
//     return reduceDataList(dataList, dataKey);
//   });

//   returnValue.series.push(addObj);
// } else {
//   // 같은 Key 끼리 그루핑
//   let groupDataList = _.groupBy(rowDataPacketList, groupKey);

//   returnValue.series = _.map(groupDataList, (groupObj, gKey) => {
//     let addObj = {
//       name: gKey,
//       data: []
//     };
//     _.each(groupObj, gInfo => {
//       let index = _.indexOf(returnValue.range, gInfo[rangeKey]);
//       addObj.data[index] = gInfo[dataKey];
//     });
//     return addObj;
//   });
// }