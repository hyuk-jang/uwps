const CalculateAverage = require('./CalculateAverage.js');
class Model extends CalculateAverage {
  constructor(controller) {
    super(controller.config.calculateOption);
    this.controller = controller;
    this.originalData = {};
    this.convertDataObj = {};
    // 평균치를 계산하고 저장할 객체
    this.averageObj = super.init();
  }

  get currOriginalData() {
    return this.originalData;
  }

  get currConvertDataObj() {
    return this.convertDataObj;
  }

  get calcAverageObj() {
    let resObj = {};
    for (let key in this.averageObj) {
      resObj[key] = this.averageObj[key].average;
    }
    return resObj;
  }

  init() {
    // 모델 데이터 초기화
    this.originalData = {
      NextRecord: '',
      Barometer: '',
      InsideTemperature: '',
      InsideHumidity: '',
      OutsideTemperature: '',
      WindSpeed: '',
      Min10AvgWindSpeed: '',
      WindDirection: '',
      ExtraTemperatures: '',
      SoilTemperatures: '',
      LeafTemperatures: '',
      OutsideHumidity: '',
      ExtraHumidties: '',
      RainRate: '',
      UV: '',
      SolarRadiation: '',
      StormRain: '',
      StartDateofcurrentStorm: '',
      DayRain: '',
      MonthRain: '',
      YearRain: '',
      DayET: '',
      MonthET: '',
      YearET: '',
      SoilMoistures: '',
      LeafWetnesses: '',
      InsideAlarms: '',
      RainAlarms: '',
      OutsideAlarms: '',
      'ExtraTemp/HumAlarms': '',
      'Soil&LeafAlarms': '',
      TransmitterBatteryStatus: '',
      ConsoleBatteryVoltage: '',
      TimeofSunrise: '',
      TimeofSunset: ''
    }

    // original 데이터 변환
    this.convertDataObj = {
      'rainfall': '',
      'temperature': '',
      'humidity': '',
      'windDirection': '',
      'windSpeed': '',
      'min10AvgWindSpeed': '',
      'solarRadiation': ''
    };

  }


  // 데이터 수신
  onVantageData(dataObj) {
    // BU.CLI('dataObj',dataObj)
    for (let key in dataObj) {
      this.originalData[key] = dataObj[key];

      if (key === 'OutsideTemperature') {
        this.convertDataObj.temperature = dataObj[key] > -20 && dataObj[key] < 50 ? dataObj[key] : dataObj.InsideTemperature;
      } else if (key === 'OutsideHumidity') {
        this.convertDataObj.humidity = dataObj[key] > 0 && dataObj[key] <= 100 ? dataObj[key] : dataObj.InsideHumidity;
      } else if (key === 'RainRate') {
        this.convertDataObj.rainfall = dataObj[key];
      } else if (key === 'WindDirection') {
        this.convertDataObj.windDirection = dataObj[key];
      } else if (key === 'WindSpeed') {
        this.convertDataObj.windSpeed = dataObj[key];
      } else if (key === 'Min10AvgWindSpeed') {
        this.convertDataObj.min10AvgWindSpeed = dataObj[key];
      } else if (key === 'SolarRadiation') {
        this.convertDataObj.solarRadiation = dataObj[key];
      }
    }

    // 부모에게 평균 치 계산 요청
    this.onDataObj(this.convertDataObj, this.averageObj, (hasOccurEvent, result) => {
      this.averageObj = result;
      // console.log('hasOccurEvent',hasOccurEvent)
      if(hasOccurEvent){
        // BU.CLIS(result, this.calcAverageObj)
        this.controller._onVantagePro2Data_M(this.calcAverageObj)
      }
    });
  }
}

module.exports = Model;