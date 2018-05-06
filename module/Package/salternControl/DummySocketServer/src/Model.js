'use strict';
const _ = require('lodash');

const {BU} = require('base-util-jh');

const {
  operationController,
  deviceStatus
} = require('../../../../module/device-protocol-converter-jh');
const cmdStorage = operationController.saltern.xbee;
const deviceStat = deviceStatus.saltern;
require('./define');

const map = require('../../config/map');

class Model {
  constructor() {
    this.routerList = [];
    this.setter();
  }

  setter() {
    map.setInfo.connectInfoList.forEach(connectInfo => {
      connectInfo.deviceRouterList.forEach(routerInfo => {
        this.routerList.push({
          deviceId: routerInfo.deviceId,
          targetId: routerInfo.targetId,
          waterDoor: deviceStat.WATER_DOOR.STOP,
          waterLevel: deviceStat.WATER_LEVEL.ZERO,
          valve: deviceStat.VALVE.UNDEF,
          pump: deviceStat.PUMP.OFF,
        });
      });
    });
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  findRouter(xbeeApi_0x10) {

    let deviceId = xbeeApi_0x10.destination64;

    let router = _.find(this.routerList, {
      deviceId
    });

    return router;
  }


  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  onData(xbeeApi_0x10) {
    BU.CLI(xbeeApi_0x10);
    let router = this.findRouter(xbeeApi_0x10);
    BU.CLI(router);

    if (_.includes(router.targetId, 'R_GLS')) {
      this.controlWaterdoor(xbeeApi_0x10);
      return this.getWaterdoor(xbeeApi_0x10);
    } else if (_.includes(router.targetId, 'R_V')) {
      this.controlValve(xbeeApi_0x10);
      return this.getValve(xbeeApi_0x10);
    } else if (_.includes(router.targetId, 'R_P')) {
      this.controlPump(xbeeApi_0x10);
      return this.getPump(xbeeApi_0x10);
    }
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  getWaterdoor(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x31];
    switch (router.waterDoor) {
    case deviceStat.WATER_DOOR.STOP:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceStat.WATER_DOOR.OPEN:
      bufferHex = bufferHex.concat([0x30, 0x32]);
      break;
    case deviceStat.WATER_DOOR.CLOSING:
      bufferHex = bufferHex.concat([0x30, 0x33]);
      break;
    case deviceStat.WATER_DOOR.CLOSE:
      bufferHex = bufferHex.concat([0x30, 0x34]);
      break;
    case deviceStat.WATER_DOOR.OPENING:
      bufferHex = bufferHex.concat([0x30, 0x35]);
      break;
    }
    // Level: 2, Salinity: 4, Batter: 4
    bufferHex = bufferHex.concat([0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x30, 0x2e, 0x32]);
    return {
      'type': 144,
      'remote64': xbeeApi_0x10.destination64,
      'remote16': xbeeApi_0x10.destination16,
      'receiveOptions': 1,
      data: Buffer.from(bufferHex)
    };
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  getValve(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x32];
    switch (router.valve) {
    case deviceStat.VALVE.UNDEF:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceStat.VALVE.CLOSE:
      bufferHex = bufferHex.concat([0x30, 0x31]);
      break;
    case deviceStat.VALVE.OPEN:
      bufferHex = bufferHex.concat([0x30, 0x32]);
      break;
    case deviceStat.VALVE.CLOSING:
      bufferHex = bufferHex.concat([0x30, 0x34]);
      break;
    case deviceStat.VALVE.OPENING:
      bufferHex = bufferHex.concat([0x30, 0x35]);
      break;
    }
    // Level: 2
    bufferHex = bufferHex.concat([0x30, 0x30]);
    // Water Temperature: 6
    bufferHex = bufferHex.concat([0x30, 0x30, 0x31, 0x36, 0x2e, 0x32]);
    // Module Temperature: 6
    bufferHex = bufferHex.concat([0x30, 0x30, 0x32, 0x31, 0x2e, 0x32]);
    // Batter: 4
    bufferHex = bufferHex.concat([0x31, 0x30, 0x2e, 0x32]);
    return {
      'type': 144,
      'remote64': xbeeApi_0x10.destination64,
      'remote16': xbeeApi_0x10.destination16,
      'receiveOptions': 1,
      data: Buffer.from(bufferHex)
    };
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  getPump(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x32];
    switch (router.pump) {
    case deviceStat.PUMP.OFF:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceStat.PUMP.ON:
      bufferHex = bufferHex.concat([0x30, 0x31]);
      break;
    }
    // Batter: 4
    bufferHex = bufferHex.concat([0x31, 0x30, 0x2e, 0x32]);
    return {
      'type': 144,
      'remote64': xbeeApi_0x10.destination64,
      'remote16': xbeeApi_0x10.destination16,
      'receiveOptions': 1,
      data: Buffer.from(bufferHex)
    };
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  controlWaterdoor(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    const cmd = xbeeApi_0x10.data;
    if (cmd === cmdStorage.waterDoor.OPEN.cmd) {
      if (router.waterDoor !== deviceStat.WATER_DOOR.OPEN) {
        // setTimeout(() => {
        router.waterDoor = deviceStat.WATER_DOOR.OPENING;
        // }, 30);
        setTimeout(() => {
          router.waterDoor = deviceStat.WATER_DOOR.OPEN;
        }, _.random(3000, 5000));
      }
    } else if (cmd === cmdStorage.waterDoor.CLOSE.cmd) {
      if (router.waterDoor !== deviceStat.WATER_DOOR.CLOSE) {
        // setTimeout(() => {
        router.waterDoor = deviceStat.WATER_DOOR.CLOSING;
        // }, 30);
        setTimeout(() => {
          router.waterDoor = deviceStat.WATER_DOOR.CLOSE;
        }, _.random(3000, 5000));
      }
    }
  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  controlValve(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    const cmd = xbeeApi_0x10.data;
    if (cmd === cmdStorage.valve.OPEN.cmd) {
      if (router.valve !== deviceStat.VALVE.OPEN) {
        // setTimeout(() => {
        router.valve = deviceStat.VALVE.OPENING;
        // }, 30);
        setTimeout(() => {
          router.valve = deviceStat.VALVE.OPEN;
        }, _.random(3000, 5000));
      }
    } else if (cmd === cmdStorage.valve.CLOSE.cmd) {
      if (router.valve !== deviceStat.VALVE.CLOSE) {
        // setTimeout(() => {
        router.valve = deviceStat.VALVE.CLOSING;
        // }, 30);
        setTimeout(() => {
          router.valve = deviceStat.VALVE.CLOSE;
        }, _.random(3000, 5000));
      }
    }

  }

  /**
   * @param {xbeeApi_0x10} xbeeApi_0x10 
   */
  controlPump(xbeeApi_0x10) {
    let router = this.findRouter(xbeeApi_0x10);
    const cmd = xbeeApi_0x10.data;
    if (cmd === cmdStorage.pump.OPEN.cmd) {
      if (router.pump !== deviceStat.PUMP.OPEN) {
        // setTimeout(() => {
        router.pump = deviceStat.PUMP.OPENING;
        // }, 30);
        setTimeout(() => {
          router.pump = deviceStat.PUMP.OPEN;
        }, _.random(3000, 5000));
      }
    } else if (cmd === cmdStorage.pump.CLOSE.cmd) {
      if (router.pump !== deviceStat.PUMP.CLOSE) {
        // setTimeout(() => {
        router.pump = deviceStat.PUMP.CLOSING;
        // }, 30);
        setTimeout(() => {
          router.pump = deviceStat.PUMP.CLOSE;
        }, _.random(3000, 5000));
      }
    }

  }




}


module.exports = Model;