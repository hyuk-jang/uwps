module.exports = {
  current: {
    device_structure: [{
      structure_name: 'WaterDoor',
      structure_header: 'WD'
    }, {
      structure_name: 'WaterLevel',
      structure_header: 'WL'
    }, {
      structure_name: 'Salinity',
      structure_header: 'S'
    }, {
      structure_name: 'Valve',
      structure_header: 'V'
    }, {
      structure_name: 'Pump',
      structure_header: 'P'
    }, {
      structure_name: 'UnderWaterTemperature',
      structure_header: 'UT'
    }, {
      structure_name: 'ModuleTemperature',
      structure_header: 'MT'
    }],
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: 'upsas',
      // user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: 'upsas'
    },
    UWPS: {
      photovoltaic: [{
        saltern_block_id: 'SP1',
        ch: 1,
        target_id: 'PV1',
        target_name: 'G2G형',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '솔라테크'
      }, {
        saltern_block_id: 'SP2',
        ch: 2,
        target_id: 'PV2',
        target_name: 'G2G형',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: 'SP3',
        ch: 4,
        target_id: 'PV3',
        target_name: '일반형',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 1.5,
        manufacturer: '솔라테크'
      }, {
        saltern_block_id: 'SP4',
        ch: 3,
        target_id: 'PV4',
        target_name: '일반형',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 30,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: '',
        ch: 1,
        target_id: 'PV5',
        target_name: '외부 G2G형 모듈',
        install_place: '',
        module_type: 1,
        compose_count: 6,
        amount: 30,
        manufacturer: '에스에너지'
      }, {
        saltern_block_id: '',
        ch: 2,
        target_id: 'PV6',
        target_name: '외부 일반형 모듈',
        install_place: '',
        module_type: 0,
        compose_count: 6,
        amount: 30,
        manufacturer: '솔라테크'
      }],
      connector: [{
        target_id: 'CNT1',
        target_name: '접속반 1',
        dialing: Buffer.from([0x01]),
        code: BU.GUID(),
        ch_number: 4,
        addr_v: 0,
        addr_start_a: 4,
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      },{
        target_id: 'CNT2',
        target_name: '접속반 2',
        dialing: Buffer.from([0x02]),
        code: BU.GUID(),
        ch_number: 2,
        addr_v: 0,
        addr_start_a: 4,
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      }],
      inverter: [{
        connector_id: 'CNT1',
        target_id: 'IVT1',
        target_name: '인버터 1',
        dialing: Buffer.from([0x30, 0x31]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 1',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT2',
        target_name: '인버터 2',
        dialing: Buffer.from([0x30, 0x32]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 2',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT3',
        target_name: '인버터 3',
        dialing: Buffer.from([0x30, 0x33]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 3',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT1',
        target_id: 'IVT4',
        target_name: '인버터 4',
        dialing: Buffer.from([0x30, 0x34]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 4',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT2',
        target_id: 'IVT5',
        target_name: '인버터 5',
        dialing: Buffer.from([0x30, 0x35]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 5',
        director_tel: '01011114444'
      }, {
        connector_id: 'CNT2',
        target_id: 'IVT6',
        target_name: '인버터 6',
        dialing: Buffer.from([0x30, 0x36]),
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 6',
        director_tel: '01011114444'
      }]

    }

  }
}