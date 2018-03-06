'use strict';

const AbstManager = require('../device-manager/AbstManager');

const uuidv4 = require('uuid/v4');
/**
 * @class AbstController
 */
class AbstController {
  constructor() {
    /** @type {Array.<AbstManager>}  */
    this.observers = [];
    this.id = uuidv4();
    this.configInfo = null;
  }

  setInit(){}
  /** @return {Promise} 접속 성공시 Resolve, 실패시 Reject  */
  async connect(){}
  disconnect(){}
  
  /** 
   * @param {*} msgInfo 각 장치에 맞는 명령 정보 
   * @return {Promise} 전송 성공시 Resolve, 실패시 Reject
   */
  async write(msgInfo){}

  attach(observer){
    this.observers.push(observer);
    console.log('Observer attached');
  }

  /** @param {AbstManager} observer */
  dettach(observer){
    console.log('dettach');
    this.observers.forEach((currentItem, index) => {
      if(currentItem === observer){
        this.observers.splice(index, 1);
      }
    });
  }

  notifyEvent(eventName, eventMsg){
    console.log('notifyEvent', eventName, eventMsg, this.configInfo);
    this.observers.forEach(currentItem => {
      currentItem.updateDcEvent(eventName, eventMsg);
    });
  }

  notifyData(data){
    // console.log('notifyData', data);
    this.observers.forEach(currentItem => {
      currentItem.updateDcData(data);
    });
  }
}

module.exports = AbstController;