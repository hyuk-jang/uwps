const net = require('net');
const eventToPromise = require('event-to-promise');

const AbstractDeviceController = require('../AbstractDeviceController');

/** Class Socket 접속 클라이언트 클래스 */
class SocketDeviceController extends AbstractDeviceController {
  /**
   * Socket Client 접속 설정 정보
   * @param {{port: number, ip: string|undefinded}} config Socket Port
   */
  constructor(config) {
    super();
    this.port = config.port;
    this.host = config.host || 'localhost';

    this.client = {};
  }

  async connect() {
    this.client = net.createConnection(this.port, this.host);

    this.client.on('data', bufferData => {
      this.notifyData(bufferData);
    });

    this.client.on('close', () => {
      this.client = {};
      this.notifyClose();
    });

    this.client.on('end', () => {
      console.log('Client disconnected');
      // this.client = {};
      // this._onClose('err');
    });

    this.client.on('error', error => {
      this.notifyError(error);
    });
    await eventToPromise.multi(this.client, ['connect', 'connection', 'open'], ['close, error']);
    return this.client;
  }
}

module.exports = SocketDeviceController;