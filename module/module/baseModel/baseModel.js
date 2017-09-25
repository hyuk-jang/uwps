'use strict';
const _ = require('underscore');

const db = require('./db');

function MRF(value) {
  var str_value = value.toString();
  return str_value.split("'").join("''");
}

/**
 * insert values 만들어줌
 * @param {Object} values Object or Array 입력할 값
 */
function makeInsertValues(values) {
  let returnValue = '';
  let arrValue = [];
  if(typeof values !== 'object'){
    throw TypeError('object가 아님');
  }

  arrValue = Array.isArray(values) ? values : Object.values(values);
  returnValue = '(';

  arrValue.forEach((value, index) => {
    if (index !== 0) {
      returnValue += ', ';
    }
    if (value === null) {
      returnValue += null;
    } else if (value === undefined) {
      returnValue += '';
    } else if (typeof value === 'number') {
      returnValue += value;
    } else {
      returnValue += `'${MRF(value)}'`;
    }
  });

  returnValue += ')';

  return returnValue;
}

function makeMultiInsertValues(arrObj) {
  let returnValue = '';
  if(!Array.isArray(arrObj)){
    throw TypeError('Array가 아님');
  }
  arrObj.forEach((obj, index) => {
    returnValue += makeInsertValues(obj);
    if (index + 1 < arrObj.length) {
      returnValue += ', ';
    }
  })

  return returnValue;
}

/**
 * update 구문 만들어줌
 * @param {Object} objValue json
 */
function makeUpdateValues(objValue) {
  let returnValue = '';
  if(typeof objValue !== 'object' && Array.isArray(objValue)){
    throw TypeError('object가 아님');
  }

  for(key in objValue){
    if (returnValue !== '') {
      returnValue += ', ';
    }
    if (objValue[key] == null) {
      returnValue += `${key} = null`;
    } else if (objValue[key] === undefined) {
      returnValue += `${key} = ''`;
    } else if (typeof objValue[key] === 'number') {
      returnValue += `${key} = ${objValue[key]}`;
    } else {
      returnValue += `${key} = '${MRF(objValue[key])}'`;
    }
  }
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
   * @param {Object} whereObj Where 절
   * @param {Object} updateObj Update 할려고하는 Data Object
   */
  updateTable(tbName, whereObj = {key, value}, updateObj) {
    let sql = `UPDATE ${tbName} SET ${makeUpdateValues(updateObj)} WHERE ${key} = ${value}`;
    return db.single(sql);
  },

  MRF: MRF,
  makeInsertValues,
  makeMultiInsertValues,
  makeUpdateValues,


  getTest: function (table) {
    return db.single(`SELECT * FROM ${table}`);
  },
  setTest: (tbName, insertArrayObj) => {
    return db.single(`INSERT INTO ${tbName} SET ?`, insertArrayObj);
  }
};