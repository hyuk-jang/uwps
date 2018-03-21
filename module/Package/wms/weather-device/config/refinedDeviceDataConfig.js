// const inverterBaseFormat = require('../InverterController/Converter').baseFormat;
// const connectorBaseFormat = require('../ConnectorController/Converter').baseFormat;

/**
 * @typedef {Object} tableParamFormat
 * @property {string} fromKey
 * @property {string} toKey
 */

module.exports = [{
  deviceCategory: 'weatherDevice',
  troubleTableInfo: {
    tableName: '',
    /** @type {Array.<tableParamFormat>} */
    addParamList: [{
      fromKey: 'addTemp',
      toKey: 'changeTemp',
    }],
    insertDateKey: 'writedate',
    updateKey: ''
  },
  dataTableInfo: {
    tableName: 'weather_device_data',
    /** @type {Array.<tableParamFormat>} */
    addParamList: [],
    insertDateKey: 'writedate',
  },
  dataTableName: 'weather_device_data',
  // dataTableId: '',
  // troubleTableName: '',
  // troubleTableId: '',
  // dateParam: 'writedate',
  // addParamList: [{
  //   baseKey: 'addTemp',
  //   updateKey: 'changeTemp',
  // }],
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
}];