const net = require('net');
const _ = require('underscore');

const bcjh = require('base-class-jh');

class P_SocketClient extends bcjh.socket.SocketClient {
  constructor(controller) {
    super(controller.config.deviceSavedInfo.port, controller.config.deviceSavedInfo.ip);
    this.controller = controller;
    this._eventHandler();
  }

  _eventHandler() {
    super.on('data', data => {
      return this.controller.emit('data', null, data)
    });

    super.on('close', (err) => {
      return this.controller.emit('disconnected',err)
    })
  }
}
module.exports = P_SocketClient;