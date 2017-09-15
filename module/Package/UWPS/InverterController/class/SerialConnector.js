const serialport = require('serialport');
const eventToPromise = require('event-to-promise');

class SerialConnector {
  constructor(deviceInfo = {
    port,
    baudRate,
    transportCode,
    identificationCode
  }) {

    this.serialClient = {};
    this.serialInfo = deviceInfo;
  }

  init() {

  }

  processData() {

  }

  async connect() {
    this.serialClient = new serialport(this.serialInfo.port, {
      baudrate: this.serialInfo.baudRate,
    });

    this.serialClient.on('data', (data) => {
      this.processData(data);
    })

    this.serialClient.on('close', err => {
      BU.CLI('시리얼 Close');
    });

    this.serialClient.on('error', err => {
      BU.CLI('Error Occur : ' + this.serialInfo.deviceName, err);
    });

    await eventToPromise.multi(this.serialClient, ['open'], ['error', 'close']);
    BU.CLI('Serial Connect Success ',this.serialInfo.deviceName)
    return this.serialClient;
  }
}
module.exports = SerialConnector;