// const inverterBaseFormat = require('../InverterController/Converter').baseFormat;
// const connectorBaseFormat = require('../ConnectorController/Converter').baseFormat;
module.exports = {
  binding: [{
    deviceType: 'inverter',
    dataTableName: 'inverter_data',
    troubleTableName: 'inverter_trouble_data',
    dateParam: 'writedate',
    addParamList: [{
      baseKey: 'inverter_seq',
      updateKey: 'inverter_seq',
    }],
    matchingList: [{
      baseKey: 'amp',
      updateKey: 'in_a',
      calculate: 10,
      toFixed: 0
    }, {
      baseKey: 'vol',
      updateKey: 'in_v',
      calculate: 10,
      toFixed: 0
    }, {
      baseKey: 'pvKw',
      updateKey: 'in_w',
      calculate: 10000,
      toFixed: 0
    },{
      baseKey: 'rAmp',
      updateKey: 'out_a',
      calculate: 10,
      toFixed: 0
    },{
      baseKey: 'rsVol',
      updateKey: 'out_v',
      calculate: 10,
      toFixed: 0
    },{
      baseKey: 'gridKw',
      updateKey: 'out_w',
      calculate: 10000,
      toFixed: 0
    },{
      baseKey: 'pf',
      updateKey: 'p_f',
      calculate: 10,
      toFixed: 0
    },{
      baseKey: 'dailyKwh',
      updateKey: 'd_wh',
      calculate: 10000,
      toFixed: 0
    },{
      baseKey: 'cpKwh',
      updateKey: 'c_wh',
      calculate: 10000,
      toFixed: 0
    }]
  },{
    deviceType: 'connector',
    dataTableName: 'module_data',
    troubleTableName: 'connector_trouble_data',
    dateParam: 'writedate',
    addParamList: [],
    matchingList: [{
      baseKey: 'photovoltaic_seq',
      updateKey: 'photovoltaic_seq',
      calculate: null,
      toFixed: 0
    },{
      baseKey: 'amp',
      updateKey: 'amp',
      calculate: 10,
      toFixed: 0
    }, {
      baseKey: 'vol',
      updateKey: 'vol',
      calculate: 10,
      toFixed: 0
    }]
  }]
};