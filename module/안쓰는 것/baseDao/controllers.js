'use strict';

var db = require('./db');
var testModel = require('./model');

var testControllers = {
  // 모델에서 db.single() 함수를 사용한 예제입니다.
  // 쿼리를 실행하고 커넥션을 반환합니다.
  test1:
   function (req, res) {
    testModel.getTest('inverter').then(function (rows) {
      if (rows.length < 1) {
        throw new Error('No Result');
      }
      // ...
      return testModel.getTest('connector');
    }).then(function (rows) {
      console.log(rows)
      // res.json(rows[0]);
    }).catch(function (err) {
      console.log('err', err)
      // err.code 값이 있으면 MySQL 내부 오류입니다.
      res.status(err.code ? 500 : 400).json({ message: err.message });
    });
  }
  ,
  // 모델에서 conn.queryAsync() 함수를 사용한 예제입니다.
  // 트랙잭션 또는 하나의 커넥션에서 여러 쿼리를 실행할 때 사용합니다.
  test2: function (req, res) {
    db.trans(function (conn) { // db.query(function (conn) { ... });
      return testModel.setTest(conn, 'test1').then(function (result) {
        return testModel.setTest(conn, 'test2');
      }).then(function (result) {
        return testModel.setTest(conn, 'test3');
      });
    }).then(function () {
      // Query Success, Transaction COMMIT
    }).catch(function () {
      // Query Error, Transaction ROLLBACK
    });
  }
};
testControllers.test1();
// module.exports = testControllers;