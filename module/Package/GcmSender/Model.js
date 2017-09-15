const _ = require('underscore');
const B_GcmSender = require('./B_GcmSender.js');

class Model {
  constructor(controller) {
    this.controller = controller;

    this.lastSendRegistrationObj = {};
    this.lastSendRegistrationIdList = [];
    this.lastSendMsgObj = {};

    // Dao
    this.b_GcmSender = new B_GcmSender(this.controller.config.dbInfo);
  }

  get lastSendMsg() {
    // BU.CLI(this.weatherDeviceObj)
    return this.lastSendMsgObj;
  }

  get lastSendRegistration() {
    return this.lastSendRegistrationObj;
  }

  selectRegistrationList(callback) {
    this.b_GcmSender.getRegistrationList((err, result) => {
      if (err) {
        return callback(err);
      }
      this.lastSendRegistrationObj = result;
      // BU.CLI(this.lastSendRegistrationObj)

      let regiList = _.pluck(result, "registration_id")
      // BU.CLI(regiList)
      this.lastSendRegistrationIdList = regiList;
      return callback(null, regiList);
    });
  }
}

module.exports = Model;