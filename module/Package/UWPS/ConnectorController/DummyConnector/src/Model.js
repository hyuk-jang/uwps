/** Class DummyConnector 데이터 저장 */
class Model {
  /**
   * Controller Method Chaning Pattern
   * @param {Object} controller Control 객체
   * @param {Object} controller.config Control 설정 정보
   */
  constructor(controller) {
    this.controller = controller;

    this.config = controller.config;
    this.socketServerPort = 0;

    this.connectorData = {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
    };


  }
}

module.exports = Model;
