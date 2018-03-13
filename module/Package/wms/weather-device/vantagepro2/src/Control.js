'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

const Converter = require('../../../../../module/device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    
    this.config = config.current;

    // this.setDeviceClient(this.config.current.deviceInfo);

    this.model = new Model(this);

    this.converter = new Converter(this.config.deviceInfo);

    this.executeCommandInterval = null;
  }

  /**
   * Device Controller 변화가 생겨 관련된 전체 Commander에게 뿌리는 Event
   * @param {string} eventName 'dcConnect', 'dcClose', 'dcError'
   * @param {*=} eventMsg 
   */
  updateDcEvent(eventName, eventMsg) {
    BU.log('updateDcEvent\t', eventName, eventMsg);
    switch (eventName) {
    case 'dcConnect':
      this.executeCommandInterval ? clearInterval(this.executeCommandInterval) : null;
      var cmdList = this.converter.generationCommand();
      this.executeCommand(cmdList);
      this.executeCommandInterval = setInterval(() => {
        this.executeCommand('LOOP\n');
        this.requestNextCommand();
      }, 1000 * 60);
      break;
    default:
      break;
    }
  }




  /**
   * 장치로부터 데이터 수신
   * @interface
   * @param {commandFormat} processItem 현재 장비에서 실행되고 있는 명령 객체
   * @param {Buffer} data 명령 수행 결과 데이터
   */
  updateDcData(processItem, data){
    
    // BU.CLI(data.toString());
    // const resultData = this.model.onData(data);

    const resultParsing = this.converter.parsingUpdateData(processItem.cmdList[processItem.currCmdIndex], data);

    BU.CLI(resultParsing);
    


    // // 현재 내리는 비가 변화가 생긴다면 이벤트 발생
    // if(!_.isEmpty(resultData)){
    //   this.emit('updateSmRainSensor', resultData);
    // }
  }
}
module.exports = Control;