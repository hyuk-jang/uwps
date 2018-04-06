'use strict';
const _ = require('underscore');

const BU = require('base-util-jh').baseUtil;

const AbstDeviceClient = require('device-client-controller-jh');

const Model = require('./Model');

let config = require('./config');

const {AbstConverter, weathercastProtocolFormat} = require('device-protocol-converter-jh');

class Control extends AbstDeviceClient {
  /** @param {config} config */
  constructor(config) {
    super();
    
    this.config = config.current;

    this.model = new Model(this);

    this.converter = new AbstConverter(this.config.deviceInfo);

    this.executeCommandInterval = null;
  }

  get id(){
    return this.config.deviceInfo.target_id;
  }

  /**
   * 개발 버젼일 경우 장치 연결 수립을 하지 않고 가상 데이터를 생성
   */
  init(){
    if(!this.config.hasDev){
      this.setDeviceClient(this.config.deviceInfo);
    } else {
      BU.CLI('생성기 호출', this.id);
      require('./dummy')(this);
    }
    this.converter.setProtocolConverter(this.config.deviceInfo);
  }


  /**
   * 장치의 현재 데이터 및 에러 내역을 가져옴
   * @return {deviceOperationInfo} 
   */
  getDeviceOperationInfo() {
    return {
      id: this.config.deviceInfo.target_id,
      config: this.config.deviceInfo,
      data: this.model.deviceData,
      // systemErrorList: [{code: 'new Code2222', msg: '에러 테스트 메시지22', occur_date: new Date() }],
      systemErrorList: this.systemErrorList,
      troubleList: [],
      measureDate: new Date()
    };
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
        this.executeCommand(cmdList);
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
    BU.CLIN('data');
    BU.appendFile(`./log/vantage/data/${BU.convertDateToText(new Date(), '', 2)}.txt`, `${this.config.deviceInfo.target_id} : ${data.toString('hex')}`);
    const resultParsing = this.converter.parsingUpdateData(processItem.cmdList[processItem.currCmdIndex], data);
    // BU.CLI(resultParsing);
    if(resultParsing.eventCode === 'done'){
      if(!this.config.hasDev){
        this.requestTakeAction('wait');
      }
    }
    this.model.onData(resultParsing.data);
    // BU.CLIN(this.getDeviceOperationInfo());
  }
}
module.exports = Control;