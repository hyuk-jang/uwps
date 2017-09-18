const EventEmitter = require('events');
const eventToPromise = require('event-to-promise');
const Promise = require('bluebird');

const Model = require('./Model.js');
const ProcessTest = require('./ProcessTest.js');

const InverterController = require('./InverterController/Control.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      inverterList:[],
    };
    Object.assign(this.config, config.current);

    // Model
    this.model = new Model(this);

    // Process
    this.processTest = new ProcessTest(this);

    // Child
    // this.inverterController = this.createInverterController(config.InverterController);

  }

  async init() {
    return await this.createInverterController(this.config.inverterList);
  }

  // 인버터 객체 생성
  async createInverterController(configList){
    const initList = [];

    return await Promise.map(configList, ivtConfig => {
      const inverterObj =  new InverterController(ivtConfig);
      return inverterObj.init();
    }).then(result => {
      
      this.model.measureInverterList = result;
      // let findObj =  this.model.findMeasureInverter('IVT2')
      // BU.CLI(findObj)
    }).catch(error => {
      console.error(error)
    })



    // configList.forEach((ivtConfig, index) => {
    //   const inverterObj =  new InverterController(ivtConfig);
    //   this.model.measureInverterList.push(inverterObj);
    //   initList.push(inverterObj.init);
    // });

    // Promise.all(initList).then(result => {
    //   return result;
    // }).catch(error => {
    //   BU.CLI(error)
    // })

    
  }


}
module.exports = Control;