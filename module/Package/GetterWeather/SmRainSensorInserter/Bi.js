const _ = require('underscore');
const Dao = require('./Dao.js');

class Bi extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }

  /**
   * SELECT 일반 테이블
   * @param {String} tbName Table 명
   * @param {String} fieldName Table Field 명
   * @param {String} attribute fieldName 에 매칭되는 Attribute
   * @param {Function} callback 완료 시 수행 함수
   */

  // 
  getTable(tbName, fieldName, attribute, callback) {
    let sql = `select * from ${tbName}`;
    if (fieldName !== '') {
      sql += ` WHERE ${fieldName} = '${attribute}';`;
    }
    this.doQuery(sql, callback);
  }

  /**
   * UPDATE 일반 테이블 
   * @param {String} tbName Table 명
   * @param {Number} seq Table Sequence
   * @param {Object} updateObj Update 할려고하는 Data Object
   * @param {Function} callback 완료 시 수행 함수
   */
  updateTable(tbName, seq, updateObj, callback) {
    // BU.CLI('updateTable')
    let updateValue = this.makeUpdateValues(updateObj);
    let sql = `UPDATE ${tbName} SET ${updateValue} WHERE ${tbName}_seq = ${seq}`
    return this.doQuery(sql, callback);
  }

  /**
   * INSERT 일반 테이블
   * @param {String} tbName Table 명
   * @param {Object} insertObj Insert 할려고하는 Data Object
   * @param {Function} callback 완료 시 수행 함수
   */
  insertTable(tbName, insertObj, callback) {
    let values = this.makeInsertValues(_.values(insertObj));
    let sql = `INSERT INTO ${tbName} (${Object.keys(insertObj)}) VALUES ${values}`;
    return this.doQuery(sql, callback);
  }

  // INSERT 일반 테이블 명과 
  /**
   * Multi INSERT 일반 테이블
   * @param {String} tbName Table 명
   * @param {Object} insertArrayObj Insert 할려고하는 Data Object List
   * @param {Function} callback 완료 시 수행 함수
   */
  multiInsertTable(tbName, insertArrayObj, callback) {
    let multiValues = this.makeMultiInsertValues(insertArrayObj);
    try {
      let sql = `INSERT INTO ${tbName} (${Object.keys(insertArrayObj[0])}) VALUES ${multiValues}`;
      return this.doQuery(sql, callback);
    } catch (error) {
      return callback(error);
    }
  }

  // insert values 만들어줌
  makeInsertValues(arrValue) {
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
        returnValue += '""';
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

  makeMultiInsertValues(arrObj) {
    let returnValue = '';
    _.each(arrObj, (obj, index) => {
      returnValue += this.makeInsertValues(obj);
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
  makeUpdateValues(objValue) {
    let returnvalue = '';

    _.each(objValue, (value, key) => {
      if (returnvalue !== '') {
        returnvalue += ', ';
      }
      if (value == null) {
        returnvalue += `${key} = null`;
      } else if (value === undefined) {
        returnvalue += `${key} = '""'`;
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