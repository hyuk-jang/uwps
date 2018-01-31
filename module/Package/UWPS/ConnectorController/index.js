const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  const _ = require('underscore');
  const BU = require('base-util-jh').baseUtil;
  const config = require('./src/config.js');

  global._ = _;
  global.BU = BU;

  config.current.deviceSavedInfo.target_category = 'dm_v2';
  config.current.deviceSavedInfo.connect_type = 'serial';
  config.current.deviceSavedInfo.port = 'COM4';
  config.current.deviceSavedInfo.baud_rate = 4800;
  config.current.deviceSavedInfo.dialing.data = [0x30, 0x30, 0x31];

  const control = new Control(config);
  control.init()
    .then(result => {
      return control.measureDevice();
    })
    .then(result => {
      BU.CLI(result);
    })
    .catch(error => {
      BU.CLI(error);
    });
}