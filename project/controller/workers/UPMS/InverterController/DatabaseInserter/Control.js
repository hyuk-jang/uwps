const EventEmitter = require('events');

const Model = require('./Model.js');
const P_GenerateData = require('./P_GenerateData.js');
const P_IvtDataMaker = require('./P_IvtDataMaker.js');
const P_Setter = require('./P_Setter.js');

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      dbInfo: {},
      ivtInfo: {
      },
      pvData: {
      },
      renewalCycle: 0,
      dummyValue: {
        pv: {},
        ivt: {}
      },
      dbmsManager: {}
    };
    Object.assign(this.config, config.current);

    this.config.dbmsManager.startDate = BU.convertTextToDate(this.config.dbmsManager.startDate);

    // Model
    this.model = new Model(this);

    // Process
    this.p_GenerateData = new P_GenerateData(this);
    this.p_IvtDataMaker = new P_IvtDataMaker(this);
    this.p_Setter = new P_Setter(this);
    // Child
  }

  init() {
    
    // setInterval(() => {
    //   this.generatePv();
    // }, 1000 * 1)
  }

  generatePvData(scale) {
    let resPv = this.p_GenerateData.generatePvData(this.model.pvData, scale);
    this.model.onPvData(resPv);

    let resIvt = this.p_GenerateData.generateInverterData(this.model.pvData);
    this.model.onIvtData(resIvt);

    // BU.CLI(this.model.currIvtData)
    // return {pv:this.model.pvData, ivt:this.model.ivt_data}
  }

  get currInverterData() {
    return this.model.ivt_data;
  }

  get currIvtDataForDbms() {
    return this.model.currIvtDataForDbms;
  }


  makerQuery(callback) {
    
    this.model.dummy.pointHour = this.config.dbmsManager.startDate.getHours();
    this.model.dummy.pointDate = this.config.dbmsManager.startDate.getDate();
    this.p_IvtDataMaker.maker(callback);
  }

  _completeMakerQuery(invertData, callback) {
    BU.CLI('_completeMakerQuery')
    // BU.CLI('completeMakerQuery', invertData);

    this.p_Setter.setInverterData(invertData, callback);


  }

  _onIvtData(targetDate, kWh) {
    this.model.onDummyIvtData(targetDate, kWh);
  }


  // 에러 옵션이 필요할 경우
  generateFault() {
    
  }
}
module.exports = Control;