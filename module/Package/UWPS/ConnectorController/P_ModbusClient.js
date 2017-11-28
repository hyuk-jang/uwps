const node_modbus = require('node-modbus')
const eventToPromise = require('event-to-promise');
const Promise = require('bluebird')
const ModbusRTU = require('modbus-serial');

class P_ModbusClient {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config.cntSavedInfo;

    this.connectionInfo = {};
    this.connectionType = '';

    this.searchRange = [this.config.addr_a, this.config.addr_a + this.config.ch_number];

    this.client = new ModbusRTU();

    // this.init(this.config);
  }


  async init(config) {
    if (config.target_category === 'modbus_tcp') {
      this.connectionType = 'tcp';
      // open connection to a tcp line
      let host = config.ip ? config.ip : 'localhost';
      await this.client.connectTCP(host, {
        port: config.port
      });
    } else {
      this.connectionType = 'serial';
      this.connectionInfo.connectionType = config.target_category === 'modbus_rtu' ? 'RTU' : 'ASCII'
      // open connection to a serial port
      await this.client.connectRTU(config.port, {
        baudrate: config.baudRate ? config.baudRate : 9600
      });
    }

    let id = config.dialing.type === 'Buffer' ? config.dialing.data[0] : 0;
    this.client.setID(id);
    this.client.setTimeout(1000);
    return this.client;
  }

  async measure() {
    let data = {};
    data = await this.client.readHoldingRegisters(0, this.controller.model.maxAddrNum || 10);
    if (this.connectionType === 'tcp') {
      return data.data;
    } else {
      let int32 = data.buffer.readUInt32BE();
      console.log(int32);
      return int32;
    }
  }
}

module.exports = P_ModbusClient;