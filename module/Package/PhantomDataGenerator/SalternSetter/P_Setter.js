const _ = require('underscore');
const Bi = require('./Bi.js');
const map = require('./map.json');

const bmjh = require('base-model-jh');
const Promise = require('bluebird')
const BU = require('base-util-jh').baseUtil;

const TempStorage = require('./TempStorage');

class P_Setter extends bmjh.BM {
  constructor(controller) {
    super(controller.config.dbInfo);
    this.controller = controller;

    this.structureInfo = this.controller.config.device_structure;

    this.mapImgInfo = map.MAP;
    this.mapSetInfo = map.SETINFO;
    this.mapRelation = map.RELATION;

    this.bi = new Bi(this.controller.config.dbInfo);

  }

  async init() {
    // console.log(this.mapSetInfo)
    console.time('setDeviceStructure')
    await this.setDeviceStructure(this.structureInfo);
    console.timeEnd('setDeviceStructure')
    console.time('setDeviceInfo')
    await this.setDeviceInfo(this.mapSetInfo);
    console.timeEnd('setDeviceInfo')
    

    return;

    // 장치 구성 정보
    setTimeout(() => {
      this.setDeviceStructure();
    }, 1000);


    // 염전 설정 장비 
    setTimeout(() => {
      this.setDeviceInfo();
    }, 1000 * 2);


    // 염판 설정
    setTimeout(() => {
      this.setRelationInfo();
    }, 1000 * 3);


    // 모듈 정보
    setTimeout(() => {
      this.setPhotovoltaic();
    }, 1000 * 4);


    // 접속반
    setTimeout(() => {
      this.setConnector();
    }, 1000 * 5);


    setTimeout(() => {
      this.setInverter();
    }, 1000 * 6);


  }


  /**
   * 저장소에 저장된 내역을 기준으로 insert, update 수행 후 Promise 반환
   * @param {Object} storage TempStroage Class Object
   * @param {String} tblName 
   * @param {String} updateKey 
   * @return {Promise}
   */
  async doQuery(storage, tblName, updateKey) {
    let finalStorage = storage.getFinalStorage();

    if (finalStorage.insertObjList.length) {
      await this.setTables(tblName, finalStorage.insertObjList);
    } 
    
    if (finalStorage.updateObjList.length) {
      return new Promise(resolve => {
        Promise.map(finalStorage.updateObjList, updateObj => {
            // BU.CLI(updateObj)
            return this.updateTable(tblName, {
              key: updateKey,
              value: updateObj[updateKey]
            }, updateObj);
          })
          .then(result => {
            resolve(result)
          })
      })
    }

    return true;
  }

  // 장치 구성 정보 설정
  async setDeviceStructure(structureInfoList) {
    let tempStorage = new TempStorage();
    let deviceStructureList = await this.getTable('device_structure');

    tempStorage.initAlreadyStorage(deviceStructureList);

    structureInfoList.forEach(structureInfo => {
      tempStorage.addStorage(structureInfo, 'structure_header', 'device_structure_seq');
    });
    
    return this.doQuery(tempStorage, 'device_structure', 'device_structure_seq');
  }


  // 염전 설정 장비 세팅
  async setDeviceInfo(mapSetInfo) {
    let tempStorage = new TempStorage();

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

    // let finalStorage = tempStorage.getFinalStorage();

    // if (finalStorage.insertObjList.length) {
    //   await this.setTables('saltern_device_info', finalStorage.insertObjList);
    // } else if (finalStorage.updateObjList.length) {
    //   return new Promise(resolve => {
    //     Promise.map(finalStorage.updateObjList, updateObj => {
    //         // BU.CLI(updateObj)
    //         return this.updateTable('saltern_device_info', {
    //           key: 'saltern_device_info_seq',
    //           value: updateObj.saltern_device_info_seq
    //         }, updateObj);
    //       })
    //       .then(result => {
    //         resolve(result)
    //       })
    //   })
    // }
    // return true;
  }

  // 염전 구성 객체 세팅(saltern_block, brine_warehouse, reservoir, sea, waterway)
  async setSalternObject(mapRelation) {
    let keyInfo = {
      saltern_block: 'SaltPlateData',
      brine_warehouse: 'WaterTankData',
      sea: 'WaterOutData',
      reservoir: 'ReservoirData',
      waterway: 'WaterWayData'
    }


  }

