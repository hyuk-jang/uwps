'use strict';

const _ = require('underscore');
const Promise = require('bluebird');

const BU = require('base-util-jh').baseUtil;

const AbstCommander = require('../device-commander/AbstCommander');
const AbstMediator = require('../device-mediator/AbstMediator');
const AbstManager = require('./AbstManager');

const Iterator = require('./Iterator');

const Serial = require('../device-controller/serial/Serial');
const SerialWithParser = require('../device-controller/serial/SerialWithParser');
const Socket = require('../device-controller/socket/Socket');

require('../format/define');

// DeviceManager는 DeviceController와 1:1 매칭.
const instanceList = [];
/** @class DeviceManager */
class Manager extends AbstManager {
  /** @param {deviceClientFormat} config */
  constructor(config) {
    super();

    /** DeviceController를 불러옴 */
    let deviceController = null;
    switch (config.connect_type) {
    case 'serial':
      deviceController = _.has(config, 'parser') && !_.isEmpty(config.parser) ? new SerialWithParser(config) : new Serial(config);
      break;
    case 'socket':
      deviceController = new Socket(config);
      break;
    default:
      throw new Error('해당 장치는 없습니다.', config);
    }
    // 해당 장치가 이미 존재하는지 체크
    let foundInstance = _.findWhere(instanceList, {id: deviceController.id});
    // 장치가 존재하지 않는다면 instanceList에 삽입하고 deviceController에 등록
    if(_.isEmpty(foundInstance)){
      // observer 등록
      deviceController.attach(this);
      // Manager에 Device 등록
      this.deviceController = deviceController;
      this.id = deviceController.id;
      // 신규 정의시 instanceList에 저장
      instanceList.push({id: deviceController.id, instance: this});
    } else {  // singleton pattern
      return foundInstance.instance;
    }

    this.retryChance = 3; // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
    /**
     * @type {{process:commandFormat, rankList: Array.<{rank: number, list: Array.<commandFormat>} }>]  }
     */
    this.commandStorage = {process: {}, rankList: []};

    this.createIterator();
  }

  /** Iterator 정의 */
  createIterator() {
    this.iterator = new Iterator(this);
  }

  /**
   * deviceMediator 을 정의
   * @param {AbstMediator} deviceMediator 
   */
  setMediator(deviceMediator) {
    this.mediator = deviceMediator;
  }


  async write(){
    // BU.log('Device write');
    // BU.CLI(this.sendMsgTimeOutSec);
    const processItem = this.getProcessItem();
    if(_.isEmpty(processItem)){
      throw new Error(`현재 진행중인 명령이 존재하지 않습니다. ${this.id}`);
    } else {
      let currCmd = processItem.cmdList[processItem.currCmdIndex];
      // BU.CLI('명령 발송 테스트 시작', currCmd);
      // 장치와의 연결을 계속 수립하겠다면
      if(processItem.hasOneAndOne){
        BU.CLI('OneAndOne 진행');
        // 명령이 존재하다면 
        if(currCmd.length){
          await this.deviceController.write(currCmd);
          return true;
        } 
        return true;
      } else {
        await this.writeCommandController(processItem.cmdList[processItem.currCmdIndex]);

        // let testId = this.getReceiver().id;
        // BU.CLI('명령 요청', this.getReceiver().id, processItem.timeoutMs);
        // console.time(`timeout ${testId}`);
        this.getProcessItem().timer = setTimeout(() => {
          // console.timeEnd(`timeout ${testId}`);
          this.getReceiver().updateDcError(this.getProcessItem(), new Error('timeout'));
          this.nextCommand();
          // 명전 전송 후 제한시간안에 응답이 안올 경우 에러 
        }, processItem.timeoutMs);

        return true;
      }
    }
  }

  /**
   * 장치로 명령 발송 --> 명령 수행 후 응답 결과 timeout 처리를 위함
   * @param {*} cmd 
   * @param {Promise} 정상 처리라면 true, 아닐 경우 throw error
   */
  async writeCommandController(cmd) {
    // BU.CLI('msgSendController');
    if (cmd === '' || BU.isEmpty(cmd)) {
      return new Error('수행할 명령이 없습니다.');
    }
    // 장치로 명령 전송
    await this.deviceController.write(cmd);
    return true;
  }


