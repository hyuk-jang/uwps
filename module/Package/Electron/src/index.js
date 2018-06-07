
const BU = require('base-util-jh').baseUtil;

const config = require('../config/config');
const DasEssMonitoring = require('das-ess-monitoring');
// const DasEssMonitoring = require('../../../module/das-ess-monitoring');

module.exports = {
  runOperation: () => {
    // 인버터 계측 프로그램 구동
    let inverterMonitoring = new DasEssMonitoring();    
    inverterMonitoring.init(config.dbInfo)
      .then(() => {
        // inverterMonitoring.setDbConnectPort('COM15');
        inverterMonitoring.createDeviceController();
      })
      .catch(err => {
        BU.logFile(err);
      });
  }
};