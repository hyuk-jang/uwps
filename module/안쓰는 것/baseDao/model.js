'use strict';

var db = require('./db');

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
      returnValue += value;
    }
    count++;
  })
  returnValue += ')';

  return returnValue;
}

module.exports = {
  insertTable: (tbName, insertObj) => {
    let values = makeInsertValues(Object.values(insertObj));
    let sql = `INSERT INTO ${tbName} (${Object.keys(insertObj)}) VALUES ${values}`;
    return db.single(sql);
  },
  getTable: (tbName, fieldName, attribute) => {
    let sql = `select * from ${tbName}`;
    if (fieldName !== '' && fieldName !== undefined) {
      sql += ` WHERE ${fieldName} = '${attribute}';`;
    }
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