'use strict';

const _ = require('underscore');
const Commander = require('../device-commander/Commander');

const Mediator = require('../device-mediator/Mediator');


const Manager = require('../device-manager/Manager');


const AbstClientBuilder = require('./AbstClientBuilder');
 

require('../format/define');

class ClientBuilder extends AbstClientBuilder {
  constructor() {
    super();

  }


  /** @param {deviceClientFormat} config */
  addDeviceClient(config){

    let deviceCommander = this.setDeviceCommnader(config);
    let deviceManager = this.setDeviceManager(config);
    let mediator = this.setDeviceMediator();

    mediator.setColleague(deviceCommander, deviceManager);


    return deviceCommander;
  }
  /** @param {deviceClientFormat} config */
  setDeviceCommnader(config) {
    let deviceCommander = new Commander(config);

    return deviceCommander;
  }

  setDeviceMediator() {
    let deviceMediator = new Mediator();

    return deviceMediator; 
  }

  /** @param {deviceClientFormat} config */
  setDeviceManager(config) {
    let deviceManager = new Manager(config);

    return deviceManager;
  }


  getDeviceClient() {
    
  }

  
}

module.exports = ClientBuilder;