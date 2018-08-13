const _ = require('lodash');

const {BU} = require('base-util-jh');
const moment = require('moment');
const Promise = require('bluebird');

const BiModule = require('./BiModule');

class BiDevice extends BiModule {
  /** @param {dbInfo} dbInfo */
  constructor(dbInfo) {
    super(dbInfo);

    this.dbInfo = dbInfo;
  }

  /**
   * 장소 시퀀스를 기준으로 관련된 현재 데이터를 모두 가져옴
   * @param {{place_seq: number}[]} receiveObjList
   * @param {string} pickId nd_target_id 입력
   */
  async extendsPlaceDeviceData(receiveObjList, pickId) {
    // 장소 SeqList 추출
    const placeSeqList = _.map(receiveObjList, receiveDataInfo =>
      _.get(receiveDataInfo, 'place_seq'),
    );
    // BU.CLI(placeSeqList);
    // 추출된 seqList를 기준으로 장소 관계를 불러옴
    const placeList = await this.getTable('v_dv_place_relation', {place_seq: placeSeqList}, true);
    // BU.CLI(placeList);
    // 장소 관계에 관련된 내용이 없다면 그냥 반환
    if (_.isEmpty(placeList)) {
      return receiveObjList;
    }
    // 검색 조건에 맞는 데이터
    const filteringPlaceList = _.filter(placeList, {nd_target_id: pickId});
    // BU.CLI(filteringPlaceList);

    // 검색 조건에 맞는 데이터가 없다면 그냥 반환
    if (_.isEmpty(filteringPlaceList)) {
      return receiveObjList;
    }

    // 검색 조건에 맞는 Node Seq 목록을 만듬
    const nodeSeqList = _.map(filteringPlaceList, 'node_seq');
    // BU.CLI(nodeSeqList);

    // 장소 관계 리스트에서 nodeSeq 리스트를 추출하고 해당 장치의 최신 데이터를 가져옴
    const nodeDataList = await this.getTable('v_dv_sensor_profile', {
      node_seq: nodeSeqList,
    });
    // 검색된 노드가 없다면 그냥 반환
    if (_.isEmpty(nodeDataList)) {
      return receiveObjList;
    }

    const now = moment();
    // 검색 결과 노드를 순회
    _.forEach(nodeDataList, nodeInfo => {
      // 장소 정보 테이블 Row 정보
      const filteringPlaceInfo = _.find(filteringPlaceList, {node_seq: nodeInfo.node_seq});
      // 수신 받은 데이터 객체 정보
      const receiveObj = _.find(receiveObjList, {place_seq: filteringPlaceInfo.place_seq});

      const diffNum = now.diff(moment(nodeInfo.writeDate), 'minutes');
      // 10분을 벗어나면 데이터 가치가 없다고 판단
      if (diffNum < 10) {
        // 키 확장
        _.assign(receiveObj, {[pickId]: _.get(nodeInfo, 'node_data')});
      } else {
        _.assign(receiveObj, {[pickId]: null});
      }
    });

    // BU.CLI(receiveObjList);
    return receiveObjList;
  }
}
module.exports = BiDevice;
