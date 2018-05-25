'use strict';

const {BU} = require('base-util-jh');

const Model = require('./Model');
const config = require('./config');


const Inverter = require('../Inverter');

class Control {
  /** @param {config} config */
  constructor(config) {
    this.config = config.current;

    this.model = new Model(this);

    
  }

  /**
   * UnterWater Photovoltaic Controller Initialize 
   * EventHandler 등록, 인버터 컨트롤러 객체 및 접속반 컨트롤러 객체 생성
   * @return {Promise} true or exception
   */
  async init() {
    this.eventHandler();
    let result = await Promise.all([
      this.createInverterController(),
      this.createConnectorController(this.config.connectorList)
    ]);

    return result;
  }

  /**
   * 인버터 설정 값에 따라 인버터 계측 컨트롤러 생성 및 계측 스케줄러 실행
   * @returns {Promise} 인버터 계측 컨트롤러 생성 결과 Promise
   */
  async createInverterController() {
    BU.CLI('createInverterController');
    let inverterControllerList = await Promise.map(this.config.inverterList, config => {
      const controller = new Inverter(config);
      return controller.init();
    });
    // console.time('AAAAAAAAAAAA');
    // let inverterControllerList = [];
    // await Promise.each(inverterConfigList, ivtConfig => {
    //   const inverterObj = new InverterController(ivtConfig);
    //   return Promise.delay(1000).then(() => {
    //     return inverterObj.init().then(controller => inverterControllerList.push(controller));
    //   });  
    // });
    // console.timeEnd('AAAAAAAAAAAA');
    // BU.CLI(inverterControllerList);
    this.model.setDeviceController('inverter', inverterControllerList);

    return inverterControllerList;
  }


}
module.exports = Control;