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
    this.client = {};
    this.serialInfo = deviceInfo;
  }

  init() {

  }

  processData(data) {

  }

  async connect() {
    this.client = new serialport(this.serialInfo.port, {
      baudrate: this.serialInfo.baud_rate,
    });

    this.client.on('data', (data) => {
      this.processData(data);
    })

    this.client.on('close', err => {
      BU.CLI('시리얼 Close');
    });

    this.client.on('error', err => {
      BU.CLI('Error Occur : ' + this.serialInfo.target_name, err);
    });

    await eventToPromise.multi(this.client, ['open'], ['error', 'close']);
    BU.CLI('Serial Connect Success ', this.serialInfo.target_name)
    return this.client;
  }
}
module.exports = SerialClient;