
const bmjh = require('base-model-jh');

class Main extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  getDailyPower(date) {
    date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i:%S")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w`
      + ` from inverter_data `
      + ` where writedate>= CURDATE() and writedate<CURDATE() + 1`
      + ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
      .then(result => {
        BU.CLI(result)
        let chartList = [];
        let out_w = [];
        let date = [];

        for (var i = 0; i < result.length; i++) {
          date.push(result[i].writedate);
          out_w.push(result[i].out_w);
        }
        chartList.push(date);
        chartList.push(out_w);

        return chartList;
      });
  }

  getModulePaging(req) {
    let sql = `select concat("ch",cs.photovoltaic_seq," ","(",pt.target_name ,")")as title,(select target_name from connector where connector_seq=cs.connector_seq) as con_name
              from photovoltaic pt ,connector_structure cs 
              where pt.photovoltaic_seq=cs.photovoltaic_seq and connector_seq = 1 order by connector_seq,cs.photovoltaic_seq limit ${req.body.pageNum ? req.body.pageNum : 0},4`
    return this.db.single(sql);
  }


}

module.exports = Main;