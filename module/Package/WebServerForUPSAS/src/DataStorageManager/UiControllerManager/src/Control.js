const _ = require('lodash');
const cron = require('cron');
const {BU} = require('base-util-jh');

const config = require('./config');

const map = require('../../../../public/Map/map');

const BiModule = require('../../../../models/BiModule');
const webUtil = require('../../../../models/web.util.js');

const {
  BaseModel,
} = require('../../../../../../module/device-protocol-converter-jh');

const {
  executeCommandType,
} = require('../../../../../../module/default-intelligence').dcmWsModel;

/** 무안 6kW TB */

class Control {
  /** @param {config} mainConfig */
  constructor(mainConfig) {
    this.config = mainConfig || config;
    this.biModule = new BiModule(this.config.dbInfo);

    this.defaultConverter = BaseModel.defaultModule;

    /**
     * Main Storage List에서 각각의 거점 별 모든 정보를 가지고 있을 객체 정보 목록
     * @type {Array.<msInfo>}
     */
    this.mainStorageList = [];

    this.webUtil = webUtil;

    // FIXME: 임시로 자동 명령 리스트 넣어둠. DB에서 가져오는 걸로 수정해야함(2018-07-30)
    this.excuteControlList = map.controlList;
  }

  /**
   * Observer 추가
   * @param {Object} parent
   */
  attach(parent) {
    this.observerList.push(parent);
  }

  /**
   * @desc Step: 1
   * Set Main Storage List
   * @param {msInfo[]} mainStorageList
   */
  setMainStorageList(mainStorageList) {
    this.mainStorageList = mainStorageList;
  }

