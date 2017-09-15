const Dao = require('./Dao.js');

class B_GcmSender extends Dao {
  constructor(dbInfo) {
    super(dbInfo);
  }
  getRegistrationList(callback) {
    let sql = "select * from gcm_device";

    this.doQuery(sql, callback);
  }
}
module.exports = B_GcmSender;
