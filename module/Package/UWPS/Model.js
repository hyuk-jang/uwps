const _ = require('underscore');
const cron = require('cron');
const Bi = require('./class/Bi.js');

class Model {
  constructor(controller) {
    this.controller = controller;

    this.measureInverterList = [];
    this.measureConnectorList = [];

    this.bi = new Bi(this.controller.config.dbInfo);
  }

  // 인버터 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureInverter(ivtId){
    BU.CLI('findMeasureInverter', ivtId)
    let findObj = _.find(this.measureInverterList, ivtController => {
      let ivtInfo = ivtController.getInverterInfo();
      BU.CLIS(ivtInfo,ivtId)
      return ivtInfo.target_id === ivtId;
    })
    // BU.CLI(findObj)
    
    return findObj;
  }

  // 접속반 id로 인버터 컨트롤러 객체 찾아줌
  findMeasureConnector(cntId){

  }

  // 인버터 데이터 가져와 DB에 넣는 스케줄러
  measureInverterScheduler(){
    let inverterList = [];
    this.measureInverterList.forEach(inverterController => {
      inverterList.push(inverterController.refineInverterData);
    })

    BU.CLI(inverterList)

    let query = this.bi.multiInsertTable('inverter_data', inverterList);

    BU.CLI(query)

    // this.cronJob = new cron.CronJob({
    //   cronTime: '0 * * * * *',
    //   onTick: () => {
    //     // console.log('job 1 ticked');
    //     // BU.CLI(BU.convertDateToText(new Date()))
    //   },
    //   start: true,
    //   // timeZone: 'America/Los_Angeles'
    // });
  }

}

module.exports = Model;