'use strict';

const AbstCommander = require('../device-commander/AbstCommander');
const AbstManager = require('../device-manager/AbstManager');
require('../format/define');

/** @abstract */
class AbstBuilder {
  constructor() {
  }


  /**
   * Create 'Commander', 'Manager'
   * @param {deviceClientFormat} config 
   * @return {AbstCommander}
   */
  addDeviceClient(config){

  }


  /**
   * Create 'Multi Commander', 'Manager'
   * @param {deviceClientFormat} config 
   * @param {string} idList 
   * @return {Array.<AbstCommander>}
   */
  addDeviceClientGroup(config, idList){
  
  }

  // /**
  //  * Create 'Commander'
  //  * @param {deviceClientFormat} config 
  //  * @return {AbstCommander}
  //  */
  // addCommander(){

  // }

  // /**
  //  * Create 'Manager'
  //  * @param {deviceClientFormat} config 
  //  * @return {AbstManager}
  //  */
  // addManager(){

  // }
}

module.exports = AbstBuilder;