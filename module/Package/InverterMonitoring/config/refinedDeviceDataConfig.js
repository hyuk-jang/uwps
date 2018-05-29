
const Converter =  require('../../../module/device-protocol-converter-jh');
let keyInfo = Converter.BaseModel.Inverter.BASE_KEY;

/**
 * @typedef {Object} tableParamFormat
 * @property {string} fromKey
 * @property {string} toKey
 */

module.exports = [{
  deviceCategory: 'inverter',
  troubleTableInfo: {
    tableName: 'inverter_trouble_data',
    /** @type {Array.<tableParamFormat>} */
    addParamList: [{
      fromKey: 'inverter_seq',
      toKey: 'inverter_seq',
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
      primaryKey: 'inverter_trouble_data_seq',
      foreignKey: 'inverter_seq'
    }
  },
  dataTableInfo: {
    tableName: 'inverter_data',
    /** @type {Array.<tableParamFormat>} */
    addParamList: [{
      fromKey: 'inverter_seq',
      toKey: 'inverter_seq',
    }],
    insertDateKey: 'writedate',
    matchingList: [{
      fromKey: keyInfo.pvAmp,
      toKey: 'in_a',
      calculate: 10,
      toFixed: 0
    }, {
      fromKey: keyInfo.pvVol,
      toKey: 'in_v',
      calculate: 10,
      toFixed: 0
    }, {
      fromKey: keyInfo.pvKw,
      toKey: 'in_w',
      calculate: 10000,
      toFixed: 0
    },{
      fromKey: keyInfo.gridRAmp,
      toKey: 'out_a',
      calculate: 10,
      toFixed: 0
    },{
      fromKey: keyInfo.gridRsVol,
      toKey: 'out_v',
      calculate: 10,
      toFixed: 0
    },{
      fromKey: keyInfo.powerGridKw,
      toKey: 'out_w',
      calculate: 10000,
      toFixed: 0
    },{
      fromKey: keyInfo.gridLf,
      toKey: 'lf',
      calculate: 10,
      toFixed: 0
    },{
      fromKey: keyInfo.powerPf,
      toKey: 'p_f',
      calculate: `${keyInfo.powerGridKw} / ${keyInfo.pvKw} * 1000`,
      toFixed: 0
    },{
      fromKey: keyInfo.powerCpKwh,
      toKey: 'c_wh',
      calculate: 10000,
      toFixed: 0
    },
    ]
  },
  
}];