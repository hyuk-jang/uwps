const Dao = require('./Dao.js');

class Bi extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }
  getTest(callback) {
    let sql = "select * from test";

    this.doQuery(sql, callback);
  }
}
module.exports = Bi;
