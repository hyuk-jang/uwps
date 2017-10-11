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
    let returnValue = this.controller.getBaseInverterValue();
    let isTrue = _.random(0, 1);
    switch (cmd) {
      case 'operation':
        returnValue.isError = _.random(0, 1);
        returnValue.isRun = _.random(0, 1);
        returnValue.isError ? returnValue.errorList = [{
          msg: '태양전지 저전압 (변압기 type Only)',
          code: 'Solar Cell UV fault',
          number: 2,
          errorValue: 1
        }] : returnValue.errorList = [];
        break;
      case 'pv':
        _.each(this.controller.model.pv, (value, key) => {
          returnValue[key] = value;
        });
        break;
      case 'grid':
        _.each(this.controller.model.grid, (value, key) => {
          returnValue[key] = value;
        });
        break;
      case 'power':
        _.each(this.controller.model.power, (value, key) => {
          returnValue[key] = value;
        });
        break;
      case 'sysInfo':
        _.each(this.controller.model.sysInfo, (value, key) => {
          returnValue[key] = value;
        });
        break;
      case 'weather':
        _.each(this.controller.model.weather, (value, key) => {
          returnValue[key] = value;
        });
        break;
      default:
        break;
    }

    return returnValue;
  }

  // createServer(){
  //   return super.createServer();
  // }

}
module.exports = P_SocketServer;