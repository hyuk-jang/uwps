const EventEmitter = require('events');
const _ = require('underscore');
const Model = require('./Model.js');

const P_SocketServer = require('./P_SocketServer');
const BU = require('base-util-jh').baseUtil;



class Control extends EventEmitter {
  constructor() {
    super();
    // 현재 Control 설정 변수
    this.config = {
      port: 39000,
      renewalCycle: 10, // sec  데이터 갱신 주기,
      connector_seq: 1, // inverter seq
      ch_number: 4
    }

    // Model
    this.model = new Model(this);

    // Process
    this.p_SocketServer = new P_SocketServer(this);
    // Child
  }

  // callback => Socket Server Port 를 돌려받음.
  async init() {
    // BU.CLI('init DummyInverter')
    try {
      let port = await this.p_SocketServer.createServer();
      this.model.socketServerPort = port;
      return port;
    } catch (error) {
      console.log('error', error)
      throw error;
    }
  }

  get socketServerPort() {
    return this.model.socketServerPort;
  }

  /**
   * Socket 처리 구간 Start
   */

  _eventHandler() {
    this.p_SocketServer.on('dataBySocketServer', (err, result) => {
      if (err) {

      }
    })
  }
}
module.exports = Control;