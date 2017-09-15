const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;


let control = new Control(config);
control.init();


control.on('endBuffer', (err, res) => {
  BU.CLI(res);
});

control.on('errorBuffer', res => {
  BU.CLI(res);
});



// Test Driver (SmBuffer 검증)
var SendObj = {};
SendObj["CMD"] = "CheckClientEnd";
SendObj["IsError"] = 0;
SendObj.SessionID = 'hi';
SendObj["Message"] = "Hellor World";
SendObj["Contents"] = {};

// 통합서버에서 알려주는 사용자 예약 테스트
var newClient = {
  memberSeq: 3,
  sessionId: 'hi',
  loginDate: new Date(),
  deviceKey: '',
  socket: null
}

// 동일 예약자가 중첩 될 경우 테스트
control.reserveClient(newClient);
control.reserveClient(newClient);




// Socket Client 접속 테스트
let makeMsg = BU.makeMessage(SendObj);

const SocketClient = require("./SocketClient.js");
let socketClient = new SocketClient(config.current.push_port);
socketClient.connectSocket(() => {
  socketClient.writeData(new Buffer(makeMsg));

  // 연속된 데이터 Parsing 테스트
  // let firstMsg = makeMsg.substr(0, 15);
  // let secondMsg = makeMsg.substr(15);

  // socketClient.writeData(new Buffer(firstMsg))
  // setTimeout(function () {
  //   BU.log('@@@@@@@@@@@@@@@')
  //   socketClient.writeData(new Buffer(secondMsg))
  // }, 1000);
});

// 예약 및 접속자 현황리스트
setTimeout(function() {
  // BU.CLI(control.model.accessClientList);
  // BU.CLI(control.model.reserveClientList)
  
  // 사용자 전체에게 Push 테스트
  control.sendMsgConnClients('good')
}, 1100);

// TODO 세션 유지 테스트 필요






// BU.log(makeMsg)