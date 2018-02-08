'use strict';

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  process.env.NODE_ENV = 'production';

  const _ = require('underscore');
  const BU = require('base-util-jh').baseUtil;
  const config = require('./src/config.js');

  global._ = _;
  global.BU = BU;




  config.current.hasDev = false;
  config.current.deviceSavedInfo.target_category = 's_hex';
  config.current.deviceSavedInfo.connect_type = 'serial';
  config.current.deviceSavedInfo.port = 'COM5';
  config.current.deviceSavedInfo.baud_rate = 9600;
  config.current.deviceSavedInfo.dialing.data = [0x30, 0x31];


  let control = new Control(config);
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


  process.on('unhandledRejection', function (reason, p) {
    BU.debugConsole();
    console.trace('Possibly Unhandled Rejection at: Promise ', p, ' \nreason: ', reason);
    // application specific logging here
  });
  
}