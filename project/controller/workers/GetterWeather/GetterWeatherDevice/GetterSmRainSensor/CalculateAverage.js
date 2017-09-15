class CalculateAverage {
  // 부모 객체, [{key:{averageCount, ciriticalRange}}]
  constructor(calculateOption = {
    averageCount,
    criticalObj
  }) {
    this.averageCount = calculateOption.averageCount;
    this.cycleCount = calculateOption.cycleCount;
    this.criticalObj = calculateOption.criticalObj;

    this.currCycleCount = 0;
  }

  init() {
    let averageObj = {};
    for (let key in this.criticalObj) {
      averageObj[key] = {
        critical: this.criticalObj[key],
        storage: [],
        average: 0
      }
    }
    return averageObj;
  }

  // 데이터 수신 
  // {key:value}
  onDataObj(dataObj, averageObj, callback) {
    this.currCycleCount++;

    // 강제로 평균 값을 구하는 여부
    let hasManualCalculation = false;

    // 데이터 변화가 없어도 주기적으로 데이터를 전송시키는 Count가 Max에 도달 하였을 경우
    if (this.currCycleCount > this.cycleCount) {
      this.currCycleCount = 0;
      hasManualCalculation = true;
    }
    // 평균치 객체 복사
    let cloneAverageObj = Object.assign({}, averageObj);

    
    let hasOccurEvent = false;
    // 데이터 Key 만큼 반복
    for (let key in dataObj) {
      // 수신된 데이터를 push
      let target = cloneAverageObj[key];
      target.storage.push(dataObj[key]);

      if (target.storage.length >= this.averageCount) {
        // 처음으로 데이터가 찼을 경우 평균 값 반환
        if (target.storage.length === this.cycleCount) {
          hasOccurEvent = true;
        } else {
          // 합산 count를 초과하였다면 첫 배열 삭제
          target.storage.shift();
        }

        let average = this.calcAverage(target.storage);
        let critical = target.average - average;
        if (target.critical < Math.abs(critical) || hasManualCalculation) {
          hasOccurEvent = true;
          target.average = average;
        }
      }
    }



    return callback(hasOccurEvent, cloneAverageObj);
  }

  // FIXME: 소수 자릿 수 지정 규칙 및 예외 처리 필요
  calcAverage(array) {
    try {
      let average = array.reduce((a, b) => Number(a) + Number(b)) / array.length;
      if (this.isFloat(average)) {
        average =  Number(average.toFixed(2));
      }
      return average;
    } catch (error) {
      return 0;
    }

  }

  isFloat(n) {
    return n === +n && n !== (n | 0);
  }

  isNumeric(num, opt) {
    // 좌우 trim(공백제거)을 해준다.
    num = String(num).replace(/^\s+|\s+$/g, "");

    if (typeof opt == "undefined" || opt == "1") {
      // 모든 10진수 (부호 선택, 자릿수구분기호 선택, 소수점 선택)
      var regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == "2") {
      // 부호 미사용, 자릿수구분기호 선택, 소수점 선택
      var regex = /^(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
    } else if (opt == "3") {
      // 부호 미사용, 자릿수구분기호 미사용, 소수점 선택
      var regex = /^[0-9]+(\.[0-9]+)?$/g;
    } else {
      // only 숫자만(부호 미사용, 자릿수구분기호 미사용, 소수점 미사용)
      var regex = /^[0-9]$/g;
    }

    if (regex.test(num)) {
      num = num.replace(/,/g, "");
      return isNaN(num) ? false : true;
    } else {
      return false;
    }
  }
}

module.exports = CalculateAverage;