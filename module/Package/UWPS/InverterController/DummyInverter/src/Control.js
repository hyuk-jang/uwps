const EventEmitter = require('events');
const _ = require('underscore');
const Model = require('./Model.js');
const P_GenerateData = require('./P_GenerateData.js');

const P_SocketServer = require('./P_SocketServer');
const BU = require('base-util-jh').baseUtil;

/** Inverter Data 가 공통으로 담길 Base Format Guide Line */
const {baseFormat} = require('../../Converter');

/** Class 인버터 가상 장치 임무를 수행할 Socket Server */
class Control extends EventEmitter {
  /**
   * 장치 객체 Binding. 최초 1회만 수행하면 됨
   * @param {{dailyKwh: number, cpKwh: number}} dummyData 인버터 시작 데이터
   */
  constructor(dummyData) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      port: 38000,
      isSingle: 1,
      renewalCycle: 10, // sec  데이터 갱신 주기,
      inverter_seq: 1, // inverter seq
      dummyValue: {
        dailyKwh: dummyData.dailyKwh,
        cpKwh: dummyData.cpKwh,
        // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
        powerRangeByYear: [68, 75, 76, 79, 84, 87, 96, 100, 92, 85, 76, 71],
        // 0시 ~ 23시까지(index와 매칭: 변환 효율표)
        powerRangeByDay: [0, 0, 0, 0, 0, 0, 10, 20, 30, 40, 70, 88, 100, 96, 85, 75, 45, 30, 17, 0, 0, 0, 0, 0],
        dailyScale: [],
        dummyScale: [],
        generateIntervalMin: 10,
        pv: {
          amp: 6.4, // Ampere
          vol: 225, // voltage
          baseAmp: 6.5, // 기준
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
    };

    // BU.CLI(this.config)

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
          arrMonthData[yIndex][cnt][dIndex].push((monthData / 100) * dayData * dayScale / 100);
        });

      }
    });

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
      console.log('error', error);
      throw error;
    }
  }

  runCronForMeasureInverter() {
    this.p_GenerateData.runCronForMeasureInverter();
  }

  get socketServerPort() {
    return this.model.socketServerPort;
  }

  getBaseInverterValue() {
    return Object.assign({},baseFormat);
  }

  generateDummyData() {
    let res = this.p_GenerateData.dataMaker(new Date());
    BU.CLI(res);
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
   * 시작, 종료 날짜값을 기준으로 데이터 생성 --> db 입력용
   * @param {Date} startDate YYYY-mm-dd HH:mm 시작
   * @param {Date} endDate YYYY-mm-dd HH:mm 종료
   * @param {Number} generateIntervalMin 측정 인터벌 분
   * @param {Number} inverter_seq inverter_seq
   */
  dummyRangeDataMaker(startDate, endDate, generateIntervalMin, inverter_seq) {
    return this.p_GenerateData.dummyRangeDataMaker(startDate, endDate, generateIntervalMin, inverter_seq);
  }


}
module.exports = Control;