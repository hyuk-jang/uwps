const net = require('net');
const _ = require('underscore');

const bcjh = require('base-class-jh');

const BU = require('base-util-jh').baseUtil;


class P_SocketServer extends bcjh.socket.SocketClient {
  constructor(controller) {
    super(controller.config.cntSavedInfo.port, controller.config.cntSavedInfo.ip);
    this.controller = controller;

    // this.port = this.controller.cntSavedInfo.port;
    // this.ip = this.controller.cntSavedInfo.ip;

    this._eventHandler();
    
  }

  _eventHandler() {
    super.on('data', data => {
      BU.CLI(data)
      return this.controller.emit('data', null, data)
    });

    super.on('close', (err) => {
      // BU.CLI(err, data)
      return this.controller.emit('disconnected',err)
    })

  }



}
module.exports = P_SocketServer;