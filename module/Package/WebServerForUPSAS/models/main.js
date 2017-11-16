
const bmjh = require('base-model-jh');
const Promise = require('bluebird')

class Main extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  getDailyPower() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i:%S")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w
      from inverter_data 
      where writedate>= CURDATE() and writedate<CURDATE() + 1
      group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

      BU.CLI(sql)

    return this.db.single(sql, '', true)
      .then(result => {
        // BU.CLI(result)
        let chartList = [
          _.pluck(result, 'out_w'),
          _.pluck(result, 'writedate')
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
module.exports = Main;