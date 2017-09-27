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

  _onData(data, socket) {
    return this.emit('dataBySocketServer', null, data);
  }

  _onUsefulData(err, data, socket) {
  }

  _onClose(socket) {
  }

  async createServer() {
    // BU.CLI('CreateServer')
    let socketServer = net.createServer(socket => {
      // BU.CLI('New Inverter Client Connected');
      this._initSocket(socket);

      this.clientList.push(socket);

      socket.on('data', (data) => {
        // BU.CLI('data', data)
        this._onData(data, socket);
      });

      socket.on('close', (msg) => {
        this.clientList = this.clientList.filter((client, index) => {
          return client !== socket;
        })
        this._onClose(socket);

        socket.destroy();
      });

      socket.on('error', err => {
        // BU.CLI('Socket.js : 소켓에러가 발생했습니다.', err);
        socket.emit('close');
      });
    });

    socketServer.on('error', err => {
      BU.log('Socket Server Port Used ', this.port)
      this.port++;
      this.tryCount++;

      // 20번 포트를 증가시켜도 안되면 포기
      if (this.tryCount > 20) {
        throw Error('tryCountFull');
      }
      socketServer.listen(this.port);
    })

    socketServer.listen(this.port, () => {
      BU.log('Socket Server Is Running ', this.port);
    })

    let result = await eventToPromise.multi(socketServer, ['listening'], ['failed'])
    // BU.CLI('????',result)
    return this.port;
  }
}
module.exports = SocketServer;