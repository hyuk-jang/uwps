const _ = require('lodash');

const {BU, CU} = require('base-util-jh');

class Model {
  constructor() {
    this.deviceData = {
      inclinedSolar: null,
    };

    const averConfig = {
      maxStorageNumber: 10, // 최대 저장 데이터 수
      keyList: Object.keys(this.deviceData),
    };

    this.averageStorage = new CU.AverageStorage(averConfig);
  }

  /**
   * 경사 일사량 데이터
   * @param {number[]} inclinedSolar
   */
  onData(inclinedSolar) {
    if (inclinedSolar.length) {
      if (_.isNumber(_.head(inclinedSolar))) {
        this.averageStorage.addData('inclinedSolar', _.round(_.head(inclinedSolar) * 0.1), 1);
      }
    } else {
      this.averageStorage.addData('inclinedSolar', null);
    }

    this.deviceData.inclinedSolar = this.averageStorage.getAverage('inclinedSolar');
    BU.CLI('inclinedSolar', this.deviceData.inclinedSolar);
  }
}

module.exports = Model;
