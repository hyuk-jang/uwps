'use strict';

const _ = require('underscore');

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
    let foundInstance = _.findWhere(instanceList, {id: deviceController});
      
    // 장치가 존재하지 않는다면 instanceList에 삽입하고 deviceController에 등록
    if(_.isEmpty(foundInstance)){
      // observer 등록
      deviceController.attach(this);
      // Manager에 Device 등록
      this.deviceController = deviceController;
      // 신규 정의시 instanceList에 저장
      instanceList.push({id: deviceController, instance: this});
    } else {  // singleton pattern
      return foundInstance.instance;
    }

    this.mediator = null;
    this.controlStatus = {
      retryChance: 3, // 데이터 유효성 검사가 실패, 데이터 수신 에러가 있을 경우 3회까지 ProcessCmd 재전송
      reconnectDeviceInterval: 1000 * 60, // 인버터 접속 해제가 이뤄졌을 경우 재 접속 인터벌 1분
      sendMsgTimeOutSec: 1000 * 1 // 해당 초안에 응답메시지 못 받을 경우 해당 에러처리
    };

    /**
     * @type {{process:commandFormat, rankList: Array.<{rank: number, list: Array.<commandFormat>} }>]  }
     */
    this.commandStorage = {process: {}, rankList: []};
  }

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

  /** @param {commandFormat} cmd */
  addCommand(cmd) {
    this.iterator.addCmd(cmd);
  }

  nextCommand(){
    return this.iterator.nextCmd();
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