const net = require('net');
const _ = require('underscore');

const SmBuffer = require('./SmBuffer.js');

class SocketServer {
  constructor(controller) {
    this.controller = controller;
  }


  initSocket(socket) {
    socket.smBuffer = new SmBuffer(socket);

    this.controller._addSocket(socket);
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

  CreateServer() {
    let socketServer = net.createServer((socket) => {
      BU.CLI('New Push Client Try Connect');
      this.initSocket(socket);

      // Socket
      socket.on("endBuffer", (err, resBufferData) => {
        if (err) {
          return BU.CLI(err);
        }
        this._onUsefulData(resBufferData, socket);
        // BU.CLI(resBufferData)
      });

      socket.on('data', (data) => {
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

    socketServer.listen(this.controller.config.port, () => {
      BU.CLI('Socket Server Is Running', this.controller.config.port);
    });
  }

  _handlingSocketData(socketData, socket) {
    var receiveObj = {};
    var responseObj = {
      CMD: "none",
      IsError: 0,
      Message: ""
    };

    try {
      receiveObj = JSON.parse(socketData);
      responseObj.CMD = receiveObj.CMD;
    } catch (ex) {
      BU.CLI(ex);
      return socket.write(responseObj)
    }

    // CMD에 따라
    if (receiveObj.CMD === "currIvtData") {
      responseObj.Message = this.controller.cmdProcessor(receiveObj.CMD);
    } else {
      // BU.CLI("알수없는 App 메시지", socketData);
      responseObj = {
        "CMD": "UndefinedCMD",
        "IsError": "1",
        "Message": "알수없는 명령입니다."
      };
    }
    return socket.write(BU.makeMessage(responseObj) );
    // BU.CLI(responseObj)
    

  }


}
module.exports = SocketServer;