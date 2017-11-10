
const bmjh = require('base-model-jh');
const Promise = require('bluebird')

class Main extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  getDailyPower() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i:%S")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w`
      + ` from inverter_data `
      + ` where writedate>= CURDATE() and writedate<CURDATE() + 1`
      + ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
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


    let test = Promise.map(moduleInfoList, info => {
      let secondSql = `
      SELECT cd.${info.t_channel}, cd.writedate
        FROM connector_data cd 
          WHERE cd.connector_seq = ${info.connector_seq}
          AND cd.${info.t_channel} IS NOT NULL
          ORDER BY cd.connector_data_seq DESC
          LIMIT 1
    `;

      return this.db.single(secondSql);

    })
      .then(moduleDataList => {
        let flatModuleDataList = _.flatten(moduleDataList);
        BU.CLI(flatModuleDataList);
        moduleInfoList.forEach((moduleObj, index) => {

          _.each(moduleObj, value => {
            // moduleObj.amp = flatModuleDataList[index];
            // moduleObj[key] = value;
          })
        })
      })
    return moduleInfoList;
  })
      .done(finalResult => {
        BU.CLI(finalResult)
        return finalResult;
  })

  // BU.CLI('T_T', test)



  // this.db.single(secondSql)
  //   .then(moduleInfoList => {
  //     BU.CLI(moduleInfoList)
  //     return Promise.all(moduleInfoList, info => {
  //       secondSql = `
  //         SELECT cd.${info.t_channel}, cd.writedate
  //           FROM connector_data cd 
  //             WHERE cd.connector_seq = ${info.connector_seq}
  //             AND cd.${info.t_channel} IS NOT NULL
  //             ORDER BY cd.connector_data_seq DESC
  //             LIMIT 1
  //       `;
  //       this.db.single(secondSql);
  //     })

  //   })
  //   .then(moduleDataList => {
  //     BU.CLI(moduleDataList)
  //   })
  // return 'hi^^'

}



getModulePaging({ pageNum }) {
  // let listCount = 4;
  // let limit = pageNum === undefined ?  `0, ${i stCount}` : `${(pageNum - 1) * listCount}, ${pageNum * listCount }`;

  let sql = `SELECT *,    
      CAT("CH", cs.channel, " (", p t.target_name, ")")AS title,
      (SELECT target_name FROM connector WHERE connector_seq= cs.connector_seq) AS con_name
     photovoltaic pt ,connector_structure cs
       WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel`;
  // LIMIT ${lim it}`;
  return this.db.single(sql, '', true);



}
}
module.exports = Main;