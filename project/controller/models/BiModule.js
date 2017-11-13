
const bmjh = require('base-model-jh');
const Promise = require('bluebird')

class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }


  /**
   * inverter_seq에 따라서 현 인버터 데이터 반환.
   * @param {Array} inverter_seq inverter_seq or [inverter_seq] or undefined.
   */
  getCurrInverterData(inverter_seq) {
    let sql = `
      select t1.*,
      (SELECT iv.target_id FROM inverter iv WHERE iv.inverter_seq = t1.inverter_seq		) as target_id
      from inverter_data t1,
      (select *,max(writedate) as M from inverter_data group by inverter_seq) t2
      where t1.writedate=t2.M and t1.inverter_seq=t2.inverter_seq
      order by inverter_seq
    `;
    if(inverter_seq !== undefined || Array.isArray(inverter_seq)){
      sql += `AND t1.inverter_seq IN (${inverter_seq})`;
    }

    return this.db.single(sql);
  }

  getDailyPowerReport() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w`
      + ` from inverter_data `
      + ` where writedate>= CURDATE() and writedate<CURDATE() + 1`
      + ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
      .then(result => {
        // BU.CLI(result)
        let chartList = [
          _.pluck(result, 'writedate'),
          _.pluck(result, 'out_w'),

        ];
        return chartList;
      });
  }

  async getModuleInfo() {
    let sql = `
      SELECT pt.*, cs.connector_seq, cs.channel,
      CONCAT("ch_",cs.channel) AS t_channel,
      (SELECT target_name FROM connector WHERE connector_seq=cs.connector_seq) AS con_name
      FROM photovoltaic pt ,connector_structure cs
       WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel
    `;

    let moduleInfoList = await this.db.single(sql);

    return new Promise(resolve => {
      Promise.map(moduleInfoList, info => {
        let secondSql = `
      SELECT cd.connector_seq, CONCAT('${info.t_channel}') as ch, cd.v as vol, cd.${info.t_channel} as amp, cd.writedate
        FROM connector_data cd 
          WHERE cd.connector_seq = ${info.connector_seq}
          AND cd.${info.t_channel} IS NOT NULL
          ORDER BY cd.connector_data_seq DESC
          LIMIT 1
    `;

        return this.db.single(secondSql);
      })
        .then(measureModuleDataList => {
          let flatModuleDataList = _.flatten(measureModuleDataList);

          _.each(moduleInfoList, moduleInfo => {
            let moduleData = _.findWhere(flatModuleDataList, { connector_seq: moduleInfo.connector_seq, ch: moduleInfo.t_channel })

            moduleInfo.amp = moduleData.amp || null;
            moduleInfo.vol = moduleData.vol || null;
          })
          resolve(moduleInfoList);
        })
    })
  }

}
module.exports = BiModule;