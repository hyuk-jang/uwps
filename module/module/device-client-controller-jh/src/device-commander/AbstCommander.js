'use strict';

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

  /* Mediator에서 Set 함 */
  /**
   * deviceMediator 을 정의
   * @protected 
   * @param {AbstMediator} deviceMediator 
   * @return {undefined}
   */
  setMediator(deviceMediator) {}


  /* Client가 요청 */
  /**
   * 장치로 명령을 내림
   * @param {commandFormat|Buffer|string} cmd 
   * @param {*=} observer 명령 처리 후 결과를 전달받을 객체
   * @return {undefined}
   */
  executeCommand(cmd, observer){
  }

  /* 장치에서 일괄 이벤트 발생 */
  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @protected 
   * @param {string} eventName 'dcConnect', 'dcClose', 'dcError'
   * @param {*=} eventMsg 
   * @return {undefined}
   */
  updateDcEvent(eventName, eventMsg) {}


  /** 장치에서 명령을 수행하는 과정에서 생기는 1:1 이벤트 */
  /**
   * Device Manager에서 명령을 수행하는 과정에서 에러가 발생할 경우
   * @protected 
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Error} err 
   * @return {undefined}
   */
  updateDcError(error){}

  /**
   * 장치로부터 데이터 수신
   * @protected 
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Buffer} data 명령 수행 결과 데이터
   * @param {AbstManager} manager 장치 관리 매니저
   */
  updateDcData(processItem, data, manager){
  }


  /** Manager에게 다음 명령을 수행하도록 요청 */
  requestNextCommand(){}

  /** Manager에게 현재 실행중인 명령을 재 전송하도록 요청 */
  requestRetryCommand(){}
}
module.exports = AbstCommander;