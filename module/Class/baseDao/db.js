'use strict';

var mysql = require('mysql');
var Promise = require('bluebird');
var using = Promise.using;
var pool;

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);

let config = {
  connectionLimit:10,
  host: '121.178.26.59',
  user: 'root',
  password: 'akdntm007!',
  database: 'salt'
}

pool = mysql.createPool(config);

function getConnection() {
  return pool.getConnectionAsync().disposer(function (connection) {
    return connection.release();
  });
}

function getTransaction() {
  return pool.getConnectionAsync().then(function (connection) {
    return connection.beginTransactionAsync().then(function () {
      return connection;
    });
  }).disposer(function (connection, promise) {
    var result = promise.isFulfilled() ? connection.commitAsync() : connection.rollbackAsync();
    return result.finally(function () {
      connection.release();
    });
  });
}

module.exports = {
  // 간편 쿼리
  single: (sql, values) => {
    return using(getConnection(), connection => {
      return connection.queryAsync({
        sql: sql,
        values: values
        // nestTables: true,
        // typeCast: false,
        // timeout: 10000
      });
    });
  },
  // 연달아 쿼리
  query: function (callback) {
    return using(getConnection(), function (connection) {
      return callback(connection);
    });
  },
  // 트랜잭션
  trans: function (callback) {
    return using(getTransaction(), function (connection) {
      return callback(connection);
    });
  }
};