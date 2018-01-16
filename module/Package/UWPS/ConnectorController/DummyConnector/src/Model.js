/** Class DummyConnector 데이터 저장 */
class Model {
  /**
   * Controller Method Chaning Pattern
   * @param {Control} controller Control 객체
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