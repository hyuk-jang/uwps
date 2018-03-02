'use strict';

const AbstractDeviceManager = require('./AbstractDeviceManager');
const DeviceIterator = require('./DeviceIterator');
const AbstractDeviceController = require('../device-controller/AbstractDeviceController');


require('../format/define');


/** @class DeviceManager */
class DeviceManager extends AbstractDeviceManager {
  constructor(mediator) {
    super();
    this.mediator = mediator;
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
    this.iterator = new DeviceIterator(this);
  }

  /**
   * Device Controller 을 정의
   * @param {AbstractDeviceController} deviceController 
   */
  setDeviceController(deviceController) {
    this.deviceController = deviceController;
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

module.exports = DeviceManager;