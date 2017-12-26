const EventEmitter = require('events');
const _ = require('underscore');
const Model = require('./Model.js');
const P_GenerateData = require('./P_GenerateData.js');

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

  getBaseInverterValue() {
    return {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
      
    }
  }

  generateDummyData() {
    let res = this.p_GenerateData.dataMaker(new Date());
    BU.CLI(res)
    this.model.onData(res.pv, res.ivt);
  }

  generatePvData(scale) {
    let resPv = this.p_GenerateData.generatePvData(this.model.pv, scale);
    this.model.onPvData(resPv.amp, resPv.vol);

    let resIvt = this.p_GenerateData.generateInverterData(this.model.pv);
    this.model.onIvtData(resIvt.amp, resIvt.vol);

    // BU.CLI(this.model.currIvtData)
    return this.model.pv;
  }


  /**
   * Socket 처리 구간 Start
   */

  _eventHandler() {
    this.p_SocketServer.on('dataBySocketServer', (err, result) => {
      if (err) {

      }
      this.p_SocketServer.cmdProcessor(result)
    })
  }

  _addSocket(socket) {

  }

  _destroySocket(socket) {

  }

}
module.exports = Control;