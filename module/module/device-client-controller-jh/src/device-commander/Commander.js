'use strict';

const _ = require('underscore');
const uuidv4 = require('uuid/v4');

const AbstCommander = require('./AbstCommander');

// require('../format/define');

const AbstMediator = require('../device-mediator/AbstMediator');
const AbstManager = require('../device-manager/AbstManager');

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


  /**
   * 장치로 명령을 내림
   * @param {Buffer|string} cmd 
   * @param {*=} observer 명령 처리 후 결과를 전달받을 객체
   */
  executeCommand(cmd, observer){
    let commandInfo = {};
    if(Buffer.isBuffer(cmd) || typeof cmd  === 'string' ){
      commandInfo.rank = 2;
      commandInfo.name = 'Temp';
      commandInfo.uuid = uuidv4();
      commandInfo.observer = observer || null;
      commandInfo.commander = this;
      commandInfo.cmdList = [cmd];
      commandInfo.currCmdIndex = 0;
    } else {
      commandInfo = cmd;
    }

    this.mediator.requestAddCommand(commandInfo, this);
  }



  updateDcConnect(){
  }

  updateDcClose(){
  }

  /**
   * 
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Error} err 
   */
  updateDcError(processItem, err){
    // console.error(err);
  }

  /**
   * 장치로부터 데이터 수신
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Buffer} data 명령 수행 결과 데이터
   * @param {AbstManager} manager 장치 관리 매니저
   */
  updateDcData(processItem, data, manager){
    // BU.CLIN(processItem, 3);
    BU.CLIN(data.toString(), 3);
    let rainBuffer = data.slice(data.length - 6 - 8, data.length - 6);

    let rain = parseInt(rainBuffer, 16);
    // BU.log(rain);

    if(rain > 100){
      manager.nextCommand();
    } else {
      manager.retryWrite();
    }

  }

  updateDcTimeout(){
  }

}

module.exports = Commander;