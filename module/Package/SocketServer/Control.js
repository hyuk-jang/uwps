const EventEmitter = require('events');
const _ = require('underscore');

const Model = require('./Model.js');
const SocketServer = require('./SocketServer.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      port: 0
    };
    Object.assign(this.config, config.current);

    // Procss
    this.model = new Model(this);
    this.socketServer = new SocketServer(this);

    this.on('sendAllClient', sendObj => {
      // BU.CLI(sendObj)
      this.sendMsgConnClients(sendObj);
    })
  }

  init() {
    this.socketServer.CreateServer();
  }

  // FIXME 기존 CMD 소켓으로 인증받기전에 app이 접속하여 명령 요청.
  // App 개발자가 퇴사하였으므로 이부분은 차후 수정.
  get clients() {
    return this.model.connClients;
  }


  // 새로운 사용자 로그인됨.
  newClient(clientInfo) {
    // BU.CLI('newClient')
    this.model.onNewClient(clientInfo);
  }

  // 통합 서버에서 곧 사용자가 로그인 할거라고 알려줌.
  reserveClient(clientInfo) {
    // BU.CLI('reserveClient')
    this.model.onReserveClient(clientInfo);
  }

  // 예약된 사용자 중 Session ID 를 기준으로 찾아줌
  getReserveClient(sessionId) {
    return this.model.findReserveClient(sessionId);
  }

  // socket 접속 종료 시 접속중인 대상 리스트에서 삭제
  _destroySocket(socket) {
    this.model.destroySocket(socket);
  }

  // 접속중인 Socket Client 에게 Push Msg 발송
  sendMsgConnClients(msg) {
    // BU.CLI(msg)
    // BU.CLI(this.model.connClients)
    let sendMsg = BU.makeMessage(msg);
    this.model.connClients.forEach(client => {
      // BU.CLI(sendMsg)
      if(!_.isEmpty(client.socket)){
        client.socket.write(sendMsg);
      }
      
    })
  }


}

module.exports = Control;