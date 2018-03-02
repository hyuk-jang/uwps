
const SerialDeviceController = require('./src/device-controller/serial/SerialDeviceController');
const SerialDeviceControllerWithParser = require('./src/device-controller/serial/SerialDeviceControllerWithParser');
const SocketDeviceController = require('./src/device-controller/socket/SocketDeviceController');

module.exports = {
  SerialDeviceController,
  SerialDeviceControllerWithParser,
  SocketDeviceController
};

// if __main process
if (require !== undefined && require.main === module) {
  const _ = require('underscore');
  const BU = require('base-util-jh').baseUtil;
  global._ = _;
  global.BU = BU;
  
  console.log('__main__');
  const DeviceManager = require('./src/device-manager/DeviceManager');

  const deviceManager = new DeviceManager();
  deviceManager.createIterator();

  const config = {
    'target_id': 'testId',
    'target_name': '인버터 1',
    'connect_type': 'serial',
    'ip': 'localhost',
    'port': 'COM13',
    'baud_rate': 9600,
    parser: {
      type: 'readLineParser',
      option: '\r\n'
    }
    // parser: {
    //   type: 'delimiterParser',
    //   option: Buffer.from([0x04])
    // }
  };


  let deviceController = {};
  switch (config.connect_type) {
  case 'serial':
    deviceController = _.has(config, 'parser') ? new SerialDeviceControllerWithParser(config) : new SerialDeviceController(config);
    break;
  case 'socket':
    deviceController = new SocketDeviceController(config);
    break;
  default:
    break;
  }

  deviceManager.setDeviceController(deviceController);
  deviceManager.deviceController.attach(deviceManager);

  connectTest(deviceManager)
    .then(() => {
      BU.CLI('good');
    })
    .catch(err => {
      BU.CLI(err);
    });
      

}

async function connectTest(deviceManager) {
  await deviceManager.connect();
}