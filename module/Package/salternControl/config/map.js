require('../../../module/default-intelligence');
// require('./map.jsdoc');

/**
 * @type {mDeviceMap}
 */
const map = {
  drawInfo: {
    frame: {
      mapSize: {
        width: 880,
        height: 1230
      },
      svgModelResourceList: [
        {
          id: 'salternBlock_001',
          type: 'rect',
          elementDrawInfo: {
            width: 100,
            height: 150,
            color: '#33ffff'
          }
        },
        {
          id: 'salternBlock_002',
          type: 'rect',
          elementDrawInfo: {
            width: 100,
            height: 150,
            color: '#33ffff'
          }
        },
        {
          id: 'salternLine_001',
          type: 'line',
          elementDrawInfo: {
            strokeWidth: 100,
            color: '#33ccff'
          }
        },
        {
          id: 'pump_001',
          type: 'circle',
          elementDrawInfo: {
            radius: 20,
            color: '#9fe667'
          }
        },
        {
          id: 'valve_001',
          type: 'rhombus',
          elementDrawInfo: {
            width: 20,
            height: 20,
            rotate: 45,
            color: '#efb4ce'
          }
        }
      ]
    },
    positionList: [{}]
  },
  setInfo: {
    dccConstructorList: [
      {
        dccId: 'DCC_001',
        connect_info: {
          type: 'socket',
          subType: '',
          host: 'localhost',
          port: 9000
        }
      },
      {
        dccId: 'DCC_002',
        connect_info: {
          type: 'zigbee',
          subType: 'xbee',
          baudRate: 9600,
          port: 'COM3'
        }
      }
    ],
    dpcConstructorList: [
      {
        dpcId: 'DPC_001',
        protocol_info: {
          mainCategory: 'UPSAS',
          subCategory: 'xbee'
        }
      }
    ],
    dataLoggerStructureList: [
      {
        target_prefix: 'D_G',
        target_alias: '수문 DL',
        dataLoggerDeviceList: [
          {
            target_id: '0013A20040F7ACC8',
            target_code: '005',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_005']
          },
          {
            target_id: '0013A20040F7B486',
            target_code: '006',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_006']
          },
          {
            target_id: '0013A20040F7B47C',
            target_code: '007',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_007']
          },
          {
            target_id: '0013A20040F7AB9C',
            target_code: '008',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_008']
          },
          {
            target_id: '0013A20040F7B430',
            target_code: '009',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_009']
          },
          {
            target_id: '0013A20040F7AB7D',
            target_code: '010',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_010', 'S_001']
          },
          {
            target_id: '0013A20040F7B4A9',
            target_code: '011',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_011', 'S_002']
          },
          {
            target_id: '0013A20040F7B460',
            target_code: '012',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_012', 'S_003']
          },
          {
            target_id: '0013A20040F7B49B',
            target_code: '013',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_013']
          },
          {
            target_id: '0013A20040F7B453',
            target_code: '014',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_014']
          },
          {
            target_id: '0013A20040F7B474',
            target_code: '015',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['WD_015']
          }
        ]
      },
      {
        target_prefix: 'D_V',
        target_alias: '밸브 DL',
        dataLoggerDeviceList: [
          {
            target_id: '0013A20040F7B47F',
            target_code: '001',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_001', 'MRT_001']
          },
          {
            target_id: '0013A20040F7B4A4',
            target_code: '002',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_002', 'MRT_002']
          },
          {
            target_id: '0013A20040F7B455',
            target_code: '003',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_003', 'MRT_003']
          },
          {
            target_id: '0013A20040F7B43C',
            target_code: '004',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_004', 'MRT_004']
          },
          {
            target_id: '0013A20040F7B469',
            target_code: '006',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_006']
          },
          {
            target_id: '0013A20040F7B4A7',
            target_code: '007',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['V_007']
          }
        ]
      },
      {
        target_prefix: 'D_GV',
        target_alias: '게이트형 밸브',
        dataLoggerDeviceList: [
          {
            target_id: '0013A20040F7AB81',
            target_code: '001',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['GV_001', 'WL_001']
          },
          {
            target_id: '0013A20040F7AB76',
            target_code: '002',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['GV_002', 'WL_002']
          },
          {
            target_id: '0013A20040F7AB69',
            target_code: '003',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['GV_003', 'WL_003']
          },
          {
            target_id: '0013A20040F7AB96',
            target_code: '004',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['GV_004', 'WL_004']
          }
        ]
      },
      {
        target_prefix: 'D_EP',
        target_alias: '육상 모듈 DL',
        dataLoggerDeviceList: [
          {
            target_id: '0013A20040F7AB86',
            target_code: '001',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['MRT_005', 'MRT_006']
          }
        ]
      },
      {
        target_prefix: 'D_P',
        target_alias: '펌프 DL',
        dataLoggerDeviceList: [
          {
            target_id: '0013A20040F7B451',
            target_code: '001',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['P_001']
          },
          {
            target_id: '0013A20040F7B446',
            target_code: '002',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['P_002']
          },
          {
            target_id: '0013A20040F7B44A',
            target_code: '003',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['P_003']
          },
          {
            target_id: '0013A20040F7A4E0',
            target_code: '004',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['P_004']
          },
          {
            target_id: '0013A20040F7A4D8',
            target_code: '005',
            dccId: 'DCC_001',
            dpcId: 'DPC_001',
            nodeList: ['P_005']
          }
        ]
      }
    ],
    nodeStructureList: [
      {
        target_id: 'temp',
        target_name: '온도',
        is_sensor: 1,
        data_unit: '℃',
        description: '섭씨',
        defineList: [
          {
            target_id: 'moduleFrontTemperature',
            target_prefix: 'MFT',
            target_name: '모듈 앞면 온도',
            description: null,
            nodeList: []
          },
          {
            target_id: 'moduleRearTemperature',
            target_prefix: 'MRT',
            target_name: '모듈 뒷면 온도',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              },
              {
                target_code: '004',
                data_logger_index: 0
              },
              {
                target_code: '005',
                data_logger_index: 1
              },
              {
                target_code: '006',
                data_logger_index: 0
              }
            ]
          }
        ]
      },
      {
        target_id: 'reh',
        target_name: '습도',
        is_sensor: 1,
        data_unit: '%',
        description: '백분율',
        defineList: []
      },
      {
        target_id: 'ws',
        target_name: '풍속',
        is_sensor: 1,
        data_unit: 'm/s',
        description: '초당 바람이 이동하는 거리(m)',
        defineList: []
      },
      {
        target_id: 'solar',
        target_name: '일사량',
        is_sensor: 1,
        data_unit: 'W/m²',
        description: '1평방 미터당 조사되는 일사에너지의 양이 1W',
        defineList: []
      },
      {
        target_id: 'co2',
        target_name: '이산화탄소',
        is_sensor: 1,
        data_unit: 'ppm',
        description:
          '백만분의 1. 이산화탄소 농도 395ppm = 395/1,000,000 * 100 = 0.0395 %',
        defineList: []
      },
      {
        target_id: 'uv',
        target_name: '자외선',
        is_sensor: 1,
        data_unit: 'mJ/c㎡',
        description: '1평방 센치당 조사되는 uv 에너지가 1mJ',
        defineList: []
      },
      {
        target_id: 'lux',
        target_name: '조도',
        is_sensor: 1,
        data_unit: 'lx',
        description: '1㎡의 면적 위에 1m의 광속이 균일하게 비춰질 때',
        defineList: []
      },
      {
        target_id: 'vol',
        target_name: '전압',
        is_sensor: 1,
        data_unit: 'V',
        description: null,
        defineList: []
      },
      {
        target_id: 'amp',
        target_name: '전류',
        is_sensor: 1,
        data_unit: 'A',
        description: null,
        defineList: []
      },
      {
        target_id: 'salinity',
        target_name: '염도',
        is_sensor: 1,
        data_unit: '%',
        description: null,
        defineList: [
          {
            target_id: 'salinity',
            target_prefix: 'S',
            target_name: '염도',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              }
            ]
          }
        ]
      },
      {
        target_id: 'waterLevel',
        target_name: '수위',
        is_sensor: 1,
        data_unit: 'cm',
        description: null,
        defineList: [
          {
            target_id: 'waterLevel',
            target_prefix: 'WL',
            target_name: '수위',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              },
              {
                target_code: '004',
                data_logger_index: 0
              }
            ]
          }
        ]
      },
      {
        target_id: 'waterDoor',
        target_name: '수문',
        is_sensor: 0,
        data_unit: null,
        description: null,
        defineList: [
          {
            target_id: 'waterDoor',
            target_prefix: 'WD',
            target_name: '수문',
            description: null,
            nodeList: [
              {
                target_code: '005',
                data_logger_index: 0
              },
              {
                target_code: '006',
                data_logger_index: 0
              },
              {
                target_code: '007',
                data_logger_index: 0
              },
              {
                target_code: '008',
                data_logger_index: 0
              },
              {
                target_code: '009',
                data_logger_index: 0
              },
              {
                target_code: '010',
                data_logger_index: 0
              },
              {
                target_code: '011',
                data_logger_index: 0
              },
              {
                target_code: '012',
                data_logger_index: 0
              },
              {
                target_code: '013',
                data_logger_index: 0
              },
              {
                target_code: '014',
                data_logger_index: 0
              },
              {
                target_code: '015',
                data_logger_index: 0
              },
              {
                target_code: '016',
                data_logger_index: 0
              }
            ]
          }
        ]
      },
      {
        target_id: 'valve',
        target_name: '밸브',
        is_sensor: 0,
        data_unit: null,
        description: null,
        defineList: [
          {
            target_id: 'valve',
            target_prefix: 'V',
            target_name: '밸브',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              },
              {
                target_code: '004',
                data_logger_index: 0
              },
              {
                target_code: '006',
                data_logger_index: 0
              },
              {
                target_code: '007',
                data_logger_index: 0
              }
            ]
          },
          {
            target_id: 'gateValve',
            target_prefix: 'GV',
            target_name: '수문 용 밸브',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              },
              {
                target_code: '004',
                data_logger_index: 0
              }
            ]
          }
        ]
      },
      {
        target_id: 'pump',
        target_name: '펌프',
        is_sensor: 0,
        data_unit: null,
        description: null,
        defineList: [
          {
            target_id: 'pump',
            target_prefix: 'P',
            target_name: '펌프',
            description: null,
            nodeList: [
              {
                target_code: '001',
                data_logger_index: 0
              },
              {
                target_code: '002',
                data_logger_index: 0
              },
              {
                target_code: '003',
                data_logger_index: 0
              },
              {
                target_code: '004',
                data_logger_index: 0
              },
              {
                target_code: '005',
                data_logger_index: 0
              }
            ]
          }
        ]
      }
    ]
  },
  realtionInfo: {
    placeRelationList: [
      {
        target_id: 'salternBlock',
        target_name: '염판',
        description: null,
        defList: [
          {
            target_id: 'salternEvaporationBlock',
            target_prefix: 'SEB',
            target_name: '증발지',
            placeList: [
              {
                target_code: '1_A',
                depth: 5,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['GV_001', 'WL_001', 'V_001', 'MRT_001']
              },
              {
                target_code: '1_B',
                depth: 5,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['GV_002', 'WL_002', 'V_002', 'MRT_002']
              },
              {
                target_code: '1_C',
                depth: 5,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['GV_003', 'WL_003', 'V_003', 'MRT_003']
              },
              {
                target_code: '1_D',
                depth: 5,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['GV_004', 'WL_004', 'V_003', 'MRT_003']
              },
              {
                target_code: '일반',
                depth: 5,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['WD_005']
              },
              {
                target_code: '2',
                depth: 4,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['WD_006']
              },
              {
                target_code: '3',
                depth: 3,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4
                },
                nodeList: ['WD_006', 'WD_007']
              },
              {
                target_code: '4',
                depth: 2,
                place_info: {
                  maxBrineLevel: 20,
                  minBrineLevel: 1,
                  setBrineLevel: 4,
                  setSalinity: 18
                },
                nodeList: ['WD_007', 'WD_008']
              }
            ]
          },
          {
            target_id: 'salternCrystalizingBlock',
            target_prefix: 'SCB',
            target_name: '결정지',
            placeList: [
              {
                target_code: '',
                depth: 1,
                place_info: {
                  maxBrineLevel: 7,
                  minBrineLevel: 1
                },
                nodeList: ['WD_009']
              }
            ]
          }
        ]
      },
      {
        target_id: 'brineWarehouse',
        target_name: '해주',
        description: null,
        defList: [
          {
            target_id: 'brineWarehouse',
            target_prefix: 'BW',
            target_name: '해주',
            placeList: [
              {
                target_code: '1',
                depth: -1,
                place_info: {
                  maxBrineLevel: 100,
                  minBrineLevel: 30,
                  setBrineLevel: 70
                },
                nodeList: ['']
              }
            ]
          }
        ]
      }
    ]
  }
};

module.exports = map;
