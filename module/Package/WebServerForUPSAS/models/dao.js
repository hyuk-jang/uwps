const mysql = require('mysql');

exports.doQuery = function (sql, callback) {
  let connection = mysql.createConnection(global.initSetter.dbInfo);

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
exports.query = function (sql, callback) {
  let connection = mysql.createConnection({
    host    :'121.178.26.33',
    user : 'root',
    password : 'akdntm007!'
  });
  
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

