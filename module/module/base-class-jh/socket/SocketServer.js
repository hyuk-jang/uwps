const net = require('net');
const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');

class SocketServer extends EventEmitter {
  constructor(port) {
    super();
    this.port = port;
    this.tryCount = 0;

    this.clientList = [];
  }


  _initSocket(socket) {
  }

  _onData(bufferData, connectedClient) {
    return this.emit('data', null, bufferData, connectedClient);
  }

  _onUsefulData(err, data, connectedClient) {
  }

  _onClose(err, connectedClient) {
    return this.emit('close', err, connectedClient);
  }

  async createServer() {
    // BU.CLI('CreateServer')
    let socketServer = net.createServer(connectedClient => {
      // BU.CLI('New Inverter Client Connected');
      this._initSocket(connectedClient);

      this.clientList.push(connectedClient);

      connectedClient.on('data', (bufferData) => {
        // BU.CLI('bufferData', bufferData)
        this._onData(bufferData, connectedClient);
      });

      connectedClient.on('close', (err) => {
        this.clientList = this.clientList.filter((client, index) => {
          return client !== connectedClient;
        })
        this._onClose(err, connectedClient);

        connectedClient.destroy();
      });

      connectedClient.on('error', err => {
        // BU.CLI('Socket.js : 소켓에러가 발생했습니다.', err);
        connectedClient.emit('close');
      });
    });

    socketServer.on('error', err => {
      // BU.log('Socket Server Port Used ', this.port)
      this.port++;
      this.tryCount++;

      // 100번 포트를 증가시켜도 안되면 포기
      if (this.tryCount > 100) {
        throw Error('tryCountFull' + this.tryCount);
      }
      socketServer.listen(this.port);
    })

    socketServer.listen(this.port, () => {
      BU.log('Socket Server Listen --> ', this.port);
    })

    let result = await eventToPromise.multi(socketServer, ['listening'], ['failed'])
    return this.port;
  }
}
module.exports = SocketServer;