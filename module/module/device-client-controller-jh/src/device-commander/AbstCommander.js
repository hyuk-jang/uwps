
const AbstMediator = require('../device-mediator/AbstMediator');
const AbstManager = require('../device-manager/AbstManager');
require('../format/define');

class AbstCommander {
  constructor() {
    this.protocolConverter = {};
    this.id = null;
    /** @type {AbstMediator} */
    this.mediator = null;
  }

  /**
   * deviceMediator 을 정의
   * @param {AbstMediator} deviceMediator 
   */
  setMediator(deviceMediator) {}

  /**
   * 장치로 명령을 내림
   * @param {commandFormat|Buffer|string} cmd 
   * @param {*=} observer 명령 처리 후 결과를 전달받을 객체
   */
  executeCommand(cmd, observer){
  }

  updateDcConnect(){
  }

  updateDcClose(){
  }

  updateDcError(){
  }

  /**
   * 장치로부터 데이터 수신
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Buffer} data 명령 수행 결과 데이터
   * @param {AbstManager} manager 장치 관리 매니저
   */
  updateDcData(processItem, data, manager){

  }

  updateDcTimeout(){
  }
}
module.exports = AbstCommander;