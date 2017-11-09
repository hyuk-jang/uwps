const _ = require('underscore');
const Dao = require('./Dao.js');

class Bi extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }
  
  /**
   * 
   * @param {String} table 테이블 명
   * @param {Number} seq 시퀀스
   * @param {Fn} callback 
   */

  // 일반 테이블 SELECT
  getInfoTable(table, column, value, callback) {
    let sql = `select * from ${table}`;
    if (column !== '') {
      sql += ` WHERE ${column} = '${value}';`;
    }
    this.doQuery(sql, callback);
  }

  // UPDATE 일반 테이블 
  updateTable(tableName, seq, updateObj, callback) {
    // BU.CLI('updateTable')
    let updateValue = this.mrfUpdateValues(updateObj);
    let sql = `UPDATE ${tableName} SET ${updateValue} WHERE ${tableName}_seq = ${seq}`
    return this.doQuery(sql, callback);
  }

  // INSERT 일반 테이블 명과 
  insertTable(tableName, insertObj, callback) {
    let values = this.mrfInsertValues(_.values(insertObj));
    let sql = `INSERT INTO ${tableName} (${Object.keys(insertObj)}) VALUES ${values}`;
    return this.doQuery(sql, callback);
  }

  // INSERT 일반 테이블 명과 
  insertTableList(tableName, arrObj, callback) {
    let values = this.makeMultiInsertValue(arrObj);
    let sql = `INSERT INTO ${tableName} (${Object.keys(arrObj[0])}) VALUES ${values}`;

    BU.CLI('insertTableList 수행' + tableName)
    // callback(null, sql);
    return this.doQuery(sql, callback);
  }

  // insert values 만들어줌
  mrfInsertValues(arrValue) {
    // BU.CLI(arrValue)
    let returnValue = '(';

    let count = 0;
    _.each(arrValue, (value) => {
      if (count !== 0) {
        returnValue += ', ';
      }
      if (value === null) {
        returnValue += null;
      } else if (value === undefined) {
        returnValue += '';
      } else if (typeof value === 'number') {
        returnValue += value;
      } else {
        returnValue += `'${BU.MRF(value)}'`;
      }
      count++;
    })
    returnValue += ')';

    return returnValue;
  }

  makeMultiInsertValue(arrObj) {
    let returnValue = '';
    _.each(arrObj, (obj, index) => {
      returnValue += this.mrfInsertValues(obj);
      if (index + 1 < arrObj.length) {
        returnValue += ', ';
      }
    });
    return returnValue;
  }

  /**
   * update 구문 만들어줌
   * @param {Object} objValue json
   */
  mrfUpdateValues(objValue) {
    let returnvalue = '';

    _.each(objValue, (value, key) => {
      if (returnvalue !== '') {
        returnvalue += ', ';
      }
      if (value == null) {
        returnvalue += `${key} = null`;
      } else if (value === undefined) {
        returnvalue += `${key} = ''`;
      } else if (typeof value === 'number') {
        returnvalue += `${key} = ${value}`;
      } else {
        returnvalue += `${key} = '${BU.MRF(value)}'`;
      }
    })

    return returnvalue;
  }

}
module.exports = Bi;