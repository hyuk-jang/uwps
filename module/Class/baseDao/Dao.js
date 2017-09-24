'use strict';

const mysql = require('mysql');
const Promise = require('bluebird');
const using = Promise.using;


class Model {
  constructor(dbInfo = {host, user, password, database, connectionLimit: 10}) {
    this.dbInfo = dbInfo;

    this.pool = mysql.createPool(this.dbInfo)
  }

  single(sql, values) {
    return using(this._getConnection(), connection => {
      console.log('sql',sql)
      return connection.queryAsync({
        sql: sql,
        values: values
        // nestTables: true,
        // typeCast: false,
        // timeout: 10000
      });
    });
  }
  // 연달아 쿼리
  query(callback) {
    return using(this._getConnection(), connection => {
      return callback(connection);
    });
  }

  // 트랜잭션
  trans(callback) {
    return using(this._getTransaction(), connection => {
      return callback(connection);
    });
  }

  _getConnection() {
    return this.pool.getConnectionAsync().disposer(connection => {
      return connection.release();
    });
  }
  
  _getTransaction() {
    return this.pool.getConnectionAsync().then(connection => {
      return connection.beginTransactionAsync().then(() => {
        return connection;
      });
    }).disposer((connection, promise) => {
      var result = promise.isFulfilled() ? connection.commitAsync() : connection.rollbackAsync();
      return result.finally(() => {
        connection.release();
      });
    });
  }

}
module.exports = Model;


