'use strict';
const _ = require('underscore');
const eventToPromise = require('event-to-promise');

const AbstCommander = require('../device-commander/AbstCommander');
const AbstMediator = require('../device-mediator/AbstMediator');

require('../format/define');

const EventEmitter = require('events');

class AbstManager extends EventEmitter {
  constructor() {
    super();
    /** @type {AbstMediator} */
    this.mediator;
    this.deviceController = null;
    this.id = '';
  }

  /** 초기화할 내용이 필요할 경우 */
  setInit(){}

  /** 장치와 연결을 하고자 할 경우 */
  async connect(){
    this.deviceController.connect();

    await eventToPromise(this, 'dcConnect');
    BU.CLI('connect()');

    return true;
  }

  /** 장치와 연결을 해제하고자 할 경우 */
  disconnect(){}

  /** 장치에 메시지를 보내고자 할 경우 */
  async write(){}

  setMediator() {}

  /**
   * 명령 추가
   * @param {commandFormat} cmdInfo 
   */
  addCommand(cmdInfo) {}

  // spreadDeviceObserver(eventName, eventMsg) {
  //   if(this.mediator){
  //     this.mediator.spreadDeviceObserver(eventName, eventMsg);
  //   }
  // }

  /** 장치와의 연결이 성공하였을 경우 */
  updateDcConnect(){
    this.emit('dcConnect');
    console.log('AbstManager --> updateDcConnect');
    this.mediator.updateDcConnect('dcConnect', this);
  }

  /** 장치와의 연결이 해제 되었을 경우 */
  updateDcClose(){
    this.emit('dcClose');
    console.log('AbstManager --> updateDcClose');
    this.mediator.updateDcClose('dcClose', this);
  }

  /**
   * 장치에서 에러가 발생하였을 경우
   * @param {Object} error 
   */
  updateDcError(error){
    console.log('AbstManager --> updateDcError');
    this.mediator.updateDcError('dcError', error, this);
  }

  /**
   * 장치에서 데이터가 수신되었을 경우
   * @param {Buffer} data 
   */
  updateDcData(data){
    console.log('AbstManager --> updateDcData');
    if(_.isEmpty(this.getReceiver())){
      BU.log('Completed Data', data);
    } else {
      this.getReceiver().updateDcData(this.getProcessItem(), data, this); 
    }
  }

  /** 명령을 보냈으나 일정시간(1초) 응답이 없을 경우 */
  updateDcTimeout(){
    console.log('AbstManager --> updateDcTimeout');
    if(_.isEmpty(this.getReceiver())){
      BU.log('Clear command', this.id);
    } else {
      this.getReceiver().updateDcTimeout(this.getProcessItem(), this);
    }
  }
}

module.exports = AbstManager;