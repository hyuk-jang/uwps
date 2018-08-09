const {CU} = require('base-util-jh');

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
   *
   * @param {number} inclinedSolar
   */
  onData(inclinedSolar) {
    this.averageStorage.addData('inclinedSolar', inclinedSolar);
    this.deviceData.inclinedSolar = this.averageStorage.getAverage('inclinedSolar');
  }
}

module.exports = Model;
