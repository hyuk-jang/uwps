
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

  const {operationController} = require('device-protocol-converter-jh');
  // const {operationController} = require('../../module/device-protocol-converter-jh');
  const cmdStorage = operationController.saltern.xbee;

  let cmdList = control.converter.generationCommand(cmdStorage.waterDoor.STATUS);
  BU.CLI(cmdList);

  try {
    control.executeCommand(control.generationManualCommand({cmdList}));
  } catch (error) {
    
  }
  
  // setTimeout(() => {
  //   let cmd_1 = control.generationManualCommand(defaultCommandFormat);
  //   control.executeCommand(cmd_1);
  // }, 1000);

  
  // BU.CLI(cmdList);

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