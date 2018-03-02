const serialport = require('serialport');
const eventToPromise = require('event-to-promise');

const AbstractDeviceController = require('../AbstractDeviceController');

class SerialDeviceController extends AbstractDeviceController{
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {{port: string, baud_rate: number }} config {port, baud_rate}
   */
  constructor(config) {
    super();
    this.client = {};
    this.port = config.port;
    this.baud_rate = config.baud_rate;
  }

  async connect() {
    // BU.CLI('connect');
    this.client = new serialport(this.port, {
      baudRate: this.baud_rate,
    });

    this.client.on('data', bufferData => {
      this.notifyData(bufferData);
    });

    this.client.on('close', () => {
      this.client = {};
      this.notifyClose();
    });

    this.client.on('error', error => {
      this.notifyError(error);
    });

    await eventToPromise.multi(this.client, ['open'], ['error', 'close']);
    this.notifyConnect();
    return this.client;
  }
}
module.exports = SerialDeviceController;