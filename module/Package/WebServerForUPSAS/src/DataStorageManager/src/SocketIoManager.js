const _ = require('lodash');
const { BU } = require('base-util-jh');

const uuidv4 = require('uuid/v4');
const Server = require('socket.io');

const net = require('net');
const map = require('../../../public/Map/map');

// const BiModule = require('../../../models/BiModule');
const webUtil = require('../../../models/web.util.js');

const Control = require('./Control');

const {
  wrapCmdType,
  complexCmdStep,
  contractCmdStatus,
} = require('../../../../../../../module/default-intelligence').dcmConfigModel;
/** 무안 6kW TB */

class SocketIoManager {
  /** @param {Control} controller */
  constructor(controller) {
    // controller에서 받아옴
    this.controller = controller;
    this.defaultConverter = controller.defaultConverter;
    this.mainStorageList = controller.mainStorageList;

    this.webUtil = webUtil;

    // FIXME: 임시로 자동 명령 리스트 넣어둠. DB에서 가져오는 걸로 수정해야함(2018-07-30)
    this.excuteControlList = map.controlList;
  }

  /**
   * Web Socket 설정
   * @param {Object} httpObj
   */
  setSocketIO(httpObj) {
    this.io = new Server(httpObj);

    this.io.on('connection', socket => {
      // 접속한 Socket 등록
      socket.on('certifySocket', target => {
        /** @type {msUserInfo} */
        const msUser = target;
        // 접속한 Socket 정보 정의
        msUser.socketClient = socket;

        // Main 정보(거점)의 ID가 동일한 객체 탐색
        const foundIt = _.find(this.mainStorageList, msInfo =>
          _.isEqual(msInfo.msFieldInfo.main_seq, msUser.sessionUserInfo.main_seq),
        );

        // 거점을 찾을 경우 초기 값을 보내줌.
        if (foundIt) {
          foundIt.msUserList.push(msUser);

          const { contractCmdList = [] } = foundIt.msDataInfo;

          let connectedStatus = 'Disconnected';
          if (foundIt.msClient instanceof net.Socket) {
            connectedStatus = 'Connected';
          }

          const pickedNodeList = this.pickNodeList(foundIt.msDataInfo);
          // BU.CLI(pickedNodeList);
          socket.emit('updateMsClientStatus', connectedStatus);
          socket.emit('updateNode', pickedNodeList);
          socket.emit('updateCommand', contractCmdList);
          // socket.emit('updateCommand', this.pickContractCmdList(contractCmdList));
        }
      });

      // 연결 해제한 Socket 제거
      socket.on('disconnect', () => {
        _.forEach(this.mainStorageList, msInfo =>
          _.remove(msInfo.msUserList, msUserInfo => _.isEqual(msUserInfo.socketClient, socket)),
        );
      });

      socket.on('executeCommand', msg => {
        // BU.CLI(msg)
        /** @type {defaultFormatToRequest} */
        const defaultFormatToRequestInfo = msg;

        // uuid 추가
        defaultFormatToRequestInfo.uuid = uuidv4();
        // Main Storage 찾음.
        const msInfo = this.findMainStorageBySocketClient(socket);

        // Data Logger와 연결이 되어야만 명령 요청 가능
        if (msInfo && msInfo.msClient instanceof net.Socket) {
          // Socket Client로 명령 전송
          msInfo.msClient.write(this.defaultConverter.encodingMsg(defaultFormatToRequestInfo));
        }
      });
    });
  }

  /**
   * 노드 정보에서 UI에 보여줄 내용만을 반환
   * @param {msDataInfo} dataInfo
   */
  pickNodeList(dataInfo) {
    const pickList = ['node_id', 'nd_target_name', 'data'];
    return _(dataInfo.nodeList)
      .map(nodeInfo => {
        const placeNameList = _(dataInfo.placeList)
          .filter(placeInfo => placeInfo.node_real_id === nodeInfo.node_real_id)
          .map(pInfo => pInfo.place_name)
          .value();
        //  _.filter(dataInfo.placeList, placeInfo => {
        //   placeInfo.node_real_id === nodeInfo.node_real_id;
        // })
        return _(nodeInfo)
          .pick(pickList)
          .assign({ place_name_list: placeNameList })
          .value();
      })
      .sortBy('node_id')
      .value();
  }

