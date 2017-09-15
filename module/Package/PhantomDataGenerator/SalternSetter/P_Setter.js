const _ = require('underscore');
const Bi = require('./Bi.js');
const MAP = require('./map.json');


class P_Setter {
  constructor(controller) {
    this.controller = controller;

    this.structureInfo = this.controller.config.device_structure;




    this.mapImgInfo = MAP.MAP;
    this.mapSetInfo = MAP.SETINFO;
    this.mapRelation = MAP.RELATION;

    this.bi = new Bi(this.controller.config.dbInfo);
  }

  init() {
    // console.log(this.mapSetInfo)

    // 장치 구성 정보
    setTimeout(() => {
      this.setDeviceStructure();  
    }, 1000);
    

    // 염전 설정 장비 
    setTimeout(() =>  {
      this.setDeviceInfo();
    }, 1000 * 2);
    

    // 염판 설정
    setTimeout(() => {
      this.setRelationInfo();
    }, 1000 * 3);
    

    // 모듈 정보
    setTimeout(() =>  {
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


  // 장치 구성 정보 추가
  setDeviceStructure() {
    this.bi.get_device_structure('', (err, res) => {
      if (err) {
        BU.CLI('ERROR OCCUR', err)
        process.exit();
      }
      let structureHeaderList = _.pluck(res, 'structure_header');
      _.each(this.structureInfo, (struc, index) => {
        if (!_.contains(structureHeaderList, struc.header)) {
          this.bi.insert_device_structure(struc, (err, resInsert, query) => {
            BU.CLI(query)
            if (err) {
              BU.CLI('ERROR OCCUR', err)
              process.exit();
            }
          });
        }
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

  setDeviceInfo() {
    let regx = /\d/;
    let device_structure = [];

    this.bi.get_device_structure('', (err, result) => {
      device_structure = result;

      _.each(this.mapSetInfo, category => {
        _.each(category, deviceInfo => {
          let regExec = regx.exec(deviceInfo.ID);
          let headerName = deviceInfo.ID.substr(0, regExec.index);

          let convertDeviceInfo = {
            device_structure_seq: _.findWhere(device_structure, {
              structure_header: headerName
            }).device_structure_seq,
            target_id: deviceInfo.ID,
            target_name: this.findTargetName('ID', deviceInfo.ID),
            device_type: deviceInfo.DeviceType === 'Serial' ? 1 : 0,
            board_id: deviceInfo.BoardID ? deviceInfo.BoardID : '',
            port: deviceInfo.Port
          }

          // return BU.CLI(convertDeviceInfo);
          this.bi.setter_saltern_device_info(headerName, convertDeviceInfo, (err, result, query) => {
            if (err) {
              BU.CLI('ERROR OCCUR', err)
              process.exit();
            }

          })
        })
      })
    });
  }

  setRelationInfo() {
    let keyInfo = {
      saltern_block: 'SaltPlateData',
      water_tank: 'WaterTankData',
      reservoir: 'ReservoirData',
      sea: 'WaterOutData',
      water_way: 'WaterWayData'
    }
    _.each(this.mapRelation, (category, key) => {
      if (key === 'SaltPlateData') {
        this.setSalternBlock(category);
      }

    })
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