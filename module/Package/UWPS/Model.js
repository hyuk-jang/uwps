const _ = require('underscore');
const cron = require('cron');
const BM = require(process.cwd() + '/module/baseModel');

class Model {
  constructor(controller) {
    this.controller = controller;

    this.measureInverterList = [];
    this.measureConnectorList = [];

    this.cronJob = null;
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
    // TEST 서버 재시작시 데이터 측정을 위한 초기 호출
    this.measureInverter(new Date());

    try {
      if (this.cronJob !== null) {
        // BU.CLI('Stop')
        this.cronJob.stop();
      }
      // BU.CLI('Setting Cron')
      // 1분마다 요청
      this.cronJob = new cron.CronJob({
        cronTime: '0 * * * * *',
        onTick: () => {
          this.measureInverter(new Date());
        },
        start: true,
        // timeZone: 'America/Los_Angeles'
      });
    } catch (error) {
      throw error;
    }


    
  }

  measureInverter(date) {
    let measureInverterDataList = [];
    let writeDate = date ? date : new Date();
    this.measureInverterList.forEach(inverterController => {
      let refineData = inverterController.refineInverterData;
      refineData.writedate = BU.convertDateToText(writeDate);
      measureInverterDataList.push(refineData);
    })

    BU.CLI(measureInverterDataList)

    // TEST 실제 입력은 하지 않음. 
    return;

    BM.setTables('inverter_data',measureInverterDataList)
    .then(result => {
      // 데이터 정상적으로 입력 수행
      return true;
    }).catch(err => {
      BU.errorLog('measureInverterScheduler', err);
      return false;
    })
  }

}

module.exports = Model;