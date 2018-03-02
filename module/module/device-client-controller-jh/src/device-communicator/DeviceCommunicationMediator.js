'use strict';

const AbstractDeviceCommunicationMediator = require('./AbstractDeviceCommunicationMediator');

const AbstractDeviceManager = require('../device-manager/AbstractDeviceManager');
require('../device-commander');


class DeviceCommunicationMediator extends AbstractDeviceCommunicationMediator {
  constructor() {
    super();

    this.deviceManagerList = [];
    this.deviceCommanderList =  [];
  }

  requestAddCommand(){}
  getCurrentCommandStatus(){}

  spreadDeviceToObserver(){}

  updateDcConnect(){
    console.log('updateDcConnect');
  }
  updateDcClose(){
    console.log('updateDcClose');
  }
  updateDcError(error){
    console.log('updateDcError');
  }
}

module.exports = DeviceCommunicationMediator;