  async setSalternBlock(mapRelationSalternBlock) {
    let relationObjectList = await this.getTable('saltern_block');

    // 염판 세팅
    _.each(mapRelationSalternBlock, relationInfo => {
      let convertRelationInfo = {
        target_id: relationInfo.ID,
        target_type: relationInfo.PlateType.indexOf('Evaporating') !== -1 ? 'concentration' : 'crystalizing',
        target_name: this.findTargetName('ID', relationInfo.ID),
        setting_salinity: typeof relationInfo.SettingSalinity === 'number' ? relationInfo.SettingSalinity : 0,
        water_level_count: typeof relationInfo.WaterLevelCount === 'number' ? relationInfo.WaterLevelCount : 0,
        min_water_level: relationInfo.MinWaterLevel,
        max_water_level: relationInfo.MaxWaterLevel,
        water_cm: '',
        depth: relationInfo.Depth
      }
    })
  }


  setRelationInfo() {
    let keyInfo = {
      saltern_block: 'SaltPlateData',
      brine_warehouse: 'WaterTankData',
      reservoir: 'ReservoirData',
      sea: 'WaterOutData',
      waterway: 'WaterWayData'
    }
    _.each(this.mapRelation, (category, key) => {
      if (key === 'SaltPlateData') {
        this.setSalternBlock(category);
      }

    })
  }

  // 모듈 정보 설정
  setPhotovoltaic() {
    let config = this.controller.config.UWPS.photovoltaic;
    let tableName = 'photovoltaic';
    this.bi.getInfoTable('saltern_block', '', '', (err, result) => {
      if (err) {
        BU.CLI('ERROR OCCUR', err)
        process.exit();
      }

      let result_saltern_block = result;
      _.each(config, (infoObj, key) => {
        let saltern_block = _.findWhere(result_saltern_block, {
          target_id: infoObj.saltern_block_id
        })

        let convertObj = {
          saltern_block_seq: saltern_block ? saltern_block.saltern_block_seq : null,
          target_id: infoObj.target_id,
          target_name: infoObj.target_name,
          install_place: infoObj.install_place,
          module_type: infoObj.module_type,
          compose_count: infoObj.compose_count,
          amount: infoObj.amount,
          manufacturer: infoObj.manufacturer
        }

        this.bi.setterUwps(tableName, convertObj, (err, result) => {
          if (err) {
            BU.CLI('ERROR OCCUR', err)
            process.exit();
          }
        })
      })
    });
  }

  // 접속반 정보 설정
  setConnector() {
    let config = this.controller.config.UWPS.connector;
    let tableName = 'connector';
    _.each(config, (infoObj, key) => {
      this.bi.setterUwps(tableName, infoObj, (err, result) => {
        if (err) {
          BU.CLI('ERROR OCCUR', err)
          process.exit();
        }
      })
    })
  }

  // 인버터 정보 설정
  setInverter() {
    let config = this.controller.config.UWPS.inverter;
    let tableName = 'inverter';
    this.bi.getInfoTable('connector', '', '', (err, result) => {
      if (err) {
        BU.CLI('ERROR OCCUR', err)
        process.exit();
      }

      let result_connector = result;
      _.each(config, (infoObj, key) => {
        let connector = _.findWhere(result_connector, {
          target_id: infoObj.connector_id
        })
        let convertObj = {
          connector_seq: connector ? connector.connector_seq : null,
          target_id: infoObj.target_id,
          target_name: infoObj.target_name,
          target_type: 0, // 단상
          dialing: infoObj.dialing,
          code: infoObj.code,
          amount: infoObj.amount,
          director_name: infoObj.director_name,
          director_tel: infoObj.director_tel
        }
        this.bi.setterUwps(tableName, convertObj, (err, result, query) => {
          if (err) {
            BU.CLI('ERROR OCCUR', err)
            process.exit();
          }
        })
      })
    });
  }

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



  setSalternBlock(relationList) {
    BU.CLI('setSalternBlock')

    _.each(relationList, (relationInfo, key) => {
      // BU.CLI(relationInfo)
      let convertRelationInfo = {
        target_id: relationInfo.ID,
        target_type: relationInfo.PlateType.indexOf('Evaporating') !== -1 ? 0 : 1,
        target_name: this.findTargetName('ID', relationInfo.ID),
        setting_salinity: typeof relationInfo.SettingSalinity === 'number' ? relationInfo.SettingSalinity : 0,
        water_level_count: typeof relationInfo.WaterLevelCount === 'number' ? relationInfo.WaterLevelCount : 0,
        min_water_level: relationInfo.MinWaterLevel,
        max_water_level: relationInfo.MaxWaterLevel,
        water_cm: '',
        depth: relationInfo.Depth
      }

      // return BU.CLI(convertDeviceInfo);
      this.bi.setter_saltern_block(convertRelationInfo, (err, result, query) => {
        if (err) {
          BU.CLI('ERROR OCCUR', err)
          process.exit();
        }

      })
    })
  }


}
module.exports = P_Setter;