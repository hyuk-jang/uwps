const Control = require('../src/Control');
const config = require('./config');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  const controller = new Control(config);

  controller.init();

  // const msg = Buffer.from([0x01, 0x04, 0x00, 0x00, 0x00, 0x01]);
  // const commandSet = this.generationAutoCommand(msg);
  // BU.CLI(msg);

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    console.trace(err);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    console.trace(err);
    console.log('Node NOT Exiting...');
  });
}
