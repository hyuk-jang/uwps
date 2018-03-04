'use strict';

const _ = require('underscore');

const AbstCommander = require('./AbstCommander');

// require('../format/define');

const AbstMediator = require('../device-mediator/AbstMediator');

const instanceList = [];

/** 
 * @class 
 * @extends AbstCommander
 */
class Commander extends AbstCommander {
  /** @param {deviceClientFormat} config */
  constructor(config) {
    super();

    let foundInstance = _.findWhere(instanceList, {id: config.target_id});
    if(_.isEmpty(foundInstance)){
      this.id = config.target_id;
      instanceList.push({id: config.target_id, instance: this});
    } else {
      throw new Error(`같은 ID를 가진 장치가 있습니다.${config.target_id}`);
      // return foundInstance.instance;
    }
  }

  /**
   * deviceMediator 을 정의
   * @param {AbstMediator} deviceMediator 
   */
  setMediator(deviceMediator) {
    this.mediator = deviceMediator;
  }


  executeCommand(commanderObserver, cmd){

  }



  updateDcConnect(){
  }

  updateDcClose(){
  }

  updateDcError(){
  }

  updateDcData(){

  }
  updateDcTimeout(){
  }

}

module.exports = Commander;