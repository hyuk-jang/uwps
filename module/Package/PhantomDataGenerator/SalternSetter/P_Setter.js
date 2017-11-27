const Promise = require('bluebird')
const _ = require('underscore');

const map = require('./map.json');

const bmjh = require('base-model-jh');
const bcjh = require('base-class-jh');
const BU = require('base-util-jh').baseUtil;

class P_Setter extends bmjh.BM {
  constructor(controller) {
    super(controller.config.dbInfo);
    this.controller = controller;

    this.structureInfo = this.controller.config.device_structure;
    this.configUpms = this.controller.config.UPMS;

    this.mapImgInfo = map.MAP;
    this.mapSetInfo = map.SETINFO;
    this.mapRelation = map.RELATION;

  }

  async init() {

    console.time('setDeviceStructure')
    await this.setDeviceStructure(this.structureInfo);
    console.timeEnd('setDeviceStructure')

    console.time('setDeviceInfo')
    await this.setDeviceInfo(this.mapSetInfo);
    console.timeEnd('setDeviceInfo')

    console.time('setSalternObject')
    await this.setSalternObject(this.mapRelation);
    console.timeEnd('setSalternObject')

    console.time('setUnderwaterPhotovoltaic')
    await this.setUnderwaterPhotovoltaic(this.configUpms);
    console.timeEnd('setUnderwaterPhotovoltaic')
  }


  /**
   * 저장소에 저장된 내역을 기준으로 insert, update 수행 후 Promise 반환
   * @param {Object} storage TempStroage Class Object
   * @param {String} tblName 
   * @param {String} updateKey 
   * @return {Promise}
   */
  async doQuery(storage, tblName, updateKey, hasViewQuery) {
    let finalStorage = storage.getFinalStorage();

    await this.setTables(tblName, finalStorage.insertObjList, hasViewQuery);

    await this.updateTablesByPool(tblName, updateKey, finalStorage.updateObjList);

    return true;
  }

  // 장치 구성 정보 설정
  async setDeviceStructure(structureInfoList) {
    let tempStorage = new bcjh.db.TempStorage();
    let deviceStructureList = await this.getTable('device_structure');

    tempStorage.initAlreadyStorage(deviceStructureList);

    structureInfoList.forEach(structureInfo => {
      tempStorage.addStorage(structureInfo, 'structure_header', 'device_structure_seq');
    });

    return this.doQuery(tempStorage, 'device_structure', 'device_structure_seq');
  }


  // 염전 설정 장비 세팅
  async setDeviceInfo(mapSetInfo) {
    let tempStorage = new bcjh.db.TempStorage();

    let regx = /\d/;
    let deviceStructureList = await this.getTable('device_structure');
    let salternDeviceInfoList = await this.getTable('saltern_device_info');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(salternDeviceInfoList);

    _.each(mapSetInfo, category => {
      _.each(category, deviceInfo => {
        let regExec = regx.exec(deviceInfo.ID);
        let headerName = deviceInfo.ID.substr(0, regExec.index);

        let submitDataObj = {
          device_structure_seq: _.findWhere(deviceStructureList, {
            structure_header: headerName
          }).device_structure_seq,
          target_id: deviceInfo.ID,
          target_name: this.findTargetName('ID', deviceInfo.ID),
          device_type: deviceInfo.DeviceType === 'Serial' ? 'serial' : 'socket',
          board_id: deviceInfo.BoardID ? deviceInfo.BoardID : '',
          port: deviceInfo.Port
        }

        tempStorage.addStorage(submitDataObj, 'target_id', 'saltern_device_info_seq');
      })
    })

    return this.doQuery(tempStorage, 'saltern_device_info', 'saltern_device_info_seq');
  }


  /********************************/
  //        Set Relation
  /********************************/

  // 염전 구성 객체 세팅(saltern_block, brine_warehouse, reservoir, sea, waterway)
  async setSalternObject(mapRelation) {
    let keyInfo = {
      saltern_block: 'SaltPlateData',
      brine_warehouse: 'WaterTankData',
      sea: 'WaterOutData',
      reservoir: 'ReservoirData',
      waterway: 'WaterWayData'
    }

    await Promise.all([
      this.setSalternBlock(mapRelation[keyInfo.saltern_block]),
      this.setBrineWarehouse(mapRelation[keyInfo.brine_warehouse]),
      this.setSea(mapRelation[keyInfo.sea]),
      this.setReservoir(mapRelation[keyInfo.reservoir]),
      this.setWaterway(mapRelation[keyInfo.waterway]),
    ])

    await this.setRelationSaltern(keyInfo, this.mapRelation);

    return true;
  }

