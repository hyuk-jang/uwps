const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;

/**
 * 기준이 되는 날을 기준으로 해당 데이터의 유효성을 검증
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
    BU.CLI(gapDate);
    vaildData.hasValidData = gapDate.remainDay === 0 && gapDate.remainHour === 0 && gapDate.remainMin < 30 ? true : false;
    vaildData.data = targetData;

    return [vaildData];
  }
}
exports.checkDataValidation = checkDataValidation;