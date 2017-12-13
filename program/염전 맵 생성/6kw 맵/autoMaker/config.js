

module.exports = {
  relation: 
    {
      SaltPlateData: [
        {
          ID: 'SP1',
          PlateType: 'Evaporating Pond',
          Depth: 5,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP2',
          PlateType: 'Evaporating Pond',
          Depth: 5,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP3',
          PlateType: 'Evaporating Pond',
          Depth: 5,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP4',
          PlateType: 'Evaporating Pond',
          Depth: 5,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP5',
          PlateType: 'Evaporating Pond',
          Depth: 5,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP6',
          PlateType: 'Evaporating Pond',
          Depth: 4,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP7',
          PlateType: 'Evaporating Pond',
          Depth: 3,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        },
        {
          ID: 'SP8',
          PlateType: 'Evaporating Pond',
          Depth: 2,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: '18'
        },
        {
          ID: 'SP9',
          PlateType: 'Crystallizing Pond',
          Depth: 1,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: ''
        }
      ],
      WaterTankData: [
        {
          ID: 'WT1',
          TankType: 'Evaporating Pond',
          Depth: -1,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: '5'
        },
        {
          ID: 'WT2',
          TankType: 'Evaporating Pond',
          Depth: -1,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: '15'
        },
        {
          ID: 'WT3',
          TankType: 'Evaporating Pond',
          Depth: -1,
          MinWaterLevel: 1,
          MaxWaterLevel: 4,
          SettingSalinity: '20'
        },
      ],
      WaterOutData: [
        {
          ID: 'WO1',
          Depth: -1
        },
        {
          ID: 'WO2',
          Depth: -1
        }
      ],
      ReservoirData: [
        {
          ID: 'RV1',
          Depth: 100,
        }
      ],
      WaterWayData: [
        {
          ID: 'WW1',
          Depth: 0.9,
          ListSaltPondLine: [
            'SPL1', 'SPL2'
          ]
        },
        {
          ID: 'WW2',
          Depth: 0.8,
          ListSaltPondLine: [
            'SPL3', 'SPL4'
          ]
        },
        {
          ID: 'WW3',
          Depth: 0.7,
          ListSaltPondLine: [
            'SPL5'
          ]
        },
      ]

    }
  ,
  objectList: [
    pump = [
      {
        placeId: 'P1',
        locatedIdList: ['WO1'],
        placeImgId: 'Pump_A',
        axis: [0, 0],
        xMoveScale: 0.75,
        yMoveScale: 0
      },
      {
        placeId: 'P2',
        locatedIdList: ['RV1'],
        placeImgId: 'Pump_A',
        axis: [1, 0],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'P3',
        locatedIdList: ['WT1'],
        placeImgId: 'Pump_A',
        axis: [1, 0],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'P4',
        locatedIdList: ['WT2'],
        placeImgId: 'Pump_A',
        axis: [0, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'P5',
        locatedIdList: ['WT3'],
        placeImgId: 'Pump_A',
        axis: [0, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
    ],
    valve = [
      {
        placeId: 'V1',
        locatedIdList: ['SP1'],
        placeImgId: 'Valve_A',
        axis: [0, 0],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'V2',
        locatedIdList: ['SP2'],
        placeImgId: 'Valve_A',
        axis: [0, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'V3',
        locatedIdList: ['SP3'],
        placeImgId: 'Valve_A',
        axis: [0, 0],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'V4',
        locatedIdList: ['SP4'],
        placeImgId: 'Valve_A',
        axis: [0, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'V5',
        locatedIdList: ['SP5'],
        placeImgId: 'Valve_A',
        axis: [0, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      // {
      //   placeId: 'V6',
      //   locatedIdList: ['RV1'],
      //   placeImgId: 'Valve_B',
      //   axis: [0.5, 1],
      //   xMoveScale: 0,
      //   yMoveScale: 0
      // },
      // {
      //   placeId: 'V7',
      //   locatedIdList: ['WT2'],
      //   placeImgId: 'Valve_B',
      //   axis: [0, 0],
      //   xMoveScale: 0,
      //   yMoveScale: 0
      // },
      // {
      //   placeId: 'V8',
      //   locatedIdList: ['SP6'],
      //   placeImgId: 'Valve_B',
      //   axis: [1, 0],
      //   xMoveScale: -0.55,
      //   yMoveScale: 0
      // },
      // {
      //   placeId: 'V9',
      //   locatedIdList: ['SP9'],
      //   placeImgId: 'Valve_B',
      //   axis: [1, 0],
      //   xMoveScale: 0,
      //   yMoveScale: 0
      // },
    ],
    waterDoor = [
      {
        placeId: 'WD1',
        locatedIdList: ['SP1', 'SPL1'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD2',
        locatedIdList: ['SP2', 'SPL1'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD3',
        locatedIdList: ['SP3', 'SPL1'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD4',
        locatedIdList: ['SP4', 'SPL1'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD5',
        locatedIdList: ['SP5', 'SPL1'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD6',
        locatedIdList: ['SP6', 'SP7'],
        placeImgId: 'WaterDoor_B',
        axis: [0.5, 1],
        xMoveScale: 0,
        yMoveScale: 0.8
      },
      {
        placeId: 'WD7',
        locatedIdList: ['SP7', 'SP8'],
        placeImgId: 'WaterDoor_B',
        axis: [0.5, 1],
        xMoveScale: 0,
        yMoveScale: 0.8
      },
      {
        placeId: 'WD8',
        locatedIdList: ['SP8', 'SPL3'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD9',
        locatedIdList: ['SP9', 'SPL3'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD10',
        locatedIdList: ['WT1', 'SPL2'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD11',
        locatedIdList: ['WT2', 'SPL4'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD12',
        locatedIdList: ['WT3', 'SPL5'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'WD13',
        locatedIdList: ['SPL2', 'SPL4'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 0.5],
        xMoveScale: 1,
        yMoveScale: 0
      },
      {
        placeId: 'WD14',
        locatedIdList: ['SPL4', 'SPL5'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 0.5],
        xMoveScale: 1,
        yMoveScale: 0
      },
      {
        placeId: 'WD15',
        locatedIdList: ['WO2', 'SPL5'],
        placeImgId: 'WaterDoor_A',
        axis: [1, 0],
        xMoveScale: 0,
        yMoveScale: 0
      },
    ],
    pipeOutlet = [
      {
        placeId: 'PO1',
        locatedIdList: ['SP1'],
        placeImgId: 'PipeOutlet',
        axis: [0, 0],
        xMoveScale: 0.5,
        yMoveScale: 2
      },
      {
        placeId: 'PO2',
        locatedIdList: ['SP2'],
        placeImgId: 'PipeOutlet',
        axis: [0, 1],
        xMoveScale: 0.5,
        yMoveScale: -2
      },
      {
        placeId: 'PO3',
        locatedIdList: ['SP3'],
        placeImgId: 'PipeOutlet',
        axis: [0, 0],
        xMoveScale: 0.5,
        yMoveScale: 2
      },
      {
        placeId: 'PO4',
        locatedIdList: ['SP4'],
        placeImgId: 'PipeOutlet',
        axis: [0, 1],
        xMoveScale: 0.5,
        yMoveScale: -2
      },
      {
        placeId: 'PO5',
        locatedIdList: ['SP5'],
        placeImgId: 'PipeOutlet',
        axis: [0, 1],
        xMoveScale: 0.5,
        yMoveScale: -2
      },
      {
        placeId: 'PO6',
        locatedIdList: ['RV1'],
        placeImgId: 'PipeOutlet',
        axis: [0.5, 1],
        xMoveScale: 0,
        yMoveScale: 0
      },
      {
        placeId: 'PO7',
        locatedIdList: ['WT2'],
        placeImgId: 'PipeOutlet',
        axis: [0, 0],
        xMoveScale: 0,
        yMoveScale: 0.5
      },
      {
        placeId: 'PO8',
        locatedIdList: ['SP6'],
        placeImgId: 'PipeOutlet',
        axis: [1, 0],
        xMoveScale: -1.5,
        yMoveScale: 0
      },
      {
        placeId: 'PO9',
        locatedIdList: ['SP9'],
        placeImgId: 'PipeOutlet',
        axis: [1, 0],
        xMoveScale: 0,
        yMoveScale: 0.5
      },
    ],
  ],
  valueList:
  [
    waterLevel = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9', 'WT1', 'WT2', 'WT3', 'RV1'],
    salinity = ['SP8', 'WT2', 'WT3'],
    // salinity = ['SP8', 'WT1', 'WT2', 'WT3'],
    brineTemperature = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9'],
    moduleTemperature = ['SP1', 'SP2', 'SP3', 'SP4']
  ],
  resource:{
      SPL: {
        name: '수로',
        map: 'SaltPondLineList',
        setInfo: {},
        relation:'ListSaltPondLine'
      },
      PO: {
        name: '배출구',
        map: 'PipeOutletList',
        setInfo: {},
        relation:''
      },
      SP: {
        name: '염판',
        map: 'SaltPlateList',
        setInfo: {},
        relation:''
      },
      WT: {
        name: '해주',
        map: 'WaterTankList',
        setInfo: {},
        relation:''
      },
      RV: {
        name: '저수조',
        map: 'ReservoirList',
        setInfo: {},
        relation:''
      },
      WO: {
        name: '바다',
        map: 'WaterOutList',
        setInfo: {},
        relation:''
      },
      UT: {
        name: '수중온도',
        map: 'UnderWaterTemperatureList',
        setInfo: { key: 'UnderWaterTemperatureData', startPort: 16001 },
        relation:'ListUnderWaterTemperature'
      },
      MT: {
        name: '모듈온도',
        map: 'ModuleTemperatureList',
        setInfo: { key: 'ModuleTemperatureData', startPort: 17001 },
        relation:'ListModuleTemperature'
      },
      WL: {
        name: '수위',
        map: 'WaterLevelSensorList',
        setInfo: { key: 'WaterLevelData', startPort: 12001 },
        relation:'ListWaterLevel'
      },
      S: {
        name: '염도',
        map: 'SaltRateSensorList',
        setInfo: { key: 'SalinityData', startPort: 13001 },
        relation:'ListSalinity'
      },
      WD: {
        name: '수문',
        map: 'WaterDoorList',
        setInfo: { key: 'WaterDoorData', startPort: 11001 },
        relation:'ListWaterDoor'
      },
      V: {
        name: '밸브',
        map: 'ValveList',
        setInfo: { key: 'ValveData', startPort: 14001 },
        relation:'ListValve'
      },
      P: {
        name: '펌프',
        map: 'PumpList',
        setInfo: { key: 'PumpData', startPort: 15001 },
        relation:'ListPump'
      },

    }

}