  /**
   * Web Socket 설정
   * @param {Object} pramHttp
   */
  setSocketIO(pramHttp) {
    this.io = require('socket.io')(pramHttp);
    this.io.on('connection', socket => {
      socket.on('executeCommand', msg => {
        /** @type {transCommandToClient} */
        const executeCommandMsg = msg;

        // switch (executeCommandMsg.cmdType) {
        //   case executeCommandType.SINGLE:
        //     break;

        //   default:
        //     break;
        // }

        const msInfo = this.findMainStorageBySession();

        msInfo.msClient.write(this.defaultConverter.encodingMsg(msg));

        // // Observer에게 명령 요청이 발생했음을 알림
        // this.observerList.forEach(observer => {
        //   if (_.get(observer, 'executeCommand')) {
        //     observer.executeCommand(msInfo, encodingMsg);
        //   }
        // });
      });

      // socket.on('')

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
   * FIXME: 요청한 Session 정보에 따라 추출하는 것 필요
   *
   * @param {Session} session
   */
  findMainStorageBySession(session) {
    try {
      const foundIt = _.find(this.mainStorageList, msInfo =>
        _.includes(msInfo.msFieldInfo.uuid, 'aaaaa'),
      );
      // const foundIt = _.find(this.mainStorageList, msInfo =>
      //   _.includes(msInfo.msSessionList, session),
      // );
      if (foundIt) {
        return foundIt;
      }
      throw new Error(`해당 session은 등록되지 않았습니다.${session}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장치 목록 및 장치 데이터 전송
   * @param {Session} session
   */
  getDeviceList(session) {
    const msInfo = this.findMainStorageBySession(session);

    const deviceInfoList = [
      // {
      //   type: '',
      //   list: [],
      //   template: '',
      // },
    ];

    const compiledDeviceType = _.template(
      '<option value="<%= nd_target_id %>"> <%= nd_target_name %></option>',
    );

    msInfo.msDataInfo.nodeList.forEach(nodeInfo => {
      const {
        nd_target_id,
        nd_target_name,
        nc_is_sensor,
        node_id,
        node_name,
      } = nodeInfo;
      // 센서가 아닌 장비만 등록
      if (nc_is_sensor === 0) {
        let foundIt = _.find(deviceInfoList, {type: nd_target_id});

        if (_.isEmpty(foundIt)) {
          // const onOffList = ['pump'];
          foundIt = {
            type: nd_target_id,
            list: [],
            template: compiledDeviceType({nd_target_id, nd_target_name}),
            controlType: [],
          };
          deviceInfoList.push(foundIt);
        }
        const compiledDeviceList = _.template(
          '<option value="<%= node_id %>"><%= node_name %></option>',
        );

        foundIt.list.push(compiledDeviceList({node_id, node_name}));
      }
    });

    BU.CLI(deviceInfoList);
    return deviceInfoList;
  }

  /**
   * 외부에서 단일 명령을 내릴경우
   * @param {requestSingleOrderInfo} requestSingleOrderInfo
   */
  executeSingleControl(requestSingleOrderInfo) {}

  /**
   * 저장된 명령 요청 수행
   * @param {string} savedCommandId 저장된 명령 ID
   * @param {string} requestCommandType  'CONTROL', 'CANCEL' --> 명령 추가, 명령 삭제
   */
  executeSavedCommand(savedCommandId, requestCommandType) {}

  /**
   * 시나리오를 수행하고자 할 경우
   * @param {string} scenarioId 시나리오 ID
   * @param {string} requestCommandType  'CONTROL', 'CANCEL' --> 명령 추가, 명령 삭제
   */
  executeScenario(scenarioId, requestCommandType) {}

  /**
   * 자동 명령 요청
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo
   */
  executeAutomaticControl(controlInfo) {
    BU.CLI(controlInfo);

    /** @type {requestCombinedOrderInfo} */
    const requestCombinedOrder = {
      requestCommandId: controlInfo.cmdName,
      requestCommandName: controlInfo.cmdName,
      requestCommandType: requestOrderCommandType.CONTROL,
      requestElementList: [],
    };

    // 장치 True 요청
    const trueList = _.get(controlInfo, 'trueList', []);
    if (trueList.length) {
      requestCombinedOrder.requestElementList.push({
        controlValue: requestDeviceControlType.TRUE,
        nodeId: controlInfo.trueList,
        rank: 2,
      });
    }

    // 장치 False 요청
    const falseList = _.get(controlInfo, 'falseList', []);
    if (falseList.length) {
      requestCombinedOrder.requestElementList.push({
        controlValue: requestDeviceControlType.FALSE,
        nodeId: controlInfo.falseList,
        rank: 2,
      });
    }

    return this.executeCombineOrder(requestCombinedOrder);
  }

  /**
   * 명령 취소 요청
   * @param {{cmdName: string, trueList: string[], falseList: string[]}} controlInfo
   */
  cancelAutomaticControl(controlInfo) {
    /** @type {requestCombinedOrderInfo} */
    const requestCombinedOrder = {
      requestCommandId: controlInfo.cmdName,
      requestCommandName: controlInfo.cmdName,
      requestCommandType: requestOrderCommandType.CANCEL,
      requestElementList: [],
    };

    // 장치 False 요청 (켜져 있는 장치만 끔)
    const trueList = _.get(controlInfo, 'trueList', []);
    if (trueList.length) {
      requestCombinedOrder.requestElementList.push({
        controlValue: requestDeviceControlType.FALSE,
        nodeId: _.reverse(trueList),
        rank: 2,
      });
    }

    // FIXME: 명령 취소에 대한 논리 정립이 안되어 있어 다시 동작 시키는 명령은 비활성
    // 장치 True 요청
    // const falseList = _.get(controlInfo, 'falseList', []);
    // if (falseList.length) {
    //   requestCombinedOrder.requestElementList.push({
    //     controlValue: requestDeviceControlType.TRUE,
    //     nodeId: _.reverse(falseList),
    //     rank: 2,
    //   });
    // }

    return this.executeCombineOrder(requestCombinedOrder);
  }
}
module.exports = Control;
