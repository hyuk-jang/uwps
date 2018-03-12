const net = require('net');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');
/** Class Socket 접속 클라이언트 클래스 */
class SocketClient extends EventEmitter {
  /**
   * Socket Client 접속 설정 정보
   * @param {{port: number, ip: string|undefinded}} port Socket Port
   */
  constructor(config = {port, host}) {
    super();
    this.port = config.port;
    this.host = config.host || 'localhost';

    this.client = {};
  }

  _init(client) {
  }

  /**
   * Buffer 데이터 돌려줌
   * @param {Buffer} bufferData
   * @return {EventEmitter} Buffer
   */
  _onData(bufferData) {
    return this.emit('data', bufferData);
  }

  _onClose() {
    return this.emit('close');
  }

  _onError(err) {
    return this.emit('error', err);
  }


  async connect() {
    this.client = net.createConnection(this.port, this.host);
    this._init(this.client);

    this.client.on('data', bufferData => {
      this._onData(bufferData);
    });

    this.client.on('close', () => {
      this.client = {};
      this._onClose();
    })

    this.client.on('end', () => {
      console.log('Client disconnected');
      this.client = {};
      this._onClose('err');
    });

    this.client.on('error', error => {
      this._onError(error);
    })
    await eventToPromise.multi(this.client, ['connect', 'connection', 'open'], ['close, error'])
    return this.client;
  }
}

module.exports = SocketClient;