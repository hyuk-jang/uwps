
const bmjh = require('base-model-jh');

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

  getModulePaging({ pageNum }) {
    let listCount = 4;
    let limit = pageNum === undefined ?  `0, ${listCount}` : `${(pageNum - 1) * listCount}, ${pageNum * listCount}`;

    let sql = `SELECT *,
    CONCAT("CH",cs.channel," (",pt.target_name ,")")AS title,
    (SELECT target_name FROM connector WHERE connector_seq=cs.connector_seq) AS con_name
    FROM photovoltaic pt ,connector_structure cs
       WHERE pt.photovoltaic_seq=cs.photovoltaic_seq  ORDER BY connector_seq,cs.channel`
        // LIMIT ${limit}`;
    return this.db.single(sql, '', true);
  }


}

module.exports = Main;