  /** write의 후속 결과 처리를 담당하는 컨트롤러 */
  requestWrite(){
    // DeviceController 의 client가 빈 객체라면 연결이 해제된걸로 판단
    if(_.isEmpty(this.deviceController.client)){
      BU.log('DeviceController Client Is Empty');
      return false;
    } 
    
    return this.write();
  }


  /**
   * updateData를 통해 전달받은 데이터에 대한 Commander의 응답을 받을 메소드
   * 응답받은 데이터에 문제가 있거나 다른 사유로 명령을 재 전송하고자 할 경우(3회까지 가능)
   * @param {AbstCommander} commander 
   * @param {string} msg 'isOk', 'retry'
   */
  responseToDataFromCommander(commander, msg){
    // BU.CLI('responseToDataFromCommander');
    let processItem = this.getProcessItem();

    if(_.isEmpty(processItem)){
      throw new Error('현재 진행중인 명령은 없습니다.');
    }

    // 현재 진행중인 명령 객체와 일치해야지만 가능
    if(_.isEqual(processItem.commander, commander)){
      switch (msg) {
      case 'isOk':
        BU.CLI('isOk', this.getReceiver().id);
        // BU.CLIN(this.getProcessItem().timer);
        clearTimeout(this.getProcessItem().timer);
        // BU.CLIN(this.getProcessItem().timer);
        // console.timeEnd('gogogo');
        this.nextCommand();          
        break;
      case 'retry':
        clearTimeout(this.getProcessItem().timer);
        this.retryWrite();
        break;
      default:
        break;
      }
    } else {
      throw new Error('현재 진행중인 명령의 Commander와 일치하지 않습니다.');
    }
  }

  retryWrite(){
    BU.CLI('retryWrite');
    this.retryChance -= 1;
    // 명령을 재요청할 경우 진행중인 timeout 처리는 해제
    
    if (this.retryChance > 0) {
      return Promise.delay(30).then(() => {
        this.requestWrite();
      });
    } else if(this.retryChance === 0){  // 3번 재도전 실패시 다음 명령 수행
      // 해당 에러 발송
      BU.CLI('retryWrite Max Error');
      this.getReceiver().updateDcError(this.getProcessItem(), new Error('retryMaxError'));
      // 다음 명령 수행
      this.nextCommand();
    }
  }


  /**
   * @param {commandFormat} cmdInfo 
   * @return {boolean} 명령 추가 성공 or 실패. 연결된 장비의 연결이 끊어진 상태라면 명령 실행 불가
   */
  addCommand(cmdInfo) {
    // DeviceController 의 client가 빈 객체라면 연결이 해제된걸로 판단
    if(_.isEmpty(this.deviceController.client)){
      return false;
    } 
    // BU.log('addCommand');
    // BU.CLIN(cmdInfo);
    this.iterator.addCmd(cmdInfo);
    // BU.CLIN(this.commandStorage, 4);
    // 현재 진행 중인 명령이 없다면 즉시 해당 명령 실행
    if(_.isEmpty(this.commandStorage.process)){
      this.nextCommand();
    }
    return true;
  }


  /**
   * 현재 랭크 데이터 가져옴
   * @param {number} rank 
   */
  getCommandStorageByRank(rank){
    return _.findWhere(this.commandStorage.rankList, {rank});
  }


  /**
   * 다음 명령을 수행
   * @param {AbstCommander=} commander 
   */
  nextCommand(){
    BU.CLI('nextCommand');
    // BU.CLIN(this.commandStorage, 2);
    if(this.iterator.isDone()){
      this.getReceiver().updateDcComplete(this.getProcessItem());
    }
    
    this.retryChance = 3;

    let hasNext = this.iterator.nextCmd();

    // BU.CLI(this.iterator.getCurrentCmd());
    
    // 다음 가져올 명령이 존재한다면
    if(hasNext){
      return this.requestWrite();
    } else {
      BU.CLI('모든 명령을 수행하였습니다.');
    }
  }

  /** @return {commandFormat} */
  getProcessItem() {
    return this.iterator.getCurrentItem();
  }

  /** @return {AbstCommander} */
  getReceiver() {
    return this.iterator.getCurrentReceiver();
  }

  // getReceiver(): iterator.currItem().observer
  // getStatusCommand(): iterator.currItem()
  // addCommand(commandFormat): iterator.addCommand()
  // clearProcessCmd(): iterator.clear()

}

module.exports = Manager;