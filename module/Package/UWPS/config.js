module.exports = {
  current: {
    devOption: {
      hasLoadSqlInverter:false,
      hasInsertQuery: false,
    },
    dbInfo: {
      host: process.env.SALTERN_HOST ? process.env.SALTERN_HOST : 'localhost',
      user: process.env.SALTERN_USER ? process.env.SALTERN_USER : 'root',
      password: process.env.SALTERN_PW ? process.env.SALTERN_PW : 'root',
      database: process.env.SALTERN_DB ? process.env.SALTERN_DB : 'uwps'
    },
    "inverterList": [
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.4415,
            "cpKwh": 111.7305
          },
          "ivtSavedInfo": {
            "inverter_seq": 1,
            "connector_seq": 1,
            "target_id": "IVT1",
            "target_name": "인버터 1",
            "target_type": "single_ivt",
            "target_category": "dev",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                49
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "11ae01ed-5f42-4063-858f-d500294dcf11",
            "amount": 30,
            "director_name": "홍길동 1",
            "director_tel": "01011114444"
          }
        }
      },
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.4793,
            "cpKwh": 113.8824
          },
          "ivtSavedInfo": {
            "inverter_seq": 2,
            "connector_seq": 1,
            "target_id": "IVT2",
            "target_name": "인버터 2",
            "target_type": "single_ivt",
            "target_category": "s_hex",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                50
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "57368acb-9060-454e-8878-4edd1dde9668",
            "amount": 30,
            "director_name": "홍길동 2",
            "director_tel": "01011114444"
          }
        }
      },
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.4133,
            "cpKwh": 110.4345
          },
          "ivtSavedInfo": {
            "inverter_seq": 3,
            "connector_seq": 1,
            "target_id": "IVT4",
            "target_name": "인버터 4",
            "target_type": "single_ivt",
            "target_category": "s_hex",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                51
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "1a2de634-ce1c-42f5-9b86-98ac67b83afa",
            "amount": 30,
            "director_name": "홍길동 4",
            "director_tel": "01011114444"
          }
        }
      },
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.3026,
            "cpKwh": 111.8839
          },
          "ivtSavedInfo": {
            "inverter_seq": 4,
            "connector_seq": 2,
            "target_id": "IVT5",
            "target_name": "인버터 5",
            "target_type": "single_ivt",
            "target_category": "s_hex",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                52
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "07f00597-b0e5-4bf2-819a-5cd193440f8b",
            "amount": 30,
            "director_name": "홍길동 5",
            "director_tel": "01011114444"
          }
        }
      },
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.2888,
            "cpKwh": 112.0077
          },
          "ivtSavedInfo": {
            "inverter_seq": 5,
            "connector_seq": 1,
            "target_id": "IVT3",
            "target_name": "인버터 3",
            "target_type": "single_ivt",
            "target_category": "s_hex",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                53
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "4d1adb22-94b7-48c6-b7f7-120d15c61c8f",
            "amount": 30,
            "director_name": "홍길동 3",
            "director_tel": "01011114444"
          }
        }
      },
      {
        "current": {
          "hasDev": true,
          "ivtDummyData": {
            "dailyKwh": 5.4047,
            "cpKwh": 112.2591
          },
          "ivtSavedInfo": {
            "inverter_seq": 6,
            "connector_seq": 2,
            "target_id": "IVT6",
            "target_name": "인버터 6",
            "target_type": "single_ivt",
            "target_category": "s_hex",
            "connect_type": "socket",
            "dialing": {
              "type": "Buffer",
              "data": [
                48,
                54
              ]
            },
            "ip": "localhost",
            "port": "COM1",
            "baud_rate": 9600,
            "code": "586d3b72-fc2e-477a-856d-36a5f2fbf8fd",
            "amount": 30,
            "director_name": "홍길동 6",
            "director_tel": "01011114444"
          }
        }
      }
    ],
    connectorList: [{
      current: {
        hasDev: true,
        devPort: 5555,
        cntSavedInfo: {
          connector_seq: 1,
          target_id: 'CNT1',
          target_category: 'modbus_tcp',
          target_name: '접속반 1',
          dialing: '0x01',
          code: '0b414af3-5733-400d-87c7-b9ba68ad3895',
          ip: 'localhost',
          port: 8889,
          baud_rate: 9600,
          ch_number: 4,
          addr_v: 0,
          addr_a: 4,
          director_name: '에스엠관리자',
          director_tel: '01012345678'
        }
      }
    }, {
      current: {
        hasDev: true,
        devPort: 5556,
        cntSavedInfo: {
          connector_seq: 2,
          target_id: 'CNT2',
          target_category: 'modbus_tcp',
          target_name: '접속반2',
          dialing: '0x02',
          code: '0b414af3-5733-400d-87c7-b9ba68ad3895',
          ip: 'localhost',
          port: 8889,
          baud_rate: 9600,
          ch_number: 2,
          addr_v: 0,
          addr_a: 4,
          director_name: '에스엠관리자',
          director_tel: '12412'
        }
      }
    }]
  },
  InverterController: [{
    current: {
      hasDev: true, // 테스트모드 여부 -> 테스트 소켓 서버 및 테스트 데이터 생성 여부
      ivtSavedInfo: {
        inverter_seq: 5,
        target_category: 'dev',
        target_id: 'IVT1',
        target_name: '인버터 1',
        target_type: 0, // 0: 단상, 1: 삼상
        dialing: Buffer.from('01', 'ascii'), // id,
        connect_type: 'socket', // `socket` or `serial`
        ip: 'localhost', // Socket 연결 시 사용
        port: 'COM1', // Port를 직접 지정하고자 할때 사용
        baud_rate: 9600, // 장치 BaudRate
        code: '장치 고유 id',
        amount: 3, // 3Kw, 
        director_name: '홍길동',
        director_tel: '01012345589'
      }
    }
  }],
  // 더미 데이터를 만들기 위해서 임시로 놔둠
  ConnectorController: [{
    current: {
      cntSavedInfo: {
        connector_seq: 1,
        target_id: 'CNT1',
        target_category: 'modbus_tcp',
        target_name: '접속반 1',
        dialing: '0x01',
        code: '0b414af3-5733-400d-87c7-b9ba68ad3895',
        ip: null,
        port: null,
        baud_rate: 9600,
        ch_number: 4,
        addr_v: 0,
        addr_a: 4,
        director_name: '에스엠관리자',
        director_tel: '01012345678'
      }
    }
  }, {
    current: {
      cntSavedInfo: {
        connector_seq: 2,
        target_id: 'CNT2',
        target_category: 'modbus_tcp',
        target_name: '접속반2',
        dialing: '0x02',
        code: '0b414af3-5733-400d-87c7-b9ba68ad3895',
        ip: null,
        port: null,
        baud_rate: 9600,
        ch_number: 2,
        addr_v: 0,
        addr_a: 4,
        director_name: '에스엠관리자',
        director_tel: '12412'
      }
    }
  }]
}