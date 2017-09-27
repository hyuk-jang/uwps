const net = require('net');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

class SocketClient extends EventEmitter {
  constructor(port, host) {
    super();
    this.port = port;
    this.host = host;

    this.client = {};
  }

  _initSocket(client) {
  }

  _onData(data) {
    return this.emit('dataBySocketClient', null, data);
  }

  _onUsefulData(err, data) {
  }

  _onClose(err) {
    return this.emit('disconnectedSocketClient', err);
  }


  async connect(port, host) {
    // BU.CLI(port, host)
    // BU.CLI('@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    if (port === 0 || port == null) {
      throw Error('port가 안열림');
    }
    this.port = port;
    this.host = host ? host : 'localhost';

    this.client = net.createConnection(port, host);
    this._initSocket(this.client);

    this.client.on('data', data => {
      // BU.CLI('@@@@@@@@@@@@@@', data.toString());
      this.client = {};
      this._onData(data);
      // this.client.smBuffer.addBuffer(data);
    });

    this.client.on('close', error => {
      this.client = {};
      this._onClose(error);
      // this.controller.emit('disconnectedInverter', this.port);
    })

    this.client.on('end', () => {
      console.log('Client disconnected');
      this.client = {};
      this._onClose('err');
    });

    this.client.on('error', error => {
      this.client = {};
      this._onClose(error);
      // BU.CLI('error')
      // this.socketClient = {};
      // this.controller.emit('disconnectedInverter');
    })
    await eventToPromise.multi(this.client, ['connect', 'connection', 'open'], ['close, error'])
    return this.client;
  }
}

module.exports = SocketClient;