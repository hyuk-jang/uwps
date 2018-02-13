const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

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
      ivt_target_name: info.ivt_target_name,
      install_place: info.sb_target_name ? info.sb_target_name : '외부',
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
 * @typedef {{range: [], series: Array.<{name: string, data: []}>}} chartData 차트 그리기 위한 데이터 형태
 */

/**
 * Range에 맞는 차트 데이터 구성
 * @param {Object[]} rowDataPacketList 
 * @param {string} dataKey Chart에 표현할 Key
 * @param {string} rangeKey 차트 리스트 범위를 참조할 Key
 * @param {string} groupKey rowDataPacketList를 Group 처리 할 Key
 * @return {chartData}
 */
function makeDynamicChartData(rowDataPacketList, dataKey, rangeKey, groupKey) {
  // 반환 데이터 유형
  let returnValue = {
    range: _.sortBy(_.union(_.pluck(rowDataPacketList, rangeKey)), rangeKey),
    series: []
  };

  if (groupKey === '' || groupKey === undefined) {
    let addObj = {
      name: '',
      data: []
    };

    addObj.data = _.map(_.sortBy(_.groupBy(rowDataPacketList, rangeKey), rangeKey), dataList => {
      return reduceDataList(dataList, dataKey);
    });

    returnValue.series.push(addObj);
  } else {
    // 같은 Key 끼리 그루핑
    let groupDataList = _.groupBy(rowDataPacketList, groupKey);

    returnValue.series = _.map(groupDataList, (groupObj, gKey) => {
      let addObj = {
        name: gKey,
        data: []
      };
      _.each(groupObj, gInfo => {
        let index = _.indexOf(returnValue.range, gInfo[rangeKey]);
        addObj.data[index] = gInfo[dataKey];
      });
      return addObj;
    });
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
 * @return {chartData}
 */
function makeStaticChartData(rowDataPacketList, baseRange, dataKey, rangeKey, groupKey) {
  // 반환 데이터 유형
  let returnValue = {
    range: baseRange.shortTxtPoint,
    series: []
  };

  if (groupKey === '' || groupKey === undefined) {
    let addObj = {
      name: '',
      data: []
    };

    addObj.data = _.map(_.sortBy(_.groupBy(rowDataPacketList, rangeKey), rangeKey), dataList => {
      return reduceDataList(dataList, dataKey);
    });

    returnValue.series.push(addObj);
  } else {
    // 같은 Key 끼리 그루핑
    let groupDataList = _.groupBy(rowDataPacketList, groupKey);

    returnValue.series = _.map(groupDataList, (groupObj, gKey) => {
      let addObj = {
        name: gKey,
        data: []
      };

      baseRange.fullTxtPoint.forEach(fullTxtDate => {
        
      });



      _.each(groupObj, gInfo => {
        let index = _.indexOf(returnValue.range, gInfo[rangeKey]);
        addObj.data[index] = gInfo[dataKey];
      });
      return addObj;
    });
  }
  return returnValue;
}
exports.makeStaticChartData = makeStaticChartData;

/**
 * 
 * @param {chartData} chartData makeChartData 결과물
 * @param {Array.<{}>|string} mappingTarget Mapping 할 대상 데이터. 강제로 이름을 지정하고자 할 경우에 string
 * @param {string} matchingKey matchingKey
 * @param {string} mappingKey matchingKey
 * @return {chartData} Name 처리 한 후 반환
 */
function mappingChartDataName(chartData, mappingTarget, matchingKey, mappingKey) {
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
    } else if(_.isString(mappingTarget)){
      chart.name = mappingTarget;
    }
  });
  // Name을 새로이 입력했으므로 이름순으로 정렬
  chartData.series = _.sortBy(chartData.series, 'name');

  return chartData;
}
exports.mappingChartDataName = mappingChartDataName;