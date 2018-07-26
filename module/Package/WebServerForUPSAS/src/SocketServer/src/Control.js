const _ = require('lodash');
const split = require('split');
// const cron = require('cron');
const {BU} = require('base-util-jh');

const net = require('net');
// const AbstDeviceClient = require('device-client-controller-jh');
const {
  BaseModel,
} = require('../../../../../module/device-protocol-converter-jh');

require('../../../../../module/default-intelligence');

const {BM} = require('../../../../../module/base-model-jh');

// const { AbstConverter, BaseModel } = require('device-protocol-converter-jh');

// const BiModule = require('../../../models/BiModule');
// const webUtil = require('../../../models/web.util.js');

class SocketServer {
  /**
   *
   * @param {http} httpObj
   */
  constructor(httpObj) {
    this.http = httpObj;

    // this.map = this.controller.map;

    this.defaultConverter = BaseModel.defaultModule;
    /**
     * Main Storage List에서 각각의 거점 별 모든 정보를 가지고 있을 객체 정보 목록
     * @type {Array.<msInfo>}
     */
    this.mainStorageList = [];

    /**
     * Socket Server에 접속하는 거점 Socket Client 목록
     * @type {Array.<net.Socket>}
     */
    this.clientList = [];
  }

  /**
   * @desc Step 1
   * DB에서 특정 데이터를 가져오고 싶을경우
   * @param {dbInfo} dbInfo
   * @param {string} mainUuid main UUID
   */
  async setMainStorageByDB(dbInfo) {
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
      const filterNodeList = _.filter(nodeList, {main_seq: mainInfo.main_seq});
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
   * Socket Server 구동
   * @param {number} port
   */
  init() {
    const server = net
      .createServer(socket => {
        // socket.end('goodbye\n');
        console.log(
          `client is Connected ${
            process.env.SOCKET_UPSAS_PORT
          }\n addressInfo: ${socket.remoteAddress}`,
        );

        // TODO: client 식별을 위하여 접속 시 인증과정을 거쳐야함.(uuid 인증을 계획.) 일단 인증 없이 진행 함. - 2018-07-25

        // FIXME: 임시로 main_seq 1번에 집어 넣음
        _.forEach(this.mainStorageList, msInfo => {
          if (msInfo.msFieldInfo.main_seq === 1) {
            msInfo.msClient = socket;
          }
        });

        // socket Client에 Stream 연결 및 Parser 바인딩
        const stream = socket.pipe(
          split(this.defaultConverter.protocolConverter.EOT),
        );

        // 데이터를 stream 형태로 받아옴.
        stream.on('data', data => {
          try {
            data += this.defaultConverter.protocolConverter.EOT;
            // this.notifyData(data);
            const strData = this.defaultConverter.decodingMsg(data).toString();

            BU.CLI(strData);
            // JSON 형태로만 데이터를 받아 들임.
            if (!BU.IsJsonString(strData)) {
              BU.errorLog('socketServer', '데이터가 JSON 형식이 아닙니다.');
              throw new Error('데이터가 JSON 형식이 아닙니다.');
            }

            /** @type {transDataToServerInfo} */
            const parseData = JSON.parse(strData);
            BU.CLI(parseData);

            this.interpretCommand(parseData);
          } catch (error) {
            BU.logFile(error);
            throw error;
          }
        });

        // client가 접속 해제 될 경우에는 clientList에서 제거
        socket.on('close', () => {
          // 저장소 목록을 돌면서 해당 client를 초기화
          this.mainStorageList.forEach(msInfo => {
            if (_.isEqual(msInfo.msClient, socket)) {
              msInfo.msClient = null;
            }
          });
        });
      })
      .on('error', err => {
        // handle errors here
        console.error('@@@@', err, server.address());
        // throw err;
      });

    // grab an arbitrary unused port.
    server.listen(process.env.SOCKET_UPSAS_PORT, () => {
      console.log('opened server on', server.address());
    });

    server.on('close', () => {
      console.log('close');
    });

    server.on('error', err => {
      console.error(err);
    });
  }

  /**
   * Client에서 보내온 데이터를 해석
   * @param {net.Socket} client
   * @param {transDataToServerInfo} transDataToServerInfo
   */
  interpretCommand(client, transDataToServerInfo) {
    // FIXME: 명령 해석 결과의 처리를 해당 메소드에서 할 것인지, 이 곳에서 할 것인지 ?
    switch (transDataToServerInfo.commandType) {
      case 'node':
        this.compareNodeList(client, transDataToServerInfo.data);
        break;
      case 'command':
        this.compareSimpleOrderList(client, transDataToServerInfo.data);
        break;
      default:
        break;
    }
  }

  /**
   * Main Storage 안에 있는 데이터 중 client와 동일한 객체 반환
   * @param {net.Socket} client
   * @return {msInfo}
   */
  findMsInfoByClient(client) {
    try {
      const foundIt = _.find(this.mainStorageList, msInfo =>
        _.isEqual(msInfo.msClient, client),
      );
      // 해당 객체가 있을 경우만 처리
      if (!foundIt) {
        throw new Error(
          `${client.remoteAddress}는 등록되지 않은 Client 입니다.`,
        );
      }
      return foundIt;
    } catch (error) {
      throw error;
    }
  }

  /**
   * TODO: client가 같은 녀석을 찾고 해당 nodeList와의 데이터를 비교하여 갱신된 데이터가 있을 경우 Socket.io로 전송
   * @param {net.Socket} client
   * @param {nodeInfo[]} nodeList
   */
  compareNodeList(client, nodeList) {
    try {
      /** @type {nodeInfo[]} */
      const renewalList = [];

      const msInfo = this.findMsInfoByClient(client);
      // 수신 받은 노드 리스트를 순회
      _.forEach(nodeList, nodeInfo => {
        const msNodeInfo = _.find(msInfo.msDataInfo.nodeList, {
          node_real_id: nodeInfo.node_real_id,
        });

        // 데이터가 서로 다르다면 갱신된 데이터
        if (!_.isEqual(nodeInfo.data, msNodeInfo.data)) {
          msNodeInfo.data = nodeInfo.data;
          renewalList.push(msNodeInfo);
        }
      });
      return renewalList;
    } catch (error) {
      throw error;
    }
  }

  /**
   * TODO: client가 같은 녀석을 찾고 해당 simpleOrderList와의 데이터를 비교하여 갱신된 데이터가 있을 경우 Socket.io로 전송
   * @param {net.Socket} client
   * @param {simpleOrderInfo[]} simpleOrderList
   */
  compareSimpleOrderList(client, simpleOrderList) {
    try {
      const msInfo = this.findMsInfoByClient(client);
      // 수신 받은 노드 리스트를 순회
      _.forEach(simpleOrderList, simpleOrderInfo => {
        const foundIndex = _.findIndex(msInfo.msDataInfo.simpleOrderList, {
          uuid: simpleOrderInfo.uuid,
        });

        // 데이터가 존재한다면 해당 명령의 변화가 생긴 것
        if (foundIndex !== -1) {
          _.pullAt(msInfo.msDataInfo.simpleOrderList, foundIndex);
        }
        // 신규 데이터는 삽입
        msInfo.msDataInfo.simpleOrderList.push(simpleOrderInfo);
      });
      return msInfo.msDataInfo.simpleOrderList;
    } catch (error) {
      throw error;
    }
  }

  /**
   * TODO: 웹에서 사용자의 명령을 장치로 전송하는 메소드
   * 1. 단일 명령 requestSingleOrderInfo
   * 2. 복합 명령 요청 및 취소 executeOrderInfo
   * 장치로 명령 요청
   */
  requestCommandFromDevice(clientId, requestCommand) {}

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

      if (this.stringfySalternDevice.length) {
        socket.emit('initSalternDevice', this.stringfySalternDevice);
        // socket.emit('initSalternCommand', this.stringfyStandbyCommandSetList);
        socket.emit(
          'initSalternCommand',
          this.stringfyCurrentCommandSet,
          this.stringfyStandbyCommandSetList,
          this.stringfyDelayCommandSetList,
        );
      }

      socket.on('disconnect', () => {});
    });
  }

  /**
   * @param {{commandStorage: Object, deviceStorage: Array.<{category: string, targetId: string, targetName: string, targetData: *}>}} salternDeviceDataStorage
   */
  emitToClientList(salternDeviceDataStorage) {
    try {
      const encodingData = this.defaultConverter.encodingMsg(
        JSON.stringify(salternDeviceDataStorage),
      );

      // BU.CLI(encodingData.slice(encodingData.length - 5));

      this.clientList.forEach(client => {
        client.write(encodingData);
      });
    } catch (error) {
      BU.errorLog('salternDevice', 'emitToClientList', error);
    }
  }

  /**
   *
   * @param {{cmdType: string, hasTrue: boolean, cmdId: string, cmdRank: number=}} jsonData
   */
  processingCommand(jsonData) {
    BU.CLI(jsonData);
    if (jsonData.cmdType === 'AUTOMATIC') {
      const fountIt = _.find(this.map.controlList, {cmdName: jsonData.cmdId});
      if (jsonData.hasTrue) {
        this.controller.excuteAutomaticControl(fountIt);
      } else {
        this.controller.cancelAutomaticControl(fountIt);
      }
    } else if (jsonData.cmdType === 'SINGLE') {
      const orderInfo = {
        modelId: jsonData.cmdId,
        hasTrue: jsonData.hasTrue,
        rank: jsonData.cmdRank,
      };
      this.controller.excuteSingleControl(orderInfo);
    } else if (jsonData.cmdType === 'SCENARIO') {
      if (jsonData.cmdId === 'SCENARIO_1') {
        this.controller.scenarioMode_1(jsonData.hasTrue);
      }
    }
  }
}
module.exports = SocketServer;
