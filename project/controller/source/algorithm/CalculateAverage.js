// JavaScript source code


class CalculateAverage {
  constructor(param = {
    averageCount,
    averageMaxCount,
    allowError
  }) {

    this.standardValue = 0;
    this.valueCount = 0;
    this.averageCount = param.averageCount;
    this.averageMaxCount = param.averageMaxCount;
    this.averageValue = [];
    this.allowError = param.allowError;
  }

  get averageData() {
    return this.averageValue;
  }

  addData(data) {
    var intData = Number(data);
    this.valueCount++;

    if (this.valueCount == 1) {
      this.standardValue = intData;
    } else {
      this.averageValue.push(intData);
      //BU.log(data);
      if (this.averageCount <= this.averageValue.length) {
        //BU.log("Average Total Count : " + this.averageValue.length);
        var totalValue = 0;
        for (var i = 0; i < this.averageValue.length; i++) {
          totalValue += this.averageValue[i];
        }

        var ErrorValue = this.standardValue - totalValue / this.averageValue.length;
        var absErrorValue = Math.abs(ErrorValue);

        if (absErrorValue >= this.allowError || this.valueCount > this.averageMaxCount) {
          //BU.log("Result Overflow : " + absErrorValue);
          this.standardValue = totalValue / this.averageValue.length;
          this.averageValue = [];
          this.valueCount = 1;
        } else {
          //BU.log("Result Normal : " + absErrorValue);
        }
      }
    }
  }

  initData() {
    this.standardValue = -1;
    this.valueCount = 0;
    this.averageValue = [];
  }
}

module.exports = Calculate;