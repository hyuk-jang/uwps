const EventEmitter = require('events');
const _ = require('underscore');
const Model = require('./Model.js');
const P_GenerateData = require('./P_GenerateData.js');

const P_SocketServer = require('./P_SocketServer');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;


class Control extends EventEmitter {
  constructor() {
    super();
    // 현재 Control 설정 변수
    this.config = {
      port: 38000,
      isSingle: 1,
      renewalCycle: 10, // sec  데이터 갱신 주기,
      dummyValue: {
        // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
        powerRangeByYear: [68, 75, 76, 79, 84, 87, 96, 100, 92, 85, 76, 71],
        // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
        powerRangeByDay: [0, 0, 0, 0, 0, 0, 10, 20, 30, 40, 50, 70, 90, 100, 95, 85, 65, 40, 25, 10, 0, 0, 0, 0],
        dailyScale: [],
        dummyScale:[],
        startDate: '2017-07-15 08:00:00',
        generateIntervalMin: 10,
        pv: {
          amp: 6.4,  // Ampere
          vol: 225,  // voltage
          baseAmp: 6.5,  // 기준
          baseVol: 230,
          ampCritical: 2,
          volCritical: 20
        },
        ivt: {
          pf: 96.7,
          basePf: _.random(960, 988) / 10,
          pfCritical: 4
        }
      }
    }

    
    let arrMonthData = [];
    this.config.dummyValue.powerRangeByYear.forEach((monthData, yIndex) => {
      arrMonthData[yIndex] = new Array();
      for (let cnt = 0; cnt < 31; cnt++) {
        arrMonthData[yIndex][cnt] = new Array();
        let hasRain = cnt % 13 === 0 ? true : false;
        // let hasRain = false;
        let dayScale = hasRain ? _.random(40, 50) : _.random(90, 100);
        this.config.dummyValue.powerRangeByDay.forEach((dayData, dIndex) => {
          arrMonthData[yIndex][cnt][dIndex] = new Array();
          arrMonthData[yIndex][cnt][dIndex].push( (monthData / 100) * dayData * dayScale / 100) 
        })

      }
    })

    // BU.CLI(arrMonthData)
    this.config.dummyValue.dummyScale = arrMonthData;

    // BU.CLI(this.config.dummyValue.dailyScale)
    // Model
    this.model = new Model(this);

    // Process
    this.p_GenerateData = new P_GenerateData(this);
    this.p_SocketServer = new P_SocketServer(this);
    // Child
  }

  // callback => Socket Server Port 를 돌려받음.
  async init() {
    // BU.CLI('init DummyInverter')
    try {
      let port = await this.p_SocketServer.createServer();
      this.model.socketServerPort = port;
      return port;
    } catch (error) {
      console.log('error', error)
      throw error;
    }
  }

  runCronForMeasureInverter() {
    this.p_GenerateData.runCronForMeasureInverter();
  }

  dummyRangeDataMaker() {
    this.p_GenerateData.dummyRangeDataMaker();
  }

  get socketServerPort() {
    return this.model.socketServerPort;
  }

  getBaseInverterValue() {
    return {
      // Pv Info
      amp: null, // Ampere
      vol: null, // voltage
      // Power Info
      gridKw: null, // 출력 전력
      dailyKwh: null, // 하루 발전량 kWh
      cpKwh: null, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: null, // 역률 Power Factor %
      // Grid Info
      rsVol: null, // rs 선간 전압
      stVol: null, // st 선간 전압
      trVol: null, // tr 선간 전압
      rAmp: null, // r상 전류
      sAmp: null, // s상 전류
      tAmp: null, // t상 전류
      lf: null, // 라인 주파수 Line Frequency, 단위: Hz
      // System Info
      isSingle: null, // 단상 or 삼상
      capa: null, // 인버터 용량 kW
      productYear: null, // 제작년도 월 일 yyyymmdd,
      sn: null, // Serial Number,
      // Operation Info
      isRun: null, // 인버터 동작 유무
      isError: null,  // 인버터 에러 발생 유무
      temperature: null,  // 인버터 온도
      errorList: null, // 에러 리스트 Array
      warningList: null // 경고 리스트 Array
    }
  }

  generateDummyData() {
    let res = this.p_GenerateData.dataMaker(new Date());
    BU.CLI(res)
    this.model.onData(res.pv, res.ivt);
  }

  generatePvData(scale) {
    let resPv = this.p_GenerateData.generatePvData(this.model.pv, scale);
    this.model.onPvData(resPv.amp, resPv.vol);

    let resIvt = this.p_GenerateData.generateInverterData(this.model.pv);
    this.model.onIvtData(resIvt.amp, resIvt.vol);

    // BU.CLI(this.model.currIvtData)
    return this.model.pv;
  }

  // 에러 옵션이 필요할 경우
  generateFault() {

  }

  /**
   * Socket 처리 구간 Start
   */

  _eventHandler() {
    this.p_SocketServer.on('dataBySocketServer', (err, result) => {
      if (err) {

      }
      this.p_SocketServer.cmdProcessor(result)
    })
  }

  _addSocket(socket) {

  }

  _destroySocket(socket) {

  }


  /**
   * Socket 처리 구간 End
   */
}
module.exports = Control;