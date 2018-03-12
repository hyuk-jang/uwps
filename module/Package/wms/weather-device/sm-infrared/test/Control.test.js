


const SmInfraredControl = require('../src/SmInfraredControl');


const config = require('../src/config');


const smInfraredControl = new SmInfraredControl(config);
smInfraredControl.setDeviceClient(smInfraredControl.config.current.deviceInfo);
// smInfraredControl.executeCommand();


// console.dir(smInfraredControl.getDefaultCreateDeviceConfig());




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