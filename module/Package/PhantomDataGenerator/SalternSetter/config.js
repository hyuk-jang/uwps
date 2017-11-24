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
    UPMS: {
      photovoltaic: [{
        target_id: 'PV1',
        target_name: 'G2G형',
        install_place: '',
        module_type: 'g2g',
        compose_count: 6,
        amount: 15,
        manufacturer: '솔라테크'
      }, {
        target_id: 'PV2',
        target_name: 'G2G형',
        install_place: '',
        module_type: 'g2g',
        compose_count: 6,
        amount: 15,
        manufacturer: '에스에너지'
      }, {
        target_id: 'PV3',
        target_name: '일반형',
        install_place: 'normal',
        module_type: 1,
        compose_count: 6,
        amount: 15,
        manufacturer: '솔라테크'
      }, {
        target_id: 'PV4',
        target_name: '',
        install_place: '일반형',
        module_type: 'normal',
        compose_count: 6,
        amount: 15,
        manufacturer: '에스에너지'
      }, {
        target_id: 'PV5',
        target_name: '외부 G2G형 모듈',
        install_place: '',
        module_type: 'g2g',
        compose_count: 6,
        amount: 15,
        manufacturer: '에스에너지'
      }, {
        target_id: 'PV6',
        target_name: '외부 일반형 모듈',
        install_place: '',
        module_type: 'normal',
        compose_count: 6,
        amount: 15,
        manufacturer: '솔라테크'
      }],
      connector: [{
        target_id: 'CNT1',
        target_category: 'modbus_tcp',
        target_name: '접속반 1',
        dialing: Buffer.from([0x01]),
        code: BU.GUID(),
        ip: 'localhost',
        baud_rate: 9600,
        port: null,
        addr_v: 0,
        addr_a: 4,
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      }, {
        target_id: 'CNT2',
        target_category: 'modbus_tcp',
        target_name: '접속반 2',
        dialing: Buffer.from([0x02]),
        code: BU.GUID(),
        ip: 'localhost',
        baud_rate: 9600,
        port: null,
        addr_v: 0,
        addr_a: 4,
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      }],
      inverter: [{
        target_id: 'IVT1',
        target_name: '인버터 1',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x31]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 1',
        director_tel: '01011114444'
      }, {
        target_id: 'IVT2',
        target_name: '인버터 2',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x32]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 2',
        director_tel: '01011114444'
      }, {
        target_id: 'IVT3',
        target_name: '인버터 3',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x33]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 3',
        director_tel: '01011114444'
      }, {
        target_id: 'IVT4',
        target_name: '인버터 4',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x34]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 4',
        director_tel: '01011114444'
      }, {
        target_id: 'IVT5',
        target_name: '인버터 5',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x35]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 5',
        director_tel: '01011114444'
      }, {
        target_id: 'IVT6',
        target_name: '인버터 6',
        target_type: 'single_ivt',
        target_category: 'dev',
        connect_type: 'socket',
        dialing: Buffer.from([0x30, 0x36]),
        ip: 'localhost',
        port: null,
        baud_rate: 9600,
        code: BU.GUID(),
        amount: 30,
        director_name: '홍길동 6',
        director_tel: '01011114444'
      }],
      relationUPMS: [{
          photovoltaicId: 'PV1',
          salternBlockId: 'SP1',
          connectorId: 'CNT1',
          inverterId: 'IVT1',
          connector_ch: 1
        },
        {
          photovoltaicId: 'PV2',
          salternBlockId: 'SP2',
          connectorId: 'CNT1',
          inverterId: 'IVT2',
          connector_ch: 2
        },
        {
          photovoltaicId: 'PV3',
          salternBlockId: 'SP3',
          connectorId: 'CNT1',
          inverterId: 'IVT3',
          connector_ch: 3
        },
        {
          photovoltaicId: 'PV4',
          salternBlockId: 'SP4',
          connectorId: 'CNT1',
          inverterId: 'IVT4',
          connector_ch: 4
        },
        {
          photovoltaicId: 'PV5',
          salternBlockId: null,
          connectorId: 'CNT2',
          inverterId: 'IVT5',
          connector_ch: 1
        },
        {
          photovoltaicId: 'PV6',
          salternBlockId: null,
          connectorId: 'CNT2',
          inverterId: 'IVT6',
          connector_ch: 2
        },
      ]

    },


  }
}