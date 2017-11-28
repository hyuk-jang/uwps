module.exports = {
  current: {
    devOption: {
      hasLoadSqlInverter: true, // db `inverter` 에서 읽어올 것인가
      hasSaveInverterConfig: false, // db에서 읽어온 내용을 새로이 file에 저장할 것인가
      hasLoadSqlConnector: true, // db `connector` 에서 읽어올 것인가
      hasSaveConnectorConfig: false, // db에서 읽어온 내용을 새로이 file에 저장할 것인가
      hasCopyInverterData: true,  // inverter를 기초로 접속반 데이터를 세팅할 것인가
      hasInsertQuery: false, // db에 정기적으로 데이터를 저장할 것인가
    },
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      // user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      user: 'upsas',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      // database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'uwps'
      database: 'upsas'
    },
    "inverterList": [{
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 1.641,
          "cpKwh": 821.5401
        },
        "ivtSavedInfo": {
          "inverter_seq": 1,
          "target_id": "IVT1",
          "target_name": "인버터 1",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 49]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "e279f4c4-cdc8-4423-97f8-d30a78c5aff1",
          "amount": 30,
          "director_name": "홍길동 1",
          "director_tel": "01011114444"
        }
      }
    }, {
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 2.0248,
          "cpKwh": 839.1565
        },
        "ivtSavedInfo": {
          "inverter_seq": 2,
          "target_id": "IVT2",
          "target_name": "인버터 2",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 50]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "d6717789-009c-415e-8dbf-b637e6a45182",
          "amount": 30,
          "director_name": "홍길동 2",
          "director_tel": "01011114444"
        }
      }
    }, {
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 2.0404,
          "cpKwh": 836.7933
        },
        "ivtSavedInfo": {
          "inverter_seq": 3,
          "target_id": "IVT3",
          "target_name": "인버터 3",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 51]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "1afcb839-78e4-431a-a91c-de2d6e9ff6d4",
          "amount": 30,
          "director_name": "홍길동 3",
          "director_tel": "01011114444"
        }
      }
    }, {
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 1.6647,
          "cpKwh": 822.5151
        },
        "ivtSavedInfo": {
          "inverter_seq": 4,
          "target_id": "IVT4",
          "target_name": "인버터 4",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 52]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "aa3e00f6-94b6-4caa-825b-40fd527c47c8",
          "amount": 30,
          "director_name": "홍길동 4",
          "director_tel": "01011114444"
        }
      }
    }, {
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 1.6516,
          "cpKwh": 832.9709
        },
        "ivtSavedInfo": {
          "inverter_seq": 5,
          "target_id": "IVT5",
          "target_name": "인버터 5",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 53]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "a8b3b27a-239f-4bd7-8025-b5025c71aedd",
          "amount": 30,
          "director_name": "홍길동 5",
          "director_tel": "01011114444"
        }
      }
    }, {
      "current": {
        "hasDev": true,
        "ivtDummyData": {
          "dailyKwh": 1.7946,
          "cpKwh": 842.5095
        },
        "ivtSavedInfo": {
          "inverter_seq": 6,
          "target_id": "IVT6",
          "target_name": "인버터 6",
          "target_type": "single_ivt",
          "target_category": "dev",
          "connect_type": "socket",
          "dialing": {
            "type": "Buffer",
            "data": [48, 54]
          },
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "code": "ebbd733e-95df-4e52-8f4d-9ab0a884cb19",
          "amount": 30,
          "director_name": "홍길동 6",
          "director_tel": "01011114444"
        }
      }
    }],
    "connectorList": [{
      "current": {
        "hasDev": true,
        "devPort": 5555,
        "cntSavedInfo": {
          "connector_seq": 1,
          "target_id": "CNT1",
          "target_category": "modbus_tcp",
          "target_name": "접속반 1",
          "dialing": {
            "type": "Buffer",
            "data": [1]
          },
          "code": "324f78ff-452c-4a46-844a-ffe47defc1f7",
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "addr_v": 0,
          "addr_a": 4,
          "director_name": "에스엠관리자",
          "director_tel": "01012345678",
          "ch_number": 4
        },
        "moduleList": [{
          "photovoltaic_seq": 1,
          "inverter_seq": 1,
          "connector_seq": 1,
          "saltern_block_seq": 1,
          "connector_ch": 1
        }, {
          "photovoltaic_seq": 2,
          "inverter_seq": 1,
          "connector_seq": 1,
          "saltern_block_seq": 2,
          "connector_ch": 2
        }, {
          "photovoltaic_seq": 3,
          "inverter_seq": 3,
          "connector_seq": 1,
          "saltern_block_seq": 3,
          "connector_ch": 3
        }, {
          "photovoltaic_seq": 4,
          "inverter_seq": 4,
          "connector_seq": 1,
          "saltern_block_seq": 4,
          "connector_ch": 4
        }]
      }
    }, {
      "current": {
        "hasDev": true,
        "devPort": 5556,
        "cntSavedInfo": {
          "connector_seq": 2,
          "target_id": "CNT2",
          "target_category": "modbus_tcp",
          "target_name": "접속반 2",
          "dialing": {
            "type": "Buffer",
            "data": [2]
          },
          "code": "a34c49db-0b50-4576-9c7e-cf691d929f15",
          "ip": "localhost",
          "port": null,
          "baud_rate": 9600,
          "addr_v": 0,
          "addr_a": 4,
          "director_name": "에스엠관리자",
          "director_tel": "01012345678",
          "ch_number": 2
        },
        "moduleList": [{
          "photovoltaic_seq": 5,
          "inverter_seq": 5,
          "connector_seq": 2,
          "saltern_block_seq": null,
          "connector_ch": 1
        }, {
          "photovoltaic_seq": 6,
          "inverter_seq": 6,
          "connector_seq": 2,
          "saltern_block_seq": null,
          "connector_ch": 2
        }]
      }
    }]
  },
  
}