  /**
   * 노드 정보에서 UI에 보여줄 내용만을 반환
   * @param {complexCmdWrapInfo[]} complexCmdWrapList
   */
  pickContractCmdList(complexCmdWrapList) {
    // const pickList = ['wrapCmdType', 'complexCmdStep', 'commandId', 'commandName'];
    // const returnValue = _.map(complexCmdWrapList, complexCmdWrapInfo => {
    //   const { wrapCmdType, wrapCmdStep } = complexCmdWrapInfo;
    //   // const pickInfo = _.pick(complexCmdWrapInfo, pickList);
    //   // 명령 타입 한글로 변경
    //   switch (wrapCmdType) {
    //     case wrapCmdType.CONTROL:
    //       complexCmdWrapInfo.wrapCmdType = '명령 제어';
    //       break;
    //     case wrapCmdType.RESTORE:
    //       complexCmdWrapInfo.wrapCmdType = '명령 복구';
    //       break;
    //     case wrapCmdType.CANCEL:
    //       complexCmdWrapInfo.wrapCmdType = '명령 취소';
    //       break;
    //     case wrapCmdType.MEASURE:
    //       complexCmdWrapInfo.wrapCmdType = '계측';
    //       break;
    //     default:
    //       complexCmdWrapInfo.wrapCmdType = '알수없음';
    //       break;
    //   }
    //   // 명령 상태 한글로 변경
    //   switch (wrapCmdStep) {
    //     case complexCmdStep.WAIT:
    //       complexCmdWrapInfo.wrapCmdStep = '대기 중';
    //       break;
    //     case complexCmdStep.PROCEED:
    //       complexCmdWrapInfo.wrapCmdStep = '진행 중';
    //       break;
    //     case complexCmdStep.RUNNING:
    //       complexCmdWrapInfo.wrapCmdStep = '실행 중';
    //       break;
    //     default:
    //       complexCmdWrapInfo.wrapCmdStep = '알수없음';
    //       break;
    //   }
    //   return complexCmdWrapInfo;
    // });
    // return _.sortBy(returnValue, 'index');
  }

  /**
   * 접속한 SocketIO 객체 정보가 등록된 Main Storage를 반환
   * @param {net.Socket} socket
   */
  findMainStorageBySocketClient(socket) {
    return _.find(this.mainStorageList, msInfo =>
      _.find(msInfo.msUserList, { socketClient: socket }),
    );
  }

  /**
   * Data Logger 상태를 io Client로 보냄
   * @param {msInfo} msInfo
   */
  submitMsClientStatus(msInfo) {
    let connectedStatus = 'Disconnected';
    if (msInfo.msClient instanceof net.Socket) {
      connectedStatus = 'Connected';
    }
    // 해당 Socket Client에게로 데이터 전송
    msInfo.msUserList.forEach(clientInfo => {
      clientInfo.socketClient.emit('updateMsClientStatus', connectedStatus);
    });
  }

  /**
   * 등록되어져 있는 노드 리스트를 io Client로 보냄.
   * @param {msInfo} msInfo
   */
  submitNodeList(msInfo) {
    const simpleNodeList = this.pickNodeList(msInfo.msDataInfo);
    // 해당 Socket Client에게로 데이터 전송
    msInfo.msUserList.forEach(clientInfo => {
      clientInfo.socketClient.emit('updateNode', simpleNodeList);
    });
  }

  /**
   * 현재 수행중인 명령 리스트를 io Client로 보냄
   * @param {msInfo} msInfo
   */
  submitCommandList(msInfo) {
    // const pickedOrderList = this.pickContractCmdList(msInfo.msDataInfo.contractCmdList);
    // 해당 Socket Client에게로 데이터 전송
    msInfo.msUserList.forEach(clientInfo => {
      clientInfo.socketClient.emit('updateCommand', msInfo.msDataInfo.contractCmdList);
    });
  }

  /**
   * 현재 수행중인 명령 리스트를 io Client로 보냄
   * @param {msInfo} msInfo
   * @param {defaultFormatToResponse} execCommandResultInfo
   */
  submitExecCommandResult(msInfo, execCommandResultInfo) {
    // const pickedOrderList = this.pickContractCmdList(msInfo.msDataInfo.contractCmdList);

    msInfo.msUserList.forEach(clientInfo => {
      clientInfo.socketClient.emit('resultExecCommand', execCommandResultInfo.message);
    });
    // 해당 Socket Client에게로 데이터 전송
  }

  /**
   * 장치 목록 및 장치 데이터 전송
   * @param {Session} session
   */
  getDeviceList(session) {
    const msInfo = this.findMainStorageBySocketClient(session);

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
      const { nd_target_id, nd_target_name, nc_is_sensor, node_id, node_name } = nodeInfo;
      // 센서가 아닌 장비만 등록
      if (nc_is_sensor === 0) {
        let foundIt = _.find(deviceInfoList, { type: nd_target_id });

        if (_.isEmpty(foundIt)) {
          // const onOffList = ['pump'];
          foundIt = {
            type: nd_target_id,
            list: [],
            template: compiledDeviceType({ nd_target_id, nd_target_name }),
            controlType: [],
          };
          deviceInfoList.push(foundIt);
        }
        const compiledDeviceList = _.template(
          '<option value="<%= node_id %>"><%= node_name %></option>',
        );

        foundIt.list.push(compiledDeviceList({ node_id, node_name }));
      }
    });

    // BU.CLI(deviceInfoList);
    return deviceInfoList;
  }
}
module.exports = SocketIoManager;
