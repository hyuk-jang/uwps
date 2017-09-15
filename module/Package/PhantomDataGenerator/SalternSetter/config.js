module.exports = {
  current: {
    device_structure: [{
      name: 'WaterDoor',
      header: 'WD'
    }, {
      name: 'WaterLevel',
      header: 'WL'
    }, {
      name: 'Salinity',
      header: 'S'
    }, {
      name: 'Valve',
      header: 'V'
    }, {
      name: 'Pump',
      header: 'P'
    }, {
      name: 'UnderWaterTemperature',
      header: 'UWT'
    }, {
      name: 'ModuleTemperature',
      header: 'MT'
    }],
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : "saltpond_controller"
    },
    UWPS: {
      photovoltaic: [{
        saltern_block_id: 'SP2',
        ch: 1,
        target_id: 'PV1',
        target_name: 'G2G형',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '솔라테크'
      }, {
        saltern_block_id: 'SP3',
        ch: 2,
        target_id: 'PV2',
        target_name: 'G2G형',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: 'SP4',
        ch: 3,
        target_id: 'PV3',
        target_name: '일반형',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '솔라테크'
      }, {
        saltern_block_id: 'SP5',
        ch: 4,
        target_id: 'PV4',
        target_name: '일반형',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: '',
        ch: 5,
        target_id: 'PV5',
        target_name: '외부 G2G형 모듈',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: '',
        ch: 6,
        target_id: 'PV6',
        target_name: '외부 일반형 모듈',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '에스에너지'
      }],
      connector: [{
        target_id: 'CNT1',
        target_name: '접속반 1',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        ch_number: 6,
        addr_v: '40000',
        addr_start_a: '40004',
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      }],
      inverter: [{
        connector_id: 'CNT1',
        target_id: 'IVT1',
        target_name: '인버터 1',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 1',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT2',
        target_name: '인버터 2',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 2',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT3',
        target_name: '인버터 3',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 3',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT4',
        target_name: '인버터 4',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 4',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT5',
        target_name: '인버터 5',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 5',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT6',
        target_name: '인버터 6',
        dialing: _.random(0,9) + '' + _.random(0,9),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 6',
        director_tel: '01011114444'
      }]

    }

  }
}