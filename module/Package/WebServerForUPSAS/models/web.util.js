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
    let vaildDataList = [];

    targetData.forEach(data => {
      let result = checkDataValidation(data, baseDate, dateKey);
      vaildDataList = vaildDataList.concat(result);
    });
    return vaildDataList;
  } else if (_.isObject(targetData)) {
    let vaildData = {
      hasValidData: false,
      data: {}
    };

    const gapDate = BU.calcDateInterval(baseDate, targetData[dateKey]);
    vaildData.hasValidData = gapDate.remainDay === 0 && gapDate.remainHour === 0 && gapDate.remainMin < 10 ? true : false;
    vaildData.data = targetData;

    return [vaildData];
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
  let vaildList = [];
  if (hasAll) {
    vaildList = _.pluck(validDataList, 'data');
  } else {
    _.each(validDataList, validData => {
      if (validData.hasValidData) {
        vaildList.push(validData.data);
      }
    });
  }
  // BU.CLI(vaildList);
  let returnNumber = _.reduce(_.pluck(vaildList, key), (accumulator, currentValue) => accumulator + currentValue);
  return _.isNumber(returnNumber) ? returnNumber : 0;
}
exports.calcValidDataList = calcValidDataList;

/**
 * 기준 값에 Scale 적용 후 소수 점 처리 후 반환
 * @param {number} value 계산 할려는 값
 * @param {number} scale 게산 식 etc: 0.001, 100, 10, 20 
 * @param {number} toFixedNumber 소수 점 자리
 */
function calcValue(value, scale, toFixedNumber) {
  // BU.CLIS(value, scale, toFixedNumber);
  if (_.isNumber(value) && _.isNumber(scale) && _.isNumber(toFixedNumber)) {
    return Number((value * scale).toFixed(toFixedNumber));
  }
  throw Error('argument 중 숫자가 아닌것이 있습니다.');
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

/**
 * 인버터 메뉴에서 사용될 데이터 선언 및 부분 정의
 * @param {Object[]} viewInverterStatus DB에서 
 * @return {Array.<{photovoltaic_seq:number, connector_ch: number, pv_target_name:string, pv_manufacturer: string, cnt_target_name: string, ivt_target_name: string, install_place: string, writedate: Date, amp: number, vol: number, hasOperation: boolean }>}
 */
function refineSelectedInverterList(viewInverterStatus) {
  let returnValue = _.map(viewInverterStatus, info => {
    let vaildData = info.vaildData;
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
    if (vaildData) {
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
  returnValue = _.sortBy(returnValue, 'target_name');
  return returnValue;
}
exports.refineSelectedInverterList = refineSelectedInverterList;