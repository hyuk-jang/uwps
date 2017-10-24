const node_modbus = require('node-modbus')

const eventToPromise = require('event-to-promise');
class P_ModbusClient {
  constructor(controller) {
    this.controller = controller;
    this.config = controller.config.cntSavedInfo;

    this.connectionInfo = {};

    this.connectionType = '';

    this.client = {};

    this.searchRange = [this.config.addr_a, , this.config.addr_a + this.config.ch_number];

    this.init(this.config);
  }

  init(config) {
    if (config.target_category === 'modbus_tcp') {
      this.connectionType = 'tcp';
      this.connectionInfo = {
        'host': config.host ? config.host : 'localhost', /* IP or name of server host */
        'port': config.port ? config.port : 8888, /* well known Modbus port */
        'unitId': config.dialing ? config.dialing : 1,
        'timeout': 2000, /* 2 sec */
        'autoReconnect': true, /* reconnect on connection is lost */
        'reconnectTimeout': 15000, /* wait 15 sec if auto reconnect fails to often */
        'logLabel': 'ModbusClientTCP', /* label to identify in log files */
        'logLevel': 'debug', /* for less log use: info, warn or error */
        'logEnabled': false
      }
    } else {
      this.connectionType = 'serial';
      this.connectionInfo = {
        'portName': config.port ? config.port : '/dev/ttyS0', /* COM1 */
        'baudRate': config.baudRate ? config.baudRate : 9600, /* */
        'dataBits': 8, /* 5, 6, 7 */
        'stopBits': 1, /* 1.5, 2 */
        'parity': 'none', /* even, odd, mark, space */
        'connectionType': 'RTU', /* RTU or ASCII */
        'connectionDelay': 250, /* 250 msec - sometimes you need more on windows */
        'timeout': 2000, /* 2 sec */
        'autoReconnect': true, /* reconnect on connection is lost */
        'reconnectTimeout': 15000, /* wait 15 sec if auto reconnect fails to often */
        'logLabel': 'ModbusClientSerial', /* label to identify in log files */
        'logLevel': 'debug', /* for less log use: info, warn or error */
        'logEnabled': true
      };

      this.connectionInfo.connectionType = config.target_category === 'modbus_rtu' ? 'RTU' : 'ASCII'
    }
  }

  async measure() {
    if (this.connectionType === 'tcp') {
      this.client = node_modbus.client.tcp.complete(this.connectionInfo);
    } else {
      this.client = node_modbus.client.serial.complete(this.connectionInfo);
    }
    this.client.connect();
    this.client.on('connect', () => {
      this.controller.emit('connected')
      // BU.CLI('connect')
      this.client.readInputRegisters(this.searchRange[0], this.searchRange[1])
        .then(resp => {
          BU.CLI(resp.register);
          this.client.emit('receiveConnectorData', resp.register)
          return;
        }).catch(err => {
          this.client.emit('receiveErr', err)
        })
        .done(() => {
          this.client.close();
        })
    })

    this.client.on('error', err => {
      // BU.CLI(err)
      this.controller.emit('disconnected', err)
      return Error(err);
    })

    return await eventToPromise.multi(this.client, ['receiveConnectorData', ['receiveErr']]);
  }




}

module.exports = P_ModbusClient;
