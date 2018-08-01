const EventEmitter = require('events');
const _ = require('lodash');
const split = require('split');
// const cron = require('cron');
const {BU} = require('base-util-jh');

const net = require('net');
// const AbstDeviceClient = require('device-client-controller-jh');
const {BaseModel} = require('../../../../../../module/device-protocol-converter-jh');

const {dcmWsModel} = require('../../../../../../module/default-intelligence');

const {BM} = require('../../../../../../module/base-model-jh');
const socketServerConfig = require('./config');

class SocketServer extends EventEmitter {
  /**
   *
   * @param {socketServerConfig} config
   */
  constructor(config) {
    super();
    this.config = config || socketServerConfig;

    /** 해당 Socket Serve를 감시하고 있는 객체 */
    this.observerList = [];

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
   * Observer 추가
   * @param {Object} parent
   */
  attach(parent) {
    this.observerList.push(parent);
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
   * Socket Server 구동
   * @param {number} port
   */
  init() {
    const server = net
      .createServer(socket => {
        // socket.end('goodbye\n');
        console.log(
          `client is Connected ${process.env.SOCKET_UPSAS_PORT}\n addressInfo: ${
            socket.remoteAddress
          }`,
        );

        // // TODO: client 식별을 위하여 접속 시 인증과정을 거쳐야함.(uuid 인증을 계획.) 일단 인증 없이 진행 함. - 2018-07-25

        // // FIXME: 임시로 main_seq 1번에 집어 넣음
        // _.forEach(this.mainStorageList, msInfo => {
        //   if (msInfo.msFieldInfo.main_seq === 1) {
        //     msInfo.msClient = socket;
        //   }
        // });

        // steram 연결 및 파서 등록
        const stream = socket.pipe(split(this.defaultConverter.protocolConverter.EOT));
        // 데이터 수신
        stream.on('data', data => {
          try {
            // Parser 가 EOT 까지 삭제하므로 끝에 붙임
            data += this.defaultConverter.protocolConverter.EOT;
            // BU.CLI(data);
            // 수신받은 데이터의 CRC 계산 및 본 데이터 추출
            const strData = this.defaultConverter.decodingMsg(data).toString();
            // BU.CLI(strData);

            // JSON 형태로만 데이터를 받아 들임.
            if (!BU.IsJsonString(strData)) {
              BU.errorLog('socketServer', '데이터가 JSON 형식이 아닙니다.');
              throw new Error('데이터가 JSON 형식이 아닙니다.');
            }

            // JSON 객체로 변환
            /** @type {transDataToServerInfo} */
            const parseData = JSON.parse(strData);
            // BU.CLI(parseData);

            // JSON 객체 분석 메소드 호출
            const hasComplete = this.interpretCommand(socket, parseData);
            // 여기까지 오면 유효한 데이터로 생각하고 완료 처리 (ACK) 메시지 응답
            if (hasComplete) {
              socket.write(
                this.defaultConverter.encodingMsg(this.defaultConverter.protocolConverter.ACK),
              );
            }
          } catch (error) {
            BU.logFile(error);
            socket.write(
              this.defaultConverter.encodingMsg(this.defaultConverter.protocolConverter.CAN),
            );
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
   * Client에서 인증을 하고자 할 경우
   * FIXME: uuid를 통한 인증을 함. Diffle Hellman 으로 추후 변경해야 할 듯
   * @param {net.Socket} client
   * @param {transDataToServerInfo} transDataToServerInfo
   * @return {boolean} 성공 or 실패
   */
  certifyClient(client, transDataToServerInfo) {
    
    const uuid = transDataToServerInfo.data;
    const foundIt = _.find(this.mainStorageList, msInfo =>
      _.isEqual(msInfo.msFieldInfo.uuid, uuid),
    );
    // 인증이 성공했다면 Socket Client를 적용.
    if (foundIt) {
      foundIt.msClient = client;
      return true;
    }
    return false;
  }

  /**
   * Client에서 보내온 데이터를 해석
   * @param {net.Socket} client
   * @param {transDataToServerInfo} transDataToServerInfo
   * @return {boolean} 정상적인 명령 해석이라면 true, 아니라면 throw
   */
  interpretCommand(client, transDataToServerInfo) {
    // BU.CLI(dcmWsModel)
    try {
      const {CERTIFICATION, COMMAND, NODE, STAUTS} = dcmWsModel.transmitToServerCommandType;
      // client를 인증하고자 하는 경우
      if (transDataToServerInfo. commandType === CERTIFICATION) {
        const hasCertification = this.certifyClient(client, transDataToServerInfo);
        // 인증이 실패했다면
        if (!hasCertification) {
          throw new Error('인증에 실패하였습니다.');
        }
        // 인증에 성공하면 true 반환
        return true;
      }
      const msInfo = this.findMsInfoByClient(client);
      if (msInfo) {
        switch (transDataToServerInfo.commandType) {
          case NODE: // 노드 정보가 업데이트 되었을 경우
            this.compareNodeList(msInfo, transDataToServerInfo.data);
            break;
          case COMMAND: // 명령 정보가 업데이트 되었을 경우
            this.compareSimpleOrderList(msInfo, transDataToServerInfo.data);
            break;
          case STAUTS: // 현황판 데이터를 요청할 경우
            this.transmitDataToClient(msInfo.msClient, msInfo.msDataInfo.statusBoard);
            break;
          default:
            throw new Error('등록되지 않은 명령입니다.');
        }
        // 명령 처리가 잘 되었다면 true 반환
        return true;
      }
      throw new Error('사용자 인증이 필요합니다..');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Main Storage 안에 있는 데이터 중 client와 동일한 객체 반환
   * @param {net.Socket} client
   * @return {msInfo}
   */
  findMsInfoByClient(client) {
    try {
      const foundIt = _.find(this.mainStorageList, msInfo => _.isEqual(msInfo.msClient, client));
      // 해당 객체가 있을 경우만 처리
      if (!foundIt) {
        throw new Error(`${client.remoteAddress}는 등록되지 않은 Client 입니다.`);
      }
      return foundIt;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Client로 데이터를 보내는 메소드. data가 null이라면 데이터 전송하지 않음.
   * @param {net.Socket} client
   * @param {Buffer} data
   */
  transmitDataToClient(client, data) {
    try {
      if (!_.isNull(data)) {
        client.write(data);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @desc dcmWsModel.transmitToServerCommandType.NODE 명렁 처리 메소드
   * @param {msInfo} msInfo
   * @param {nodeInfo[]} nodeList
   */
  compareNodeList(msInfo, nodeList) {
    try {
      /** @type {nodeInfo[]} */
      const renewalList = [];
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

      // 업데이트 내역이 있다면 전송
      if (renewalList.length) {
        // Observer가 해당 메소드를 가지고 있다면 전송
        this.observerList.forEach(observer => {
          if (_.get(observer, 'updateNodeList')) {
            observer.updateNodeList(msInfo, renewalList);
          }
        });
      }
      BU.CLI(renewalList);
      return renewalList;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @desc dcmWsModel.transmitToServerCommandType.COMMAND 명렁 처리 메소드
   * @param {msInfo} msInfo
   * @param {simpleOrderInfo[]} simpleOrderList
   */
  compareSimpleOrderList(msInfo, simpleOrderList) {
    try {
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
      BU.CLI(msInfo.msDataInfo.simpleOrderList);

      // Observer가 해당 메소드를 가지고 있다면 전송
      this.observerList.forEach(observer => {
        if (_.get(observer, 'updateSimpleOrderList')) {
          observer.updateSimpleOrderList(msInfo);
        }
      });

      return msInfo.msDataInfo.simpleOrderList;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = SocketServer;
