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
      toKey: 'temp_seq',
    }],
    changeColumnKeyInfo: {
      isErrorKey: 'is_error',
      codeKey: 'code',
      msgKey: 'msg',
      occurDateKey: 'occur_date',
      fixDateKey: 'fix_date',
    },
    insertDateKey: 'writedate',
    indexInfo: {
      primaryKey: 'weather_device_trouble_seq',
      foreignKey: 'temp_seq'
    }
  },
  dataTableInfo: {
    tableName: 'weather_device_data',
    /** @type {Array.<tableParamFormat>} */
    addParamList: [],
    insertDateKey: 'writedate',
    matchingList: [{
      fromKey: 'smInfrared',
      toKey: 'sm_infrared',
      calculate: 1,
      toFixed: 1
    }, {
      fromKey: 'OutsideTemperature',
      toKey: 'temp',
      calculate: 1,
      toFixed: 1
    }, {
      fromKey: 'OutsideHumidity',
      toKey: 'reh',
      calculate: 1,
      toFixed: 0
    },{
      fromKey: 'WindDirection',
      toKey: 'wd',
      calculate: 1,
      toFixed: 0
    },{
      fromKey: 'Min10AvgWindSpeed',
      toKey: 'ws',
      calculate: 1,
      toFixed: 1
    },{
      fromKey: 'RainRate',
      toKey: 'rain_h',
      calculate: 1,
      toFixed: 0
    },{
      fromKey: 'DayRain',
      toKey: 'rain_d',
      calculate: 1,
      toFixed: 0
    },{
      fromKey: 'SolarRadiation',
      toKey: 'solar',
      calculate: 1,
      toFixed: 0
    },{
      fromKey: 'UV',
      toKey: 'uv',
      calculate: 1,
      toFixed: 0
    }]
  },
  
}];