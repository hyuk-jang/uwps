const _ = require('underscore');
const Bi = require('./Bi.js');
class P_Setter {
  constructor(controller) {
    this.controller = controller;

    this.Bi = new Bi(this.controller.config.dbInfo);
  }

  setInverterData(invertData, callback) {
    let ivtId = this.controller.config.dbmsManager.inverterId;

    this.Bi.getInfoTable('inverter', 'target_id', ivtId, (err, result) => {
      if(err){
        return callback(err);
      }

      if(!result){
        return callback('no Seq');
      }

      _.each(invertData, obj => {
        obj.inverter_seq = _.first(result).inverter_seq;
      })          

      this.Bi.insertTableList('inverter_data', invertData, (err, result) => {
        if(err){
          return callback(err);
        }
        BU.CLI('insertTableList 수행 완료' + ivtId)

        let ConnectorCh =  /\d/.exec(ivtId);
        return callback(null, 'ch_' + ConnectorCh, invertData);
      });
    })
  }
}

module.exports = P_Setter;