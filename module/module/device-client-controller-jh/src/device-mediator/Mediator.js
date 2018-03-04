'use strict';

const _ = require('underscore');

const AbstMediator = require('./AbstMediator');

const Commander = require('../device-commander/Commander');
require('../format/define');


const AbstCommander = require('../device-commander/AbstCommander');
const AbstManager = require('../device-manager/AbstManager');



let instance;
class Mediator extends AbstMediator {
  constructor() {
    super();
    
    if(instance){
      return instance;
    } else {
      /** @type {Array.<AbstManager>} */
      this.deviceManagerList = [];
      /** @type {Array.<AbstCommander>} */
      this.deviceCommanderList =  [];
      /** @type {Array.<{commander: AbstCommander, manager: AbstManager}>} */
      this.relationList = [];
      instance = this;
    }

  }

  /**
   * Device Commander 와 Device Manager 간의 관계를 맺음
   * @param {AbstCommander} commander 
   * @param {AbstManager} manager 
   */
  setColleague(commander, manager) {
    this.setCommander(commander);
    this.setManager(manager);

    this.relationList.push({
      commander, manager
    });
  }

  /**
   * Device Commander를 정의
   * @param {AbstCommander} deviceCommander 
   */
  setCommander(deviceCommander) {
    let foundCommander = _.findWhere(this.deviceCommanderList, {id: deviceCommander.id });
    if(_.isEmpty(foundCommander)){
      deviceCommander.setMediator(this);
      this.deviceCommanderList.push(deviceCommander);
    } 
  }

  /**
   * Device Manager를 정의
   * @param {AbstManager} deviceManager 
   */
  setManager(deviceManager) {
    let foundManager = _.findWhere(this.deviceManagerList, {id: deviceManager.id });
    if(_.isEmpty(foundManager)){
      deviceManager.setMediator(this);
      this.deviceManagerList.push(deviceManager);
    } 
  }

  /**
   * 명령 추가
   * @param {commandFormat} cmdInfo 
   * @param {AbstCommander} deviceCommander
   */
  requestAddCommand(cmdInfo, deviceCommander){
    const deviceManager = this.getDeviceManager(deviceCommander);
    deviceManager.addCommand(cmdInfo);
  }


  /**
   * Commander와 물려있는 Manager를 가져옴
   * @param {AbstCommander} deviceCommander
   */
  getDeviceManager(deviceCommander){
    const foundIt = _.findWhere(this.relationList, {commander: deviceCommander});
    if(_.isEmpty(foundIt)){
      throw new Error(`해당 Commander(${deviceCommander.id})는 장치를 가지고 있지 않습니다.`);
    }
    return foundIt.manager;
  }

  /**
   * Manager와 물려있는 장치 리스트를 전부 가져옴
   * @param {AbstManager} deviceManager 
   */
  getDeviceCommander(deviceManager){
    const foundIt = _.where(this.relationList, {manager: deviceManager});
    if(_.isEmpty(foundIt)){
      throw new Error(`해당 Manager(${deviceManager.deviceController})는 Commander를 가지고 있지 않습니다.`);
    }
    const commanderList = _.pluck(foundIt, 'commander');
    return commanderList;

  }


  /**
   * 명령 추가
   * @param {Commander} deviceCommnader
   */
  getCurrentCommandStatus(deviceCommnader){
  }

  spreadDeviceToObserver(){}

  updateDcConnect(){
    console.log('updateDcConnect');
  }
  updateDcClose(){
    console.log('updateDcClose');
  }
  updateDcError(){
    console.log('updateDcError');
  }
}

module.exports = Mediator;