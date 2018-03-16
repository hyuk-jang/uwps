// const inverterBaseFormat = require('../InverterController/Converter').baseFormat;
// const connectorBaseFormat = require('../ConnectorController/Converter').baseFormat;
module.exports = {
  binding: [{
    deviceType: 'weatherDevice',
    dataTableName: 'weather_device_data',
    troubleTableName: '',
    dateParam: 'writedate',
    addParamList: [],
    matchingList: [{
      baseKey: 'smInfrared',
      updateKey: 'sm_infrared',
      calculate: 1,
      toFixed: 1
    }, {
      baseKey: 'OutsideTemperature',
      updateKey: 'temp',
      calculate: 1,
      toFixed: 1
    }, {
      baseKey: 'OutsideHumidity',
      updateKey: 'reh',
      calculate: 1,
      toFixed: 0
    },{
      baseKey: 'WindDirection',
      updateKey: 'wd',
      calculate: 1,
      toFixed: 0
    },{
      baseKey: 'Min10AvgWindSpeed',
      updateKey: 'ws',
      calculate: 1,
      toFixed: 1
    },{
      baseKey: 'RainRate',
      updateKey: 'rain_h',
      calculate: 1,
      toFixed: 0
    },{
      baseKey: 'DayRain',
      updateKey: 'rain_d',
      calculate: 1,
      toFixed: 0
    },{
      baseKey: 'SolarRadiation',
      updateKey: 'solar',
      calculate: 1,
      toFixed: 0
    },{
      baseKey: 'UV',
      updateKey: 'uv',
      calculate: 1,
      toFixed: 0
    }]
  }]
};