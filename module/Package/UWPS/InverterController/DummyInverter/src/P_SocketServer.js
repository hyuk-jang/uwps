const net = require('net');
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;
const bcjh = require('base-class-jh');

class P_SocketServer extends bcjh.socket.SocketServer {
  constructor(controller) {
    super(controller.config.port)
    this.controller = controller;

    this._eventHandler();
  }

  _eventHandler() {
    super.on('data', (err, bufferData, connectedClient) => {
      let receiveObj = {};
      let returnValue = {};
      let responseObj = {
        cmd: 'none',
        isError: 0,
        contents: ''
      };

      let dataObj = {};
      let cmd = '';
      try {
        let resolveBuffer = bcjh.classModule.resolveResponseMsgForTransfer(bufferData);
        // BU.CLI(resolveBuffer)
        cmd = resolveBuffer.toString();
      } catch (ex) {
        // BU.CLI(ex);
        returnValue.isError = '1';
        returnValue.contents = ex;
        return connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue))
      }
      // CMD에 따라
      if (cmd !== '') {
        returnValue.cmd = cmd;
        returnValue.contents = this.cmdProcessor(cmd);
      } else {
        // BU.CLI('알수없는 App 메시지', socketData);
        returnValue = {
          cmd: 'undefinedCMD',
          isError: '1',
          contents: '알수없는 명령입니다.'
        };
      }
      let result = connectedClient.write(bcjh.classModule.makeRequestMsgForTransfer(returnValue));
      // BU.CLI(result)
      return result;
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
        returnValue.errorList = returnValue.isError ? [{
          msg: '태양전지 저전압 (변압기 type Only)',
          code: 'Solar Cell UV fault',
          number: 2,
          errorValue: 1
        }] : [];
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
      case 'system':
        _.each(this.controller.model.sysInfo, (value, key) => {
          returnValue[key] = value;
        });
        break;
      // case 'operation':
      //   returnValue = this.controller.model.operationInfo;
      //   break;
      case 'weather':
        _.each(this.controller.model.weather, (value, key) => {
          returnValue[key] = value;
        });
        break;
      default:
        break;
    }

    // BU.CLI(returnValue)
    return returnValue;
  }

  // createServer(){
  //   return super.createServer();
  // }

}
module.exports = P_SocketServer;