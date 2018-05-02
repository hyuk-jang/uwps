
const Control = require('./src/Control');


module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const {BU} = require('base-util-jh');

  global.BU = BU;

  const config = require('./src/config');


  const control = new Control(config);

  control.init();

  const {controlCommand} = require('../../module/device-protocol-converter-jh');
  const cmdStorage = controlCommand.saltern.xbee;

  let cmdList = control.converter.generationCommand(cmdStorage.waterDoor.CLOSE);
  let defaultCommandFormat = control.getDefaultCommandConfig();
  defaultCommandFormat.cmdList = cmdList;
  
  setTimeout(() => {
    let cmd_1 = control.generationManualCommand(defaultCommandFormat);
    control.executeCommand(cmd_1);
  }, 1000);

  
  BU.CLI(cmdList);

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