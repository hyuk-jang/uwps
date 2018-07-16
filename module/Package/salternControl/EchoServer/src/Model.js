'use strict';
const _ = require('lodash');

const {BU} = require('base-util-jh');

const {BaseModel} = require('../../../../module/device-protocol-converter-jh');
require('./define');

const baseModel = new BaseModel.Saltern({mainCategory: 'Saltern', subCategory: 'xbee'});
const deviceModel = baseModel.device;


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
          waterDoor: deviceModel.WATER_DOOR.STATUS.STOP,
          waterLevel: deviceModel.WATER_LEVEL.STATUS.ZERO,
          valve: deviceModel.VALVE.STATUS.UNDEF,
          pump: deviceModel.PUMP.STATUS.OFF,
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

    if (_.includes(router.targetId, 'R_G_')) {
      this.controlWaterdoor(xbeeApi_0x10);
      return this.getWaterdoor(xbeeApi_0x10);
    } else if (_.includes(router.targetId, 'R_V_')) {
      this.controlValve(xbeeApi_0x10);
      return this.getValve(xbeeApi_0x10);
    } else if(_.includes(router.targetId, 'R_GV_')){
      this.controlValve(xbeeApi_0x10);
      return this.getGateValve(xbeeApi_0x10);
    } else if (_.includes(router.targetId, 'R_P_')) {
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
    case deviceModel.WATER_DOOR.STATUS.STOP:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceModel.WATER_DOOR.STATUS.OPEN:
      bufferHex = bufferHex.concat([0x30, 0x32]);
      break;
    case deviceModel.WATER_DOOR.STATUS.CLOSING:
      bufferHex = bufferHex.concat([0x30, 0x33]);
      break;
    case deviceModel.WATER_DOOR.STATUS.CLOSE:
      bufferHex = bufferHex.concat([0x30, 0x34]);
      break;
    case deviceModel.WATER_DOOR.STATUS.OPENING:
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
    BU.CLI(xbeeApi_0x10);
    let router = this.findRouter(xbeeApi_0x10);
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x32];
    switch (router.valve) {
    case deviceModel.VALVE.STATUS.UNDEF:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceModel.VALVE.STATUS.CLOSE:
      bufferHex = bufferHex.concat([0x30, 0x31]);
      break;
    case deviceModel.VALVE.STATUS.OPEN:
      bufferHex = bufferHex.concat([0x30, 0x32]);
      break;
    case deviceModel.VALVE.STATUS.OPENING:
      bufferHex = bufferHex.concat([0x30, 0x34]);
      break;
    case deviceModel.VALVE.STATUS.CLOSING:
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
  getGateValve(xbeeApi_0x10) {
    BU.CLI(xbeeApi_0x10);
    let router = this.findRouter(xbeeApi_0x10);
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x32];
    switch (router.valve) {
    case deviceModel.VALVE.STATUS.UNDEF:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceModel.VALVE.STATUS.CLOSE:
      bufferHex = bufferHex.concat([0x30, 0x31]);
      break;
    case deviceModel.VALVE.STATUS.OPEN:
      bufferHex = bufferHex.concat([0x30, 0x32]);
      break;
    case deviceModel.VALVE.STATUS.OPENING:
      bufferHex = bufferHex.concat([0x30, 0x34]);
      break;
    case deviceModel.VALVE.STATUS.CLOSING:
      bufferHex = bufferHex.concat([0x30, 0x35]);
      break;
    }

    let a = 137;
    let strA = a.toString();
    for (let index = 0; index < strA.length; index++) {
      const element = strA.charCodeAt(index);
      console.log(element);
    }

    // Level: 3 (138 데이터])
    let wl = _.random(80, 190);
    BU.CLI(_.subtract(200, wl));
    _.forEach(wl.toString(), (char, index) => {
      BU.CLI(char, index);
      bufferHex.push(char.charCodeAt(index));
    });
    BU.CLI(bufferHex);
    // bufferHex = bufferHex.concat([0x31, 0x33, 0x38]);
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
    let bufferHex = [0x23, 0x30, 0x30, 0x30, 0x31, 0x30, 0x30, 0x30, 0x33];
    switch (router.pump) {
    case deviceModel.PUMP.STATUS.OFF:
      bufferHex = bufferHex.concat([0x30, 0x30]);
      break;
    case deviceModel.PUMP.STATUS.ON:
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
    if (cmd === deviceModel.WATER_DOOR.COMMAND.OPEN.cmd) {
      if (router.waterDoor !== deviceModel.WATER_DOOR.STATUS.OPEN) {
        // setTimeout(() => {
        router.waterDoor = deviceModel.WATER_DOOR.STATUS.OPENING;
        // }, 30);
        setTimeout(() => {
          router.waterDoor = deviceModel.WATER_DOOR.STATUS.OPEN;
        }, _.random(3000, 5000));
      }
    } else if (cmd === deviceModel.WATER_DOOR.COMMAND.CLOSE.cmd) {
      if (router.waterDoor !== deviceModel.WATER_DOOR.STATUS.CLOSE) {
        // setTimeout(() => {
        router.waterDoor = deviceModel.WATER_DOOR.STATUS.CLOSING;
        // }, 30);
        setTimeout(() => {
          router.waterDoor = deviceModel.WATER_DOOR.STATUS.CLOSE;
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
    if (cmd === deviceModel.VALVE.COMMAND.OPEN.cmd) {
      if (router.valve !== deviceModel.VALVE.STATUS.OPEN) {
        // setTimeout(() => {
        router.valve = deviceModel.VALVE.STATUS.OPENING;
        // }, 30);
        setTimeout(() => {
          router.valve = deviceModel.VALVE.STATUS.OPEN;
        }, _.random(3000, 5000));
      }
    } else if (cmd === deviceModel.VALVE.COMMAND.CLOSE.cmd) {
      if (router.valve !== deviceModel.VALVE.STATUS.CLOSE) {
        // setTimeout(() => {
        router.valve = deviceModel.VALVE.STATUS.CLOSING;
        // }, 30);
        setTimeout(() => {
          router.valve = deviceModel.VALVE.STATUS.CLOSE;
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
    if (cmd === deviceModel.PUMP.COMMAND.ON.cmd) {
      if (router.pump !== deviceModel.PUMP.STATUS.ON) {
        // setTimeout(() => {
        router.pump = deviceModel.PUMP.STATUS.OFF;
        // }, 30);
        setTimeout(() => {
          router.pump = deviceModel.PUMP.STATUS.ON;
        }, _.random(3000, 5000));
      }
    } else if (cmd === deviceModel.PUMP.COMMAND.OFF.cmd) {
      if (router.pump !== deviceModel.PUMP.STATUS.OFF) {
        // setTimeout(() => {
        router.pump = deviceModel.PUMP.STATUS.ON;
        // }, 30);
        setTimeout(() => {
          router.pump = deviceModel.PUMP.STATUS.OFF;
        }, _.random(3000, 5000));
      }
    }

  }




}


module.exports = Model;