'use strict';
const _ = require('lodash');
const {BU} = require('base-util-jh');
const net = require('net');

const {BaseModel} = require('../../../module/device-protocol-converter-jh');

const Control = require('./Control'); 
const Model = require('./Model');

class SocketServer {
  /**
   * 
   * @param {Control} controller 
   */
  constructor(controller) {
    this.controller = controller;

    this.port = this.controller.config.socketServerInfo.port;

    this.model = this.controller.model;

    this.map = this.controller.map;
    
    this.baseConverter = BaseModel.default;

    /** @type {Array.<Socket>} */
    this.clientList = [];

    this.init();
    
  }

  /**
   * Socket Server 구동
   * @param {number} port 
   */
  init() {
    const server = net.createServer((socket) => {
      // socket.end('goodbye\n');
      console.log(`client is Connected ${this.port}`);

      this.clientList.push(socket);

      socket.on('data', data => {
        try {
          let bufferData = this.baseConverter.decodingDefaultRequestMsgForTransfer(data);

          /** @type {{cmdType: string, hasTrue: boolean, cmdId: string, cmdRank: number=}} */
          let jsonData = JSON.parse(bufferData.toString());



          this.processingCommand(jsonData);
        } catch (error) {
          BU.logFile(error);
        }
      });

      socket.on('close', () => {
        _.remove(this.clientList, client => _.isEqual(client, socket));
      });
    }).on('error', (err) => {
      // handle errors here
      console.error('@@@@', err, server.address());
      // throw err;
    });

    // grab an arbitrary unused port.
    server.listen(this.port, () => {
      console.log('opened server on', server.address());
    });

    server.on('close', () => {
      
      console.log('clonse');
    });

    server.on('error', (err) => {
      console.error(err);
    });
  }

  /**
   * 
   * @param {{commandStorage: Object, deviceStorage: Array.<{category: string, targetId: string, targetName: string, targetData: *}>}} salternDeviceDataStorage 
   */
  emitToClientList(salternDeviceDataStorage) {
    try {
      let encodingData = this.baseConverter.encodingDefaultRequestMsgForTransfer(JSON.stringify(salternDeviceDataStorage));
  
      this.clientList.forEach(client => {
        client.write(encodingData);
      });
    } catch (error) {
      BU.errorLog('salternDevice', 'emitToClientList', error);
    }
  }

  /**
   * 
   * @param {{cmdType: string, hasTrue: boolean, cmdId: string, cmdRank: number=}} jsonData 
   */
  processingCommand(jsonData) {
    BU.CLI(jsonData);
    if(jsonData.cmdType === 'AUTOMATIC'){
      let fountIt = _.find(this.map.controlList, {cmdName: jsonData.cmdId});
      if(jsonData.hasTrue){
        this.controller.excuteAutomaticControl(fountIt);
      } else {
        this.controller.cancelAutomaticControl(fountIt);
      }
    } else if (jsonData.cmdType === 'SINGLE') {
      let orderInfo = {
        modelId: jsonData.cmdId,
        hasTrue: jsonData.hasTrue,
        rank: jsonData.cmdRank
      };
      this.controller.excuteSingleControl(orderInfo);
    } else if (jsonData.cmdType === 'SCENARIO') {
      if(jsonData.cmdId === 'SCENARIO_1'){
        this.controller.scenarioMode_1();
      } 
    }
  }

}
module.exports = SocketServer;