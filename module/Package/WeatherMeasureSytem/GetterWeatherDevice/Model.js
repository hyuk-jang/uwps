class Model {
  constructor(controller) {
    this.controller = controller;

    this.weatherDeviceObj = {};
  }

  get weatherDeviceData() {
    // BU.CLI(this.weatherDeviceObj)
    return this.weatherDeviceObj;
  }

  init() {
    
  }

  // 데이터 수신
  onWeatherDeviceData(vantagePro2Data, smRainData) {
    vantagePro2Data.smRain = smRainData;

    this.weatherDeviceObj = vantagePro2Data;
    // return this.weatherDeviceData;
  }
}

module.exports = Model;