const net = require('net');
const eventToPromise = require('event-to-promise');

const SmBuffer = require(process.cwd().concat('/class/SmBuffer'));

class SocketClient {
  constructor(controller) {
    this.controller = controller;

    this.socketClient = {};

    this.port = 0;
    this.host = 0;
  }


  async connect(port, host) {
    if (port === 0 || port == null) {
      throw Error('port가 안열림');
    }
    this.port = port;
    this.host = host ? host : 'localhost';

    this.socketClient = net.createConnection(port, host);
    this.socketClient.smBuffer = new SmBuffer(this.socketClient);
    this.socketClient.on('endBuffer', (err, data) => {
      if (err) {
        BU.logFile(err);
        return this.controller.emit('receiveSocketData', err)
      } else {
        return this.controller.emit('receiveSocketData', null, JSON.parse(data))
      }
    })

    this.socketClient.on('close', error => {
      this.socketClient = {};
      this.controller.emit('disconnectedInverter', this.port);
    })

    this.socketClient.on('data', data => {
      // BU.CLI('@@@@@@@@@@@@@@', data.toString());
      this.socketClient.smBuffer.addBuffer(data);
    });
    this.socketClient.on('end', () => {
      console.log('Client disconnected');
    });

    this.socketClient.on('error', error => {
      // BU.CLI('error')
      // this.socketClient = {};
      // this.controller.emit('disconnectedInverter');
    })
    await eventToPromise.multi(this.socketClient, ['connect', 'connection', 'open'], ['close, error'])
    return this.socketClient;
  }
}

module.exports = SocketClient;