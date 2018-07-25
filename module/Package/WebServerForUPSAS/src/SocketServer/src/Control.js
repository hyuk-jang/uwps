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

    this.map = this.controller.map;

    this.defaultConverter = BaseModel.defaultModule;

    this.init();

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
   * Socket Server 구동
   * @param {number} port
   */
  init() {
    const server = net
      .createServer(socket => {
        // socket.end('goodbye\n');
        console.log(`client is Connected ${this.port}`);

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

            // 만약 json 형태라면
            if (BU.IsJsonString(strData)) {
              JSON.parse(strData);
            }
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
    server.listen(this.port, () => {
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
