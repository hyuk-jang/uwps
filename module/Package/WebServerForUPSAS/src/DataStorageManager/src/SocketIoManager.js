const _ = require('lodash');
const {BU} = require('base-util-jh');

const uuidv4 = require('uuid/v4');
const Server = require('socket.io');

const map = require('../../../public/Map/map');

// const BiModule = require('../../../models/BiModule');
const webUtil = require('../../../models/web.util.js');

const Control = require('./Control');

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

          // const {nodeList, simpleOrderList} = foundIt.msDataInfo
        }
      });

      // 연결 해제한 Socket 제거
      socket.on('disconnect', () => {
        _.forEach(this.mainStorageList, msInfo =>
          _.remove(msInfo.msUserList, msUserInfo => _.isEqual(msUserInfo.socketClient, socket)),
        );
      });

      socket.on('executeCommand', msg => {
        /** @type {defaultFormatToRequest} */
        const defaultFormatToRequestInfo = msg;

        // uuid 추가
        defaultFormatToRequestInfo.uuid = uuidv4();
        // Main Storage 찾음.
        const msInfo = this.findMainStorageBySession();

        // Socket Client로 명령 전송
        msInfo.msClient.write(this.defaultConverter.encodingMsg(defaultFormatToRequestInfo));
      });

      // socket.on('')

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
    });
  }

  /**
   * 노드 정보에서 UI에 보여줄 내용만을 반환
   * @param {nodeInfo[]} nodeList
   */
  convertSimpleNode(nodeList) {
    const pickList = ['node_id', 'nd_target_name', 'data'];
    return _.map(nodeList, _.pick(pickList));
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
      const {nd_target_id, nd_target_name, nc_is_sensor, node_id, node_name} = nodeInfo;
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

    // BU.CLI(deviceInfoList);
    return deviceInfoList;
  }
}
module.exports = SocketIoManager;
