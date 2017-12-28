const net = require('net');
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;


const bcjh = require('base-class-jh');
// const SmSocketServer = require('base-class-jh');

class P_SocketServer extends bcjh.socket.SocketServer {
  constructor(controller) {
    super(controller.config.port)
    this.controller = controller;

    this._eventHandler();
  }

  _eventHandler() {
    super.on('data', (err, bufferData, connectedClient) => {
      // BU.CLI(err, bufferData)
      let returnValue = {
        cmd: 'none',
        isError: 0,
        contents: ''
      };
      
      let dataObj = {};
      let cmd = '';
      try {
        let resolveBuffer = bcjh.classModule.resolveResponseMsgForTransfer(bufferData);
        cmd = resolveBuffer.toString();
      } catch (ex) {
        // BU.CLI(ex);
        returnValue.isError = '1';
        returnValue.contents = ex;
        return connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue))
      }
      // CMD에 따라
      if (cmd === 'pv') {
        let gridList = [];
        let ch_number = this.controller.config.ch_number;
        // ch 숫자에 맞춰서 TEST 데이터 생성
        for (let cnt = 1; cnt <= ch_number; cnt++) {
          gridList.push({
            amp: 15.3,
            vol: 223.3,
            ch: cnt
          })
        }
        returnValue.cmd = cmd;
        returnValue.contents = gridList;
      } else {
        returnValue = {
          cmd: 'undefinedCMD',
          isError: '1',
          contents: '알수없는 명령입니다.'
        };
      }

      let result = connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue));
      BU.CLI(result)
      return result
    })
  }
}
module.exports = P_SocketServer;