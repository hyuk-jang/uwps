var mysql = require('mysql');
var setInfo = require('../../config').setInfo;

//var dbinfo = {
//    host: 'localhost',
//    user: 'nodeTester',
//    password: 'testPass',
//    database: 'nodeBlog'
//};

exports.doQuery = function (sql, callback) {
    var connection = mysql.createConnection(global.initSetter.dbInfo);
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

