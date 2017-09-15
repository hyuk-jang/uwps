'use strict';

var db = require('./db');

module.exports = {
  getTest: function (table) {
    return db.single(`SELECT * FROM ${table}`);
  },
  setTest: function (conn, value) {
    return conn.queryAsync('INSERT INTO table SET ?', {
      test: value
    });
  }
};