  // 염판 설정
  async setSalternBlock(relationObjectList) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('saltern_block');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 염판 세팅
    _.each(relationObjectList, relationInfo => {
      let submitDataObj = {
        target_id: relationInfo.ID,
        target_type: relationInfo.PlateType.includes('Evaporating') ? 'concentration' : 'crystalizing',
        target_name: this.findTargetName('ID', relationInfo.ID),
        setting_salinity: typeof relationInfo.SettingSalinity === 'number' ? relationInfo.SettingSalinity : 0,
        water_level_count: typeof relationInfo.WaterLevelCount === 'number' ? relationInfo.WaterLevelCount : 0,
        min_water_level: relationInfo.MinWaterLevel,
        max_water_level: relationInfo.MaxWaterLevel,
        water_cm: '',
        depth: relationInfo.Depth
      }
      tempStorage.addStorage(submitDataObj, 'target_id', 'saltern_block_seq');
    })
    return this.doQuery(tempStorage, 'saltern_block', 'saltern_block_seq');

  }

  // 해주 설정
  async setBrineWarehouse(relationObjectList) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('brine_warehouse');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 염판 세팅
    _.each(relationObjectList, relationInfo => {
      let submitDataObj = {
        target_id: relationInfo.ID,
        target_type: relationInfo.TankType.includes('Evaporating') ? 'concentration' : 'crystalizing',
        target_name: this.findTargetName('ID', relationInfo.ID),
        setting_salinity: typeof relationInfo.SettingSalinity === 'number' ? relationInfo.SettingSalinity : 0,
        min_water_level: relationInfo.MinWaterLevel,
        max_water_level: relationInfo.MaxWaterLevel,
        water_cm: '',
        depth: relationInfo.Depth
      }
      tempStorage.addStorage(submitDataObj, 'target_id', 'brine_warehouse_seq');
    })
    return this.doQuery(tempStorage, 'brine_warehouse', 'brine_warehouse_seq');

  }

  // 바다 설정
  async setSea(relationObjectList) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('sea');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 염판 세팅
    _.each(relationObjectList, relationInfo => {
      let submitDataObj = {
        target_id: relationInfo.ID,
        target_name: this.findTargetName('ID', relationInfo.ID),
        depth: relationInfo.Depth
      }
      tempStorage.addStorage(submitDataObj, 'target_id', 'sea_seq');
    })
    return this.doQuery(tempStorage, 'sea', 'sea_seq');

  }

  // 저수지 설정
  async setReservoir(relationObjectList) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('reservoir');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 염판 세팅
    _.each(relationObjectList, relationInfo => {
      let submitDataObj = {
        target_id: relationInfo.ID,
        target_name: this.findTargetName('ID', relationInfo.ID),
        depth: relationInfo.Depth
      }
      tempStorage.addStorage(submitDataObj, 'target_id', 'reservoir_seq');
    })
    return this.doQuery(tempStorage, 'reservoir', 'reservoir_seq');

  }
  // 수로 설정
  async setWaterway(relationObjectList) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('waterway');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 수로 세팅
    _.each(relationObjectList, relationInfo => {
      let submitDataObj = {
        target_id: relationInfo.ID,
        target_name: this.findTargetName('ID', relationInfo.ID),
        depth: relationInfo.Depth
      }
      tempStorage.addStorage(submitDataObj, 'target_id', 'waterway_seq');
    })
    return this.doQuery(tempStorage, 'waterway', 'waterway_seq');

  }

  async setRelationSaltern(sscsObject, mapRelation) {
    // BU.CLI(sscsObject)

    // 1. saltern_device_info 가져옴
    let salternDeviceInfo = await this.getTable('saltern_device_info');

    // 2. Saltern Relation Object Table 가져옴
    let alreadyTableName = Object.keys(sscsObject);
    let sscsTableList = await Promise.map(alreadyTableName, key => {
      return Promise.props({
        [key]: this.getTable(key)
      });
    })

    let sscsTables = {};
    _.each(sscsTableList, sscsTbl => {
      Object.assign(sscsTables, sscsTbl);

    })

    // 3. 기존 Table 불러옴
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable('relation_saltern');
    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 4. device_info 순회 조회. 관계 있다면 업데이트
    salternDeviceInfo.forEach(ele => {
      // 최종 넣을 데이터
      let submitObj = {
        saltern_device_info_seq: ele.saltern_device_info_seq,
        device_structure_seq: ele.device_structure_seq,
        saltern_block_seq: null,
        sea_seq: null,
        reservoir_seq: null,
        brine_warehouse_seq: null,
        waterway_seq: null
      }
      // 조회하고자 하는 id
      let targetId = ele.target_id;
      // SaltPlateData, WaterTankData, WaterOutData, ....
      for (let relCategory in mapRelation) {
        // BU.CLI('relCategory', relCategory)
        mapRelation[relCategory].forEach(relationObj => {
          // ListModuleTemperature, ListWaterDoor, ListWaterLevel ....
          for (let relKey in relationObj) {
            // List Type이고 해당 Value를 가지고 있다면 해당 객체가 장비를 포함하고 있다고 판단
            if (Array.isArray(relationObj[relKey]) && relationObj[relKey].length && relationObj[relKey].includes(targetId)) {
              // 부모 객체 ID 가져옴
              let parentId = relationObj.ID;
              // BU.CLI(parentId)
              // ex) SaltPlateData --> saltern_block (정해진 key로 변환)
              // BU.CLI('relKey', relKey, relationObj[relKey], targetId)
              let cateKey = '';
              _.each(sscsObject, (ele, key) => {
                if(ele === relCategory){
                  cateKey = key;
                }
              })
              // BU.CLIS(sscsTables[cateKey], cateKey)
              // db에 저장되어 있는 데이터 카테고리 중 중 target_id가 같은 obj 가져옴
              let findObj = _.findWhere(sscsTables[cateKey], {
                target_id: parentId
              });
              // 찾은 데이터가 있따면 해당 seq 추가
              if (!_.isEmpty(findObj)) {
                submitObj[`${cateKey}_seq`] = findObj[`${cateKey}_seq`];
              }
            }
          }
        })
      }
      // BU.CLI(submitObj)
      tempStorage.addStorage(submitObj, 'saltern_device_info_seq', 'relation_saltern_seq');
    })
    return this.doQuery(tempStorage, 'relation_saltern', 'relation_saltern_seq')
  }







  /********************************/
  //        Set Underwater Photovoltaic Measure System
  /********************************/

  async setUnderwaterPhotovoltaic(configUpms) {
    await this.setBase(configUpms.photovoltaic, 'photovoltaic', 'target_id')
    await this.setBase(configUpms.connector, 'connector', 'target_id')
    await this.setBase(configUpms.inverter, 'inverter', 'target_id')

    await this.setRelationUpms(configUpms.relationUPMS)
    return true;
  }






  // 기본 설정
  async setBase(list, tblName, id) {
    let tempStorage = new bcjh.db.TempStorage();
    let alreadyDataList = await this.getTable(tblName);

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 세팅
    _.each(list, infoObj => {
      let submitDataObj = infoObj;
      tempStorage.addStorage(submitDataObj, id, `${tblName}_seq`);
    })

    // BU.CLI(tempStorage.getFinalStorage())
    return this.doQuery(tempStorage, tblName, `${tblName}_seq`);

  }

  // 관계 설정
  async setRelationUpms(list) {
    let tempStorage = new bcjh.db.TempStorage();
    let photovoltaicList = await this.getTable('photovoltaic');
    let saltern_blockList = await this.getTable('saltern_block');
    let connectorList = await this.getTable('connector');
    let inverterList = await this.getTable('inverter');

    let alreadyDataList = await this.getTable('relation_upms');

    // 존재 저장소 설정
    tempStorage.initAlreadyStorage(alreadyDataList);

    // 세팅
    _.each(list, infoObj => {
      let findPhotovoltaic = _.findWhere(photovoltaicList, {
        target_id: infoObj.photovoltaicId
      });
      let findSalternBlock = _.findWhere(saltern_blockList, {
        target_id: infoObj.salternBlockId
      });
      let findConnector = _.findWhere(connectorList, {
        target_id: infoObj.connectorId
      });
      let findInverter = _.findWhere(inverterList, {
        target_id: infoObj.inverterId
      });

      let submitDataObj = {
        photovoltaic_seq: findPhotovoltaic == null ? null : findPhotovoltaic.photovoltaic_seq,
        saltern_block_seq: findSalternBlock == null ? null : findSalternBlock.saltern_block_seq,
        connector_seq: findConnector == null ? null : findConnector.connector_seq,
        inverter_seq: findInverter == null ? null : findInverter.inverter_seq,
        connector_ch: infoObj.connector_ch
      };
      tempStorage.addStorage(submitDataObj, 'photovoltaic_seq', 'photovoltaic_seq');
    })

    // BU.CLI(tempStorage.getFinalStorage())
    return this.doQuery(tempStorage, 'relation_upms', 'photovoltaic_seq', false);
  }




  /********************************/
  //        Set Underwater Photovoltaic Measure System
  /********************************/





  // map Img 설정 정보에서 정의한 이름을 찾아줌
  findTargetName(key, value) {
    let returnvalue = '';
    _.each(this.mapImgInfo, category => {
      if (typeof category === 'object') {
        category.some(obj => {
          if (obj[key] == value) {
            returnvalue = obj.Name;
          }
        })
      }
    })
    return returnvalue;
  }


}
module.exports = P_Setter;