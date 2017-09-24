'use strict';
const _ = require('underscore');

const BU = require('./baseUtil.js');
const db = require('./db');

// insert values 만들어줌
function makeInsertValues(arrValue) {
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

function makeMultiInsertValues(arrObj) {
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
function makeUpdateValues(objValue) {
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

module.exports = {
  /**
   * SELECT 일반 테이블
   * @param {String} tbName Table 명
   * @param {String} fieldName Table Field 명
   * @param {String} attribute fieldName 에 매칭되는 Attribute
   */
  getTable(tbName, fieldName, attribute){
    let sql = `SELECT * FROM ${tbName}`;
    if (fieldName !== '' && fieldName !== undefined) {
      sql += ` WHERE ${fieldName} = '${attribute}';`;
    }
    return db.single(sql);
  },
  /**
   * INSERT 일반 테이블
   * @param {String} tbName Table 명
   * @param {Object} insertObj Insert 할려고하는 Data Object
   */
  setTable(tbName, insertObj) {
    let sql = `INSERT INTO ${tbName} (${Object.keys(insertObj)}) VALUES ${makeInsertValues(Object.values(insertObj))}`;

    console.log('sql', sql)
    return db.single(sql);
  },
  /**
   * Multi INSERT 일반 테이블
   * @param {String} tbName Table 명
   * @param {Array} insertArrayObj Insert 할려고하는 Data Object List
   */
  setTables(tbName, insertArrayObj) {
    let sql = `INSERT INTO ${tbName} (${Object.keys(insertArrayObj[0])}) VALUES ${makeMultiInsertValues(insertArrayObj)}`;
    return db.single(sql);
  },

  /**
   * UPDATE 일반 테이블 
   * @param {String} tbName Table 명
   * @param {Number} seq Table Sequence
   * @param {Object} updateObj Update 할려고하는 Data Object
   */
  updateTable(tbName, seq, updateObj) {
    // BU.CLI('updateTable')
    let updateValue = makeUpdateValues(updateObj);
    let sql = `UPDATE ${tbName} SET ${updateValue} WHERE ${tbName}_seq = ${seq}`
    return db.single(sql);
  },




  getTest: function (table) {
    return db.single(`SELECT * FROM ${table}`);
  },
  setTest: function (conn, value) {
    return conn.queryAsync('INSERT INTO table SET ?', {
      test: value
    });
  }
};