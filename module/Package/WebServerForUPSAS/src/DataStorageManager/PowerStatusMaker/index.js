const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  require('dotenv').config();
  const config = require('./src/config');
  console.dir(config);

  const control = new Control(config);

  // control.init();

  control.mainStorageList[0] = {
    msFieldInfo: {
      main_seq: 1,
      name: '6kw',
    },
    msDataInfo: {},
  };

  control.requestCalcPowerStatus();

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}
