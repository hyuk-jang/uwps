const serialport = require('serialport');
const eventToPromise = require('event-to-promise');

const EventEmitter = require('events');

class SerialClient extends EventEmitter {
  constructor(deviceInfo = {
    port,
    baud_rate,
    target_name
  }) {
    super();
    this.serialClient = {};
    this.serialInfo = deviceInfo;
  }

  init() {

  }

  processData() {

  }

  async connect() {
    this.serialClient = new serialport(this.serialInfo.port, {
      baudrate: this.serialInfo.baud_rate,
    });

    this.serialClient.on('data', (data) => {
      this.processData(data);
    })

    this.serialClient.on('close', err => {
      BU.CLI('시리얼 Close');
    });

    this.serialClient.on('error', err => {
      BU.CLI('Error Occur : ' + this.serialInfo.target_name, err);
    });

    await eventToPromise.multi(this.serialClient, ['open'], ['error', 'close']);
    BU.CLI('Serial Connect Success ', this.serialInfo.target_name)
    return this.serialClient;
  }
}
module.exports = SerialClient;