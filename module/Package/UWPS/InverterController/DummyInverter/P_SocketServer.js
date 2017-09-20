const net = require('net');
const eventToPromise = require('event-to-promise');
const _ = require('underscore');

const SmBuffer = require(process.cwd() + '/class/SmBuffer.js');

class P_SocketServer {
  constructor(controller) {
    this.controller = controller;

    this.port = this.controller.config.port;
    this.tryCount = 0;
  }


  initSocket(socket) {
    // BU.CLI('initSocket')
    socket.smBuffer = new SmBuffer(socket);

    this.controller._addSocket(socket);

    // socket.write(BU.makeMessage(this.controller.cmdProcessor('currIvtData')));
  }


  // onData
  _onData(data, socket) {
    socket.smBuffer.addBuffer(data);
  }

  _onUsefulData(data, socket) {
    this._handlingSocketData(data, socket)
  }

  _onClose(socket) {
    this.controller._destroySocket(socket);
  }

  async CreateServer() {
    // BU.CLI('CreateServer')
    let socketServer = net.createServer((socket) => {
      BU.CLI('New Inverter Client Connected');
      this.initSocket(socket);

      // Socket
      socket.on('endBuffer', (err, resBufferData) => {
        if (err) {
          return BU.CLI(err);
        }
        this._onUsefulData(resBufferData, socket);
        // BU.CLI(resBufferData)
      });

      socket.on('data', (data) => {
        // BU.CLI('data', data)
        this._onData(data, socket);
      });

      socket.on('close', (msg) => {
        this._onClose(socket);
        socket.destroy();
      });

      socket.on('error', err => {
        // BU.CLI('Socket.js : 소켓에러가 발생했습니다.', err);
        socket.emit('close');
      });
    });

    socketServer.on('error', err => {
      BU.CLI('Socket Server Port Used', this.port)
      this.port++;
      this.tryCount++;

      // 20번 포트를 증가시켜도 안되면 포기
      if (this.tryCount > 20) {
        throw Error('tryCountFull');
      }
      socketServer.listen(this.port);
    })

    socketServer.listen(this.port, () => {
      BU.log('Socket Server Is Running', this.port);
    })

    let result = await eventToPromise.multi(socketServer, ['listening'], ['failed'])
    // BU.CLI('????',result)
    return this.port;
  }

  _handlingSocketData(socketData, socket) {
    // BU.CLI('_handlingSocketData', socketData)
    var receiveObj = {};
    var responseObj = {
      cmd: 'none',
      isError: 0,
      contents: ''
    };

    try {
      receiveObj = JSON.parse(socketData);
      responseObj.cmd = receiveObj.cmd;
    } catch (ex) {
      BU.CLI(ex);
      return socket.write(responseObj)
    }
    // CMD에 따라
    if (receiveObj.cmd !== '') {
      // BU.CLI(responseObj)
      responseObj.contents = this.controller.cmdProcessor(receiveObj.cmd);
    } else {
      // BU.CLI('알수없는 App 메시지', socketData);
      responseObj = {
        'cmd': 'UndefinedCMD',
        'isError': '1',
        'contents': '알수없는 명령입니다.'
      };
    }
    // BU.CLI(responseObj)
    return socket.write(BU.makeMessage(responseObj));
  }


}
module.exports = P_SocketServer;