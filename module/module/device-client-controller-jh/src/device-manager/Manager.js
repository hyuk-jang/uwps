'use strict';

const _ = require('underscore');
const Promise = require('bluebird');


const AbstManager = require('./AbstManager');
const Iterator = require('./Iterator');
// const AbstractDeviceController = require('../device-controller/AbstractDeviceController');



const Serial = require('../device-controller/serial/Serial');
const SerialWithParser = require('../device-controller/serial/SerialWithParser');
const Socket = require('../device-controller/socket/Socket');



const AbstMediator = require('../device-mediator/AbstMediator');

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
      deviceController = _.has(config, 'parser') ? new SerialWithParser(config) : new Serial(config);
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

    this.controlStatus = {
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };

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
    BU.log('Device write');
    const processItem = this.getProcessItem();
    if(_.isEmpty(this.getProcessItem())){
      throw new Error(`현재 진행중인 명령이 존재하지 않습니다. ${this.id}`);
    } else {
      let timeout = {};
      await Promise.race(
        [
          this.deviceController.write(processItem.cmdList[processItem.currCmdIndex]),
          new Promise((_, reject) => {
            timeout = setTimeout(() => {
              // BU.CLI(this.model.controlStatus.sendMsgTimeOutSec)
              // 명전 전송 후 제한시간안에 응답이 안올 경우 에러 
              this.updateDcTimeout();
              reject(new Error('timeout'));
            }, this.controlStatus.sendMsgTimeOutSec);
          })
        ]
      );
      clearTimeout(timeout);
      // await this.deviceController.write(processItem.cmdList[processItem.currCmdIndex]);
      return true;
    }
  }

  /** 장치에서 원하는 응답 시간을 초과할 경우 Timeout 발생 */
  writeToDevice(){
    this.write()
      .then(() => {
      })
      .catch(err => {
        this.updateDcTimeout(err);
      });
  }

  // 응답받은 데이터에 문제가 있거나 다른 사유로 명령을 재 전송하고자 할 경우(3회까지 가능)
  retryWrite(){
    BU.CLI('retryWrite', this.controlStatus.retryChance);
    this.controlStatus.retryChance -= 1;
    if (this.controlStatus.retryChance > 0) {
      return Promise.delay(30).then(() => {
        this.writeToDevice();
      });
    } else if(this.controlStatus.retryChance === 0){  // 3번 재도전 실패시 다음 명령 수행
      // 해당 에러 발송
      BU.CLI('retryWrite Max Error');
      this.getReceiver().updateDcError(this.getProcessItem(), new Error('retryWrite Max Error'));
      // 다음 명령 수행
      this.nextCommand();
    } 
  }


  /** @param {commandFormat} cmdInfo */
  addCommand(cmdInfo) {
    BU.CLIN(cmdInfo);
    this.iterator.addCmd(cmdInfo);
    BU.CLIN(this.commandStorage, 4);
    // 현재 진행 중인 명령이 없다면 즉시 해당 명령 실행
    if(_.isEmpty(this.commandStorage.process)){
      // this.iterator.nextRank();
      this.nextCommand();
      // this.controlStatus.retryChance = 3;
      // this.writeToDevice();
    }
    // BU.CLIN(this.commandStorage, 3);
  }

  /** 다음 명령을 수행 */
  nextCommand(){
    BU.CLI('nextCommand');
    BU.CLIN(this.commandStorage, 4);
    this.controlStatus.retryChance = 3;
    
    // 다음 가져올 명령이 존재한다면
    if(this.iterator.nextCmd()){
      return this.writeToDevice();
    } else {
      BU.CLI('모든 명령을 수행하였습니다.');
    }
  }

  getProcessItem() {
    return this.iterator.currentItem();
  }

  getReceiver() {
    return this.iterator.currentReceiver();
  }

  // getReceiver(): iterator.currItem().observer
  // getStatusCommand(): iterator.currItem()
  // addCommand(commandFormat): iterator.addCommand()
  // clearProcessCmd(): iterator.clear()

}

module.exports = Manager;