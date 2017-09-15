var mysql = require('mysql');

let dbOption = {
  host:'localhost',
  port:3306,
  user:'root',
  password:'akdntm007!',
  database: 'saltpond_controller'
}

exports.doQuery = function (sql, callback) {
    var connection = mysql.createConnection(dbOption);
    
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