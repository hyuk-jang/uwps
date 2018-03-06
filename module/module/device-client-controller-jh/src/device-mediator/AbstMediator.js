
const AbstCommander = require('../device-commander/AbstCommander');
const AbstController = require('../device-controller/AbstController');
const AbstManager = require('../device-manager/AbstManager');

require('../format/define');

class AbstMediator {
  constructor() {
  }

  /* Builder에서 요청하는 부분 */
  /**
   * Device Commander 와 Device Manager 간의 관계를 맺음
   * @param {AbstCommander} commander 
   * @param {AbstManager} manager 
   * @return {void}
   */
  setColleague(commander, manager){}


  /* Commander에서 요청하는 부분 */
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
   * 현재 Commander와 물려있는 장치의 모든 명령을 가져옴
   * @param {AbstCommander} deviceCommander
   * @return {commandStorage} Manager
   */
  getCommandStatus(deviceCommander){}


  /* Device Manager에서 요청하는 부분  */
  /**
   * Device Manager에서 새로운 이벤트가 발생되었을 경우 알림
   * @param {AbstManager} deviceManager 
   * @param {string} eventName 
   * @param {*=} eventMsg 
   */
  updateDcEvent(deviceManager, eventName, eventMsg){}


  // /**
  //  * @param {AbstManager} deviceManager 
  //  * @return {Array.<AbstCommander>}
  //  */
  // getDeviceCommander(deviceManager){}


}

module.exports = AbstMediator;