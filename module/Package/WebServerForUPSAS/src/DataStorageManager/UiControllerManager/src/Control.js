const _ = require('lodash');
const cron = require('cron');
const {BU} = require('base-util-jh');

const config = require('./config');

const BiModule = require('../../../../models/BiModule');
const webUtil = require('../../../../models/web.util.js');

const {
  BaseModel,
} = require('../../../../../../module/device-protocol-converter-jh');

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
      socket.on('excuteSalternControl', msg => {
        const encodingMsg = this.defaultConverter.encodingMsg(msg);

        !_.isEmpty(this.client) &&
          this.write(encodingMsg).catch(err => {
            BU.logFile(err);
          });
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

  // Cron 구동시킬 시간
  runCronCalcPowerStatus() {
    try {
      if (this.cronScheduler !== null) {
        // BU.CLI('Stop')
        this.cronScheduler.stop();
      }
      // 1분마다 현황판 데이터 갱신
      this.cronScheduler = new cron.CronJob({
        cronTime: '* */1 * * * *',
        onTick: () => {
          this.requestCalcPowerStatus();
        },
        start: true,
      });
      return true;
    } catch (error) {
      throw error;
    }
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
  executeSingleControl(requestSingleOrderInfo) {
    try {
      /** @type {requestCombinedOrderInfo} */
      const requestCombinedOrder = {
        requestCommandId: '',
        requestCommandName: '',
        requestCommandType: requestSingleOrderInfo.requestCommandType,
        requestElementList: [],
      };

      /** @type {requestOrderElementInfo} */
      const requestOrderElement = {
        controlValue: requestSingleOrderInfo.controlValue,
        controlSetValue: requestSingleOrderInfo.controlSetValue,
        nodeId: requestSingleOrderInfo.nodeId,
        rank: _.get(requestSingleOrderInfo, 'rank'),
      };

      requestCombinedOrder.requestElementList.push(requestOrderElement);

      return this.executeCombineOrder(requestCombinedOrder);
    } catch (error) {
      BU.errorLog('excuteControl', 'Error', error);
    }
  }

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
