

'use strict';
const EventEmitter = require('events');


class Control extends EventEmitter {
  constructor(){
    super();
    // 현재 Control 설정 변수
    this.config = {
      hasDev: true,
      baseFormat: {},
      ivtDummyData: {},
      deviceSavedInfo: {},
    };
    this.deviceManager = require('./deviceManager');

    this.deviceClient = {};
  }


  /**
   * Connect Type에 맞게 장치 접속. 초기화 후 Event Emitter Binding 처리 
   * @param {{connecttype: String, port: Number|String, ip:String:Undefinded}}
   * @return {}
   */
  async connect(config){
    this.deviceClient = this.deviceManager.init(config);
    this.deviceClient.on('data', data => {
    });
    this.deviceClient.on('disconnected', err => {
      // this.deviceManager.
    });
    await this.deviceManager.connect();
    return this.deviceClient;
  }

}
module.exports = Control;