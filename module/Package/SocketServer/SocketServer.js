const net = require('net');
const _ = require('underscore');

// const SmBuffer = require('./SmBuffer.js');
const SmBuffer = require('./SmBuffer.js');

class SocketServer {
  constructor(controller) {
    this.controller = controller;
  }


  _initSocket(socket) {
    socket.smBuffer = new SmBuffer(socket);

    let msg = BU.makeMessage({
      CMD: "CheckClient",
      CMD_Key: BU.GUID(),
      Map_Version: this.controller.config.mapInfo.mapFileName
    });
    socket.write(msg);
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
      this._initSocket(socket);

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
      BU.CLI('Push Server Is Running', this.controller.config.port);
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
      responseObj.CMD_Key = receiveObj.CMD_Key;
    } catch (ex) {
      BU.CLI(ex);
      return socket.write(responseObj)
    }

    // App의 사용자 인증에 대한 답변
    if (receiveObj.CMD === "CheckClientEnd") {
      let currClient = this.controller.getReserveClient(receiveObj.SessionID);
      // 일치하는 클라이언트가 없을 경우
      if (_.isEmpty(currClient)) {
        // 핫 스팟 모드 일 경우 강제 지정
        if (this.controller.config.isWifiHotSpotMode) {
          let clientInfo ={
            memberSeq: "",
            sessionId: receiveObj.SessionID,
            loginDate: new Date(),
            deviceKey: receiveObj.DeviceKey,
            socket: socket
          };
        } else {
          // BU.log("세션이 종료되었습니다.");
          responseObj.CMD = "SessionExpired";
          responseObj.IsError = 1;
          responseObj.Message = "세션이 종료되었습니다.";
        }

      } else {
        currClient.socket = socket;
        currClient.loginDate = new Date();
        currClient.deviceKey = receiveObj.DeviceKey;

        this.controller.newClient(currClient);
      }
    } else {
      // BU.CLI("알수없는 App 메시지", socketData);
      responseObj = {
        "CMD": "UndefinedCMD",
        "IsError": "1",
        "Message": "알수없는 명령입니다."
      };
    }
    // BU.CLI(responseObj)
    return socket.write(BU.makeMessage(responseObj) );

  }


}
module.exports = SocketServer;