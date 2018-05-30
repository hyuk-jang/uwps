'use strict';

const Control = require('./src/Control.js');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const BU = require('base-util-jh').baseUtil;
  const config = require('./src/config');

  const control = new Control(config);


  const parentConfig = require('../../config/config');
  control.init(parentConfig.dbInfo);

  // control.init();

  
  

  process.on('uncaughtException', function (err) {
    // BU.debugConsole();
    BU.CLI(err);
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
  
  
  process.on('unhandledRejection', function (err) {
    // BU.debugConsole();
    BU.CLI(err);
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}