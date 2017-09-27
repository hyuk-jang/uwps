const net = require('net');
const eventToPromise = require('event-to-promise');
const _ = require('underscore');

const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

const SmSocketServer = require('./class/SmSocketServer');

class P_SocketServer extends SmSocketServer {
  constructor(controller) {
    super(controller.config.port)
    this.controller = controller;

    this.port = this.controller.config.port;

    this._eventHandler();
    
  }

  _eventHandler() {
    super.on('dataBySocketServer', (err, socketData, socket) => {
      let receiveObj = {};
      let responseObj = {
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
        responseObj.contents = this.cmdProcessor(receiveObj.cmd);
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
    })
  }

  cmdProcessor(cmd) {
    // BU.CLI('cmdProcessor', cmd)
    let returnValue = '';
    switch (cmd) {
      case 'fault':
        // BU.CLI('cmdProcessor :' + cmd, this.currIvtDataForDbms)
        returnValue = {
          msg: '태양전지 저전압 (변압기 type Only)',
          code: 'Solar Cell UV fault',
          number: 2,
          errorValue: 1
        }
        break;
      case 'pv':
        returnValue = this.controller.model.pv;
        break;
      case 'grid':
        returnValue = this.controller.model.grid;
        break;
      case 'power':
        returnValue = this.controller.model.power;
        break;
      case 'sysInfo':
        // BU.CLI('cmdProcessor :' + cmd, this.currIvtDataForDbms)
        returnValue = this.controller.model.sysInfo;
        break;
      case 'weather':
        // BU.CLI('cmdProcessor :' + cmd, this.currIvtDataForDbms)
        returnValue = {};
        break;
      default:
        break;
    }

    return returnValue;
  }

  createServer(){
    return super.createServer();
  }

}
module.exports = P_SocketServer;