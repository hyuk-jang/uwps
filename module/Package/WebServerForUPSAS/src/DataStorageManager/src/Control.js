const _ = require('lodash');
// const cron = require('cron');
const {BU} = require('base-util-jh');

const {
  BaseModel,
} = require('../../../../../module/device-protocol-converter-jh');

const {BM} = require('../../../../../module/base-model-jh');
const SocketServer = require('../SocketServer');
const PowerStatusMaker = require('../PowerStatusMaker');
const UiControllerManager = require('../UiControllerManager');

const dsmConfig = require('./config');

class Control {
  /**
   *
   * @param {http} httpObj
   * @param {dsmConfig} config
   */
  constructor(httpObj, config) {
    this.http = httpObj;
    this.config = config || dsmConfig;

    // this.map = this.controller.map;

    this.defaultConverter = BaseModel.defaultModule;
    /**
     * Main Storage List에서 각각의 거점 별 모든 정보를 가지고 있을 객체 정보 목록
     * @type {Array.<msInfo>}
     */
    this.mainStorageList = [];
  }

  /**
   * Main Storage List를 설정하고 자식들을 구동
   */
  async init() {
    await this.setMainStorageByDB();

    // BU.CLIN(this.mainStorageList);
    this.setChildren();
  }

  /**
   * @desc Step 1
   * Main Storage List를 초기화
   * @param {dbInfo=} dbInfo
   */
  async setMainStorageByDB(dbInfo) {
    dbInfo = dbInfo || this.config.dbInfo;
    this.BM = new BM(dbInfo);

    // DB에서 main 정보를 가져옴
    /** @type {MAIN[]} */
    let mainList = await this.BM.getTable('main', {is_deleted: 0});

    /** @type {dataLoggerInfo[]} */
    const dataLoggerList = await this.BM.getTable('v_data_logger');
    /** @type {nodeInfo[]} */
    const nodeList = await this.BM.getTable('v_node_profile');

    // TEST: main Seq 1번에 강제로 데이터를 넣으므로 정렬 시킴
    mainList = _.sortBy(mainList, 'main_seq');
    // Main 정보 만큼 List 생성
    mainList.forEach(mainInfo => {
      const filterDataLoggerList = _.filter(dataLoggerList, {
        main_seq: mainInfo.main_seq,
      });
      const filterNodeList = _.filter(nodeList, {
        main_seq: mainInfo.main_seq,
      });
      /** @type {msInfo} */
      const mainStorageInfo = {
        msFieldInfo: mainInfo,
        msClient: null,
        msDataInfo: {
          dataLoggerList: filterDataLoggerList,
          nodeList: filterNodeList,
          simpleOrderList: [],
        },
      };

      this.mainStorageList.push(mainStorageInfo);
    });

    return this.mainStorageList;
  }

  /**
   * @desc Step 2
   * Storage를 구동하기 위한 자식 객체를 생성
   */
  setChildren() {
    // 소켓 서버 구동
    this.socketServer = new SocketServer({
      dbInfo: this.config.dbInfo,
      socketServerPort: this.config.socketServerPort,
    });
    this.socketServer.mainStorageList = this.mainStorageList;
    // socket Server의 갱신 내용을 받기위해 Observer 등록
    this.socketServer.attach(this);
    this.socketServer.init();

    // 태양광 발전 현황판 데이터 생성 객체
    this.powerStatusMaker = new PowerStatusMaker({
      dbInfo: this.config.dbInfo,
    });
    this.powerStatusMaker.mainStorageList = this.mainStorageList;
    this.powerStatusMaker.requestCalcPowerStatus();

    this.uiControllerManager = new UiControllerManager();
    this.uiControllerManager.mainStorageList = this.mainStorageList;
    this.uiControllerManager.getDeviceList();
  }

  /**
   * Web Socket 설정
   * @param {Object} httpObj
   */
  setSocketIO(httpObj) {
    this.io = require('socket.io')(httpObj);
    this.io.on('connection', socket => {
      socket.on('excuteSalternControl', msg => {
        const encodingMsg = this.defaultConverter.encodingMsg(msg);

        !_.isEmpty(this.client) &&
          this.write(encodingMsg).catch(err => {
            BU.logFile(err);
          });
      });

      // if (this.stringfySalternDevice.length) {
      //   socket.emit('initSalternDevice', this.stringfySalternDevice);
      //   // socket.emit('initSalternCommand', this.stringfyStandbyCommandSetList);
      //   socket.emit(
      //     'initSalternCommand',
      //     this.stringfyCurrentCommandSet,
      //     this.stringfyStandbyCommandSetList,
      //     this.stringfyDelayCommandSetList,
      //   );
      // }

      socket.on('disconnect', () => {});
    });
  }

  /**
   * TODO: Node 정보가 변경된 사항을 Socket.io를 통한 알림
   * @desc SocketServer Observer Method Implement
   * @param {msInfo} msInfo
   * @param {nodeInfo[]} renewalList
   */
  updateNodeList(msInfo, renewalList) {}

  /**
   * TODO: 명령 정보가 변경된 사항을 Socket.io를 통한 알림
   * @desc SocketServer Observer Method Implement
   * @param {msInfo} msInfo
   */
  updateSimpleOrderList(msInfo) {}
}
module.exports = Control;
