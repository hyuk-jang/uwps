const {
  expect
} = require('chai');
const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');


const Control = require('../src/Control.js');

global.BU = BU;

describe('dummy Connector Test', () => {
  let control;
  let port = 0;
  before(() => {
    control = new Control();
  });

  // Socket Server Listen 테스트
  it('server listen', done => {
    control.init()
      .then(serverPort => {
        BU.CLI('hasRun', serverPort);
        port = serverPort;
        done();
      })
      .catch(err => {
        BU.CLI(err);
      });
  });


  // Socket Server 로 접속한 후 가상 데이터 전송 후 응답 데이터의 유효성을 체크
  it('client connect', done => {
    const SocketClient = bcjh.socket.SocketClient;    
    const socketClient = new SocketClient(port);
    socketClient.connect()
      .then(client => {
        BU.CLI('New Connector Client Connected');
        // 보내는  msg는 'pv' 하나만
        let msg = bcjh.classModule.makeRequestMsgForTransfer('pv');
        BU.CLIS(msg, msg.toString());
        client.write(msg);
      })
      .catch(err => {
        done(err);
      });

    // 받는 데이터는 str JSON 형식으로
    socketClient.on('data', data => {
      BU.CLIS(data, data.toString(), bcjh.classModule.resolveResponseMsgForTransfer(data).toString());
      let result =  JSON.parse(bcjh.classModule.resolveResponseMsgForTransfer(data).toString());
      expect(result).to.be.a('object');
      // BU.CLIS(data, JSON.parse(data.toString()) );
      done();
    });
  });
});