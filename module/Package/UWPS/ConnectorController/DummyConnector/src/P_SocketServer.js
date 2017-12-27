const net = require('net');
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;


const SmSocketServer = require('base-class-jh').SmSocketServer;

class P_SocketServer extends SmSocketServer {
  constructor(controller) {
    super(controller.config.port)
    this.controller = controller;

    this._eventHandler();
  }

  _eventHandler() {
    super.on('dataBySocketServer', (err, socketData, socket) => {
      let receiveObj = {};
      let returnValue = {};
      let responseObj = {
        cmd: 'none',
        isError: 0,
        contents: ''
      };

      try {
        receiveObj = JSON.parse(socketData);
        responseObj.cmd = receiveObj.cmd;
      } catch (ex) {
        // BU.CLI(ex);
        return socket.write(BU.makeMessage(responseObj))
      }
      // CMD에 따라
      if (receiveObj.cmd !== '') {
        // BU.CLI(responseObj)

        let ch_number = this.controller.config.ch_number;
        returnValue = [];
        // ch 숫자에 맞춰서 TEST 데이터 생성
        for (let cnt = 1; cnt <= ch_number; cnt++) {
          returnValue.push({
            amp: 15.3,
            vol: 223.3,
            ch: cnt
          })
        }
      } else {
        returnValue = {
          'cmd': 'UndefinedCMD',
          'isError': '1',
          'contents': '알수없는 명령입니다.'
        };
      }
      return socket.write(BU.makeMessage(returnValue))
    })
  }
}
module.exports = P_SocketServer;