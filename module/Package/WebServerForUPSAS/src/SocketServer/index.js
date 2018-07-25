

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  require('dotenv').config();
  console.log('@@@@@@@', process.env.DB_UPSAS_HOST);
  const config = require('./src/config');
  console.dir(config);
  const control = new Control(config);

  // control.init();

  // control.makeStatusPowerData();




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