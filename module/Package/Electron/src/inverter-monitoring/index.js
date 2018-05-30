

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');


  const _ = require('lodash');
  const {BU} = require('base-util-jh');

  const config = require('./src/config');
  const parentConfig = require('../../config/config');


  const control = new Control(config);

  control.init(parentConfig.dbInfo);

  setTimeout(() => {
    control.measureDate = new Date();
    control.measureRegularInverter();
  }, 2000);

  // setInterval(() => {
  //   control.measureDate = new Date();
  //   control.measureRegularInverter();
  // }, 1000 * 60);




  process.on('uncaughtException', function (err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
  
  
  process.on('unhandledRejection', function (err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}