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

  /**
   * return connector report
   * @param {Object} connector {connector_seq, ch_number}
   * @param {Date} startDate 
   * @param {Date} endDate 
   * @param {String} searchType day or month or tear
   */
  getConnectorHistory(connector = {connector_seq,ch_number}, searchRange = {startDate, endDate}, searchType) {
    let startDate = searchRange.startDate;
    let endDate = searchRange.endDate;
    searchType = searchType ? searchType : 'day';

    BU.CLIS(startDate, endDate)

    let dateFormat = '';
    let range = [];
    switch (searchType) {
      case 'day':
        dateFormat = '%H';
        range = _.range(24);
        break;
      case 'month':
        dateFormat = '%Y-%m-%d';
        range = _.range(32);
        break;
      case 'year':
        dateFormat = '%Y-%m';
        range = _.range(13);
        break;
      default:
        dateFormat = '%H';
        range = _.range(24);
        break;
    }

    let sql = `
      SELECT 
        connector_seq,
        writedate, 
        DATE_FORMAT(writedate,'%H:%i') AS hour_time,
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
    WHERE writedate>= "${startDate}" and writedate<"${endDate}"
      AND connector_seq = ${connector.connector_seq}
    GROUP BY DATE_FORMAT(writedate,"${dateFormat}"), connector_seq
    ORDER BY connector_seq, writedate
    `;

    // return this.db.single(sql, '', true)
    return this.db.single(sql)
      .then(result => {
        return {
          range,
          gridInfo: result
        }
      })
    ;
  }

  /**
   * 접속반, Relation, trend를 융합하여 chart data 를 뽑아냄
   * @param {Object} connectorInfo 
   * @param {Array} relationInfo 
   * @param {Array} connectorHistory 
   */
  getModlePowerTrend(connectorInfo = {ch_number, connector_seq}, relationInfo, connectorHistory ){
    let returnValue = {
      range: connectorHistory.range,
      series: []
    } 

    for (let cnt = 1; cnt <= connectorInfo.ch_number; cnt++) {
      let addObj = {};
      let moduleInfo = _.findWhere(relationInfo, {connector_seq:connectorInfo.connector_seq, channel:cnt});
      addObj.name = `CH_${cnt} ${moduleInfo.target_name}`;
      addObj.data = _.map(connectorHistory.gridInfo, gridInfo => gridInfo[`ch_${cnt}`] * gridInfo.vol)
        // _.pluck(connectorHistory.gridInfo, `ch_${cnt}`);
      returnValue.series.push(addObj);
    }

    // BU.CLI(returnValue)
    return returnValue;
  }

  /**
   * 검색 종류와 검색 기간에 따라 검색 시작 값과 종료 값 반환
   * @param {String} searchType day, month, year, range
   * @param {*} strStartDate '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @param {*} strEndDate '', undefined, 'YYYY', 'YYYY-MM', 'YYYY-MM-DD'
   * @return {Object} {startDate, endDate}
   */
  getSearchRange(searchType, strStartDate, strEndDate){
    // BU.CLIS(searchType, strStartDate, strEndDate)
    let startDate = strStartDate ? new Date(strStartDate) : new Date();
    let endDate =  strEndDate ? new Date(strStartDate) : new Date();

    let returnValue = {
      startDate: null,
      endDate: null,
      rangeStart: '',
      rangeEnd: '',
      start: '',
      end: '',
      
    }
   
    if(searchType === 'day'){
      startDate.setHours(0, 0, 0)
      endDate = (new Date(startDate)).addDays(1);
      returnValue.start = BU.convertDateToText(startDate, '', 2);
      returnValue.rangeEnd = BU.convertDateToText(startDate, '', 2);      
    } else if(searchType === 'month'){
      startDate.setDate(1)
      endDate = (new Date(startDate)).addMonths(1);
      returnValue.start = BU.convertDateToText(startDate, '', 1);
      returnValue.rangeEnd = BU.convertDateToText((new Date(endDate)).setDate(-1), '', 2);
    } else if(searchType === 'year'){
      startDate.setMonth(0, 1)
      endDate = (new Date(startDate)).addYear(1);
      returnValue.start = BU.convertDateToText(startDate, '', 0);
      returnValue.rangeEnd = BU.convertDateToText((new Date(endDate)).setMonth(-1), '', 2);
    } else {
      endDate = strEndDate ? new Date(strEndDate) : new Date();
      returnValue.start = BU.convertDateToText(startDate, '', 2);
      returnValue.end = BU.convertDateToText(endDate, '', 2);
      returnValue.rangeEnd = BU.convertDateToText(endDate, '', 2);
    }

    returnValue.startDate = BU.convertDateToText(startDate);
    returnValue.endDate = BU.convertDateToText(endDate);
    returnValue.rangeStart = BU.convertDateToText(startDate, '', 2);

    return returnValue;
  }

  getMeasureTime(gridReport, startDate, endDate, selectedType){
    // BU.CLI(gridReport);


  }



  getInverterHistory(inverter_seq_list, startDate, endDate) {
    startDate = startDate ? startDate : 'CURDATE()';
    endDate = endDate ? endDate : 'CURDATE() + 1';
    
    let sql = `
      SELECT 
      inverter_seq,
      writedate, 
      DATE_FORMAT(writedate,'%H:%i:%S') AS hour_time,
      ROUND(in_a / 10, 1) AS in_a,
      ROUND(in_v / 10, 1) AS in_v,
      ROUND(in_w / 10, 1) AS in_w,
      ROUND(out_a / 10, 1) AS out_a,
      ROUND(out_v / 10, 1) AS out_v,
      ROUND(out_w / 10, 1) AS out_w,
      ROUND(p_f / 10, 1) AS p_f,
      ROUND(d_wh / 10, 1) AS d_wh,
      ROUND(c_wh / 10, 1) AS c_wh
      FROM inverter_data
        WHERE writedate>= ${startDate} AND writedate<${endDate}
    `;
    if(Array.isArray(inverter_seq_list)){
      sql += ` AND inverter_seq IN (${inverter_seq_list})`;
    }
    sql += `
      GROUP BY DATE_FORMAT(writedate,'%Y-%m-%d %H'), inverter_seq
      ORDER BY inverter_seq, writedate
    `;

    return this.db.single(sql)
      .then(result => {
        return _.groupBy(result, rows => rows.inverter_seq);
      })
  }

}
module.exports = BiModule;