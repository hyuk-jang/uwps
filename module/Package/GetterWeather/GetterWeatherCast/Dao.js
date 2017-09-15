var mysql = require('mysql');
// var setInfo = require("./config.js").dbInfo;
//var dbinfo = {
//    host: 'localhost',
//    user: 'nodeTester',
//    password: 'testPass',
//    database: 'nodeBlog'
//};


class Dao {
  constructor(dbInfo = {host, user, password, database}) {
    this.dbInfo = dbInfo;
  }

  doQuery(sql, callback) {
    let connection = mysql.createConnection(this.dbInfo);
    connection.connect(function (err, res) {
      if (err)
        return callback(err, null, 'query executed : ' + sql);
      else
        return;
    });
    connection.query(sql, function (err, res, field) {
      if (err)
        return callback(err, null, 'query executed : ' + sql);
      else if (res.length > 0)
        return callback(null, res, 'query executed : ' + sql);
      else
        return callback(null, res, 'query executed : ' + sql);
    });
    connection.end();
  }
}
module.exports = Dao;