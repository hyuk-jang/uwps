'use strict';




const AbstMediator = require('../device-mediator/AbstMediator');

require('../format/define');


class AbstManager {
  constructor() {
    /** @type {AbstMediator} */
    this.mediator;
    this.deviceController = null;
  }

  /** 초기화할 내용이 필요할 경우 */
  setInit(){}

  /** 장치와 연결을 하고자 할 경우 */
  async connect(){
    await this.deviceController.connect();
  }

  /** 장치와 연결을 해제하고자 할 경우 */
  disconnect(){}

  /** 장치에 메시지를 보내고자 할 경우 */
  async write(){}

  setMediator() {}

  addCommand() {}

  // spreadDeviceObserver(eventName, eventMsg) {
  //   if(this.mediator){
  //     this.mediator.spreadDeviceObserver(eventName, eventMsg);
  //   }
  // }

  /** 장치와의 연결이 성공하였을 경우 */
  updateDcConnect(){
    console.log('updateDcConnect');
    this.mediator.updateDcConnect('dcConnect');
  }

  /** 장치와의 연결이 해제 되었을 경우 */
  updateDcClose(){
    console.log('updateDcClose');
    this.mediator.updateDcClose('dcClose');
  }

  /**
   * 장치에서 에러가 발생하였을 경우
   * @param {Object} error 
   */
  updateDcError(error){
    console.log('updateDcError');
    this.mediator.updateDcError('dcError', error);
  }

  /**
   * 장치에서 데이터가 수신되었을 경우
   * @param {Buffer} data 
   */
  updateDcData(data){
    console.log('updateDcData');
    this.getReceiver().updateDcData(this.getProcessItem(), data); 
  }

  /** 명령을 보냈으나 일정시간(1초) 응답이 없을 경우 */
  updateDcTimeout(){
    console.log('updateDcTimeout');
    this.getReceiver().updateDcTimeout(this.getProcessItem());
  }
}

module.exports = AbstManager;