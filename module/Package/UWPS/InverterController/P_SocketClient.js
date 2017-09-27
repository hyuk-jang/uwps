const net = require('net');
const eventToPromise = require('event-to-promise');
const _ = require('underscore');

const SmSocketClient = require('./class/SmSocketClient');

const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

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
      return this.controller.emit('receiveInverterData',err, data)
    });

    super.on('disconnectedSocketClient', (err) => {
      // BU.CLI(err, data)
      return this.controller.emit('disconnectedInverter',err)
    })

  }



}
module.exports = P_SocketServer;