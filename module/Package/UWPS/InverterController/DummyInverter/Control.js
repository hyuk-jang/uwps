const EventEmitter = require('events');

const Model = require('./Model.js');
const P_GenerateData = require('./P_GenerateData.js');

const P_SocketServer = require('./P_SocketServer');
const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

class Control extends EventEmitter {
  constructor(config) {
    super();
    // 현재 Control 설정 변수
    this.config = {
      port: 0,
      hasSingle: true,
      pvData: {},
      renewalCycle: 0,
      dummyValue: {
        powerRangeByYear: [],
        powerRangeByMonth: [],
        pv: {},
        ivt: {}
      }
    };
    Object.assign(this.config, config.current);

    // this.config.dbmsManager.startDate = BU.convertTextToDate(this.config.dbmsManager.startDate);

    // Model
    this.model = new Model(this);

    // Process
    this.p_GenerateData = new P_GenerateData(this);
    this.p_SocketServer = new P_SocketServer(this);
    // Child
  }

  // callback => Socket Server Port 를 돌려받음.
  async init() {
    BU.CLI('init DummyInverter')
    try {
      let port = await this.p_SocketServer.createServer();
      // BU.CLI('port',port)
      this.model.socketServerPort = port;
      this.generatePvData();  
      return port;
    } catch (error) {
      console.log('error',error)
      throw error;
    }
  }

  get socketServerPort() {
    return this.model.socketServerPort;
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
      if(err){

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