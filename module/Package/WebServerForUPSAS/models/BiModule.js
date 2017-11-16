const bmjh = require('base-model-jh');
const Promise = require('bluebird')

class BiModule extends bmjh.BM {
  constructor(dbInfo) {
    super(dbInfo);

  }

  getDailyPowerReport() {
    // date = date ? date : new Date();

    let sql = `select DATE_FORMAT(writedate,"%H:%i")as writedate,round(sum(out_w)/count(writedate)/10,1) as out_w` +
      ` from inverter_data ` +
      ` where writedate>= CURDATE() and writedate<CURDATE() + 1` +
      ` group by DATE_FORMAT(writedate,'%Y-%m-%d %H')`;

    return this.db.single(sql)
      .then(result => {
        // BU.CLI(result)
        let dateList = _.pluck(result, 'writedate');
        let whList = _.pluck(result, 'out_w');
        let chartList = [
          dateList,
          whList,
        ];

        return {
          chartList,
          dailyPowerRange: {
            start: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + '00:00:00',
            end: BU.convertDateToText(new Date(), '', 2, 0) + ' ' + _.last(dateList) + ':00',
          }
        }
      });
  }


  getConnectorHistory(connector = {
    connector_seq,
    ch_number
  }) {
    let sql = `select writedate, DATE_FORMAT(writedate,'%H:%i:%S') AS writedate,
      ROUND(v / 10, 1) AS vol
    `;
    for (let i = 1; i <= connector.ch_number; i++) {
      sql += ` 
        ${i === 1 ? ',' : ''}
        ROUND(ch_${i}/10,1) AS ch_${i}
        ${i === connector.ch_number ? '' : ','}
      `;
    }
    sql += `
    FROM connector_data
    WHERE writedate>= CURDATE() and writedate<CURDATE() + 1 AND connector_seq = ${connector.connector_seq}
    GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), connector_seq
    ORDER BY connector_seq, writedate
    `;

    return this.db.single(sql)
      .then(result => {
        let returnValue = {};
        returnValue.chartDataList = [];
        returnValue.rangeData = [];
        for (let cnt = 1; cnt <= connector.ch_number; cnt++) {
          returnValue.chartDataList.push(_.pluck(result, `ch_${cnt}`));
        }
        returnValue.rangeData = _.pluck(result, `writedate`);

        return returnValue;
      })
  }

}
module.exports = BiModule;