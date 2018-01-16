const EventEmitter = require('events');
const Model = require('./Model.js');

const P_SocketServer = require('./P_SocketServer');

/** Class 접속반 가상 장치 임무를 수행할 Socket Server */
class Control extends EventEmitter {
  constructor() {
    super();
    // 현재 Control 설정 변수
    /**
     * @property {object} config  - 설정을 담은 객체
     * @property {number} config.port - 접속반 Socket Server 시작 Port
     * @property {number} config.renewalCycle -  // sec  데이터 갱신 주기,
     * @property {number} config.connector_seq - connector seq
     * @property {number} config.ch_number - 접속반 채널 구성 갯수
     */
    this.config = {
      port: 39000,
      renewalCycle: 10, // sec  데이터 갱신 주기,
      connector_seq: 1, // inverter seq
      ch_number: 6
    };

    /**
     * 현재 컨트롤러 전반에서 얻은 데이터를 저장, 
     * @property {Model} model 
     */
    this.model = new Model(this);

    /**
     * Socket Server 구동 객체
     * @property {P_SocketServer} p_SocketServer 
     */
    this.p_SocketServer = new P_SocketServer(this);
    // Child
  }

  /**
   * callback => Socket Server Port 를 돌려받음.
   * @return {promise} Port|Error
   */
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

  /**
   * 현재 Socket Server Listen Port를 돌려줌
   * @return {number} Socket Server Port
   */
  get socketServerPort() {
    return this.model.socketServerPort;
  }

  /**
    * Control Process에 Biding 처리할 Event 등록
    */
  _eventHandler() {
  }
}
module.exports = Control;