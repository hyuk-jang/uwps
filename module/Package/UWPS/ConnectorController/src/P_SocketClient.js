const net = require('net');
const _ = require('underscore');

const SmSocketClient = require('base-class-jh').SmSocketClient;

const BU = require('base-util-jh').baseUtil;


class P_SocketServer extends SmSocketClient {
  constructor(controller) {
    super(controller.config.ivtSavedInfo.port, controller.config.ivtSavedInfo.ip);
    this.controller = controller;

    // this.port = this.controller.ivtSavedInfo.port;
    // this.ip = this.controller.ivtSavedInfo.ip;

    this._eventHandler();
    
  }

  _eventHandler() {
    super.on('dataBySocketClient', (err, data) => {
      // BU.CLI(err, data)
      return this.controller.emit('receiveConnectorData',err, data)
    });

    super.on('disconnectedSocketClient', (err) => {
      // BU.CLI(err, data)
      return this.controller.emit('disconnectedConnector',err)
    })

  }



}
module.exports = P_SocketServer;