
const AbstCommander = require('../device-commander/AbstCommander');
const AbstController = require('../device-controller/AbstController');
const AbstManager = require('../device-manager/AbstManager');

require('../format/define');

class AbstMediator {
  constructor() {
  }

  /**
   * Device Commander 와 Device Manager 간의 관계를 맺음
   * @param {AbstCommander} commander 
   * @param {AbstManager} manager 
   * @return {void}
   */
  setColleague(commander, manager){}

  /**
   * 명령 추가
   * @param {commandFormat} commandFormat 
   * @return {boolean} 성공 or 실패
   */
  requestAddCommand(commandFormat){}

  /**
   * @param {AbstCommander} deviceCommander
   * @return {AbstManager} Manager
   */
  getDeviceManager(deviceCommander){}


  /**
   * @param {AbstManager} deviceManager 
   * @return {AbstCommander}
   */
  getDeviceCommander(deviceManager){}

  getCurrentCommandStatus(){}

  spreadDeviceToObserver(){}

  /**
   * @param {AbstManager} deviceManager 
   */
  updateDcConnect(){
    console.log('AbstMediator ---> updateDcConnect');
  }

  updateDcClose(){}

  updateDcError(){}
}

module.exports = AbstMediator;