module.exports = {
  current: {
    devOption: {
      hasReloadInverterConfig: false, // db `inverter` 에서 읽어오고 새로이 데이터를 정립할 것인가
      hasReloadConnectorConfig: false, // db `connector` 에서 읽어오고 새로이 데이터를 정립할 것인가
      hasSaveConfig: false, // db에서 읽어온 내용을 새로이 file에 저장할 것인가
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
    deviceInfo: {
      typeList: ['inverter', 'connector']
    },
    'inverterList': [
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1190.0311
          },
          'deviceSavedInfo': {
            'inverter_seq': 1,
            'target_id': 'IVT1',
            'target_name': '인버터 1',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                49
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': 'e279f4c4-cdc8-4423-97f8-d30a78c5aff1',
            'amount': 30,
            'director_name': '홍길동 1',
            'director_tel': '01011114444'
          }
        }
      },
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1199.3829
          },
          'deviceSavedInfo': {
            'inverter_seq': 2,
            'target_id': 'IVT2',
            'target_name': '인버터 2',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                50
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': 'd6717789-009c-415e-8dbf-b637e6a45182',
            'amount': 30,
            'director_name': '홍길동 2',
            'director_tel': '01011114444'
          }
        }
      },
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1199.016
          },
          'deviceSavedInfo': {
            'inverter_seq': 3,
            'target_id': 'IVT3',
            'target_name': '인버터 3',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                51
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': '1afcb839-78e4-431a-a91c-de2d6e9ff6d4',
            'amount': 30,
            'director_name': '홍길동 3',
            'director_tel': '01011114444'
          }
        }
      },
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1187.0172
          },
          'deviceSavedInfo': {
            'inverter_seq': 4,
            'target_id': 'IVT4',
            'target_name': '인버터 4',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                52
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': 'aa3e00f6-94b6-4caa-825b-40fd527c47c8',
            'amount': 30,
            'director_name': '홍길동 4',
            'director_tel': '01011114444'
          }
        }
      },
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1200.2328
          },
          'deviceSavedInfo': {
            'inverter_seq': 5,
            'target_id': 'IVT5',
            'target_name': '인버터 5',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                53
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': 'a8b3b27a-239f-4bd7-8025-b5025c71aedd',
            'amount': 30,
            'director_name': '홍길동 5',
            'director_tel': '01011114444'
          }
        }
      },
      {
        'current': {
          'hasDev': true,
          'ivtDummyData': {
            'dailyKwh': 0,
            'cpKwh': 1212.2029
          },
          'deviceSavedInfo': {
            'inverter_seq': 6,
            'target_id': 'IVT6',
            'target_name': '인버터 6',
            'target_type': 'single',
            'target_category': 'dev',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                48,
                54
              ]
            },
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'code': 'ebbd733e-95df-4e52-8f4d-9ab0a884cb19',
            'amount': 30,
            'director_name': '홍길동 6',
            'director_tel': '01011114444'
          }
        }
      }
    ],
    'connectorList': [
      {
        'current': {
          'hasDev': true,
          'deviceSavedInfo': {
            'connector_seq': 1,
            'target_id': 'CNT1',
            'target_category': 'dm_v2',
            'target_name': '접속반 1',
            'connect_type': 'socket',
            'dialing': {
              'type': 'Buffer',
              'data': [
                0,
                0,
                1
              ]
            },
            'code': '324f78ff-452c-4a46-844a-ffe47defc1f7',
            'host': 'localhost',
            'port': null,
            'baud_rate': 9600,
            'address': {
              'type': 'Buffer',
              'data': [
                0,
                0
              ]
            },
            'director_name': '에스엠관리자',
            'director_tel': '01012345678',
            'ch_number': 6
          },
          'moduleList': [
            {
              'photovoltaic_seq': 1,
              'inverter_seq': 1,
              'connector_seq': 1,
              'saltern_block_seq': 1,
              'connector_ch': 1
            },
            {
              'photovoltaic_seq': 2,
              'inverter_seq': 2,
              'connector_seq': 1,
              'saltern_block_seq': 2,
              'connector_ch': 2
            },
            {
              'photovoltaic_seq': 3,
              'inverter_seq': 3,
              'connector_seq': 1,
              'saltern_block_seq': 3,
              'connector_ch': 3
            },
            {
              'photovoltaic_seq': 4,
              'inverter_seq': 4,
              'connector_seq': 1,
              'saltern_block_seq': 4,
              'connector_ch': 4
            },
            {
              'photovoltaic_seq': 5,
              'inverter_seq': 5,
              'connector_seq': 1,
              'saltern_block_seq': null,
              'connector_ch': 5
            },
            {
              'photovoltaic_seq': 6,
              'inverter_seq': 6,
              'connector_seq': 1,
              'saltern_block_seq': null,
              'connector_ch': 6
            }
          ]
        }
      }
    ]
  },
  
};