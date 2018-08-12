const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const config = require('./src/config');

  const control = new Control(config);

  control.init();

  // control.converter.setProtocolConverter(control.config.deviceInfo);
  // control.setDeviceClient(control.config.deviceInfo);
}
