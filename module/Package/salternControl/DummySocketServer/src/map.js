require('./map.jsdoc');

/**
 * @type {deviceMap}
 */
const map = {
  drawInfo: {
    frame: {
      mapSize: {
        width: 880,
        height: 1230
      },
      svgModelResourceList: [{
        id: 'salternBlock_001',
        type: 'rect',
        elementDrawInfo: {
          width: 100,
          height: 150,
          color: '#33ffff'
        }
      }, {
        id: 'salternBlock_002',
        type: 'rect',
        elementDrawInfo: {
          width: 100,
          height: 150,
          color: '#33ffff'
        }
      }, {
        id: 'salternLine_001',
        type: 'line',
        elementDrawInfo: {
          strokeWidth: 100,
          color: '#33ccff'
        }
      }, {
        id: 'pump_001',
        type: 'circle',
        elementDrawInfo: {
          radius: 20,
          color: '#9fe667'
        }
      }, {
        id: 'valve_001',
        type: 'squares',
        elementDrawInfo: {
          radius: 20,
          color: '#efb4ce'
        }
      }]
    },
    positionList: [{

    }]
  },
  setInfo: {
    connectInfoList: [{
      type: 'zigbee',
      subType: 'xbee',
      baudRate: 9600,
      port: 'COM5',
      deviceRouterList: [{
        targetId: 'R_GLS_001',
        deviceId: '0013A20040F7B4AD',
        nodeModelList: ['V_101']
      }, {
        targetId: 'R_GLS_002',
        deviceId: '0013A20040F7B454',
        nodeModelList: ['V_102']
      }, {
        targetId: 'R_GLS_003',
        deviceId: '0013A20040F7B42D',
        nodeModelList: ['V_103']
      }, {
        targetId: 'R_GLS_004',
        deviceId: '0013A20040F7B433',
        nodeModelList: ['V_104']
      }, {
        targetId: 'R_GLS_005',
        deviceId: '0013A20040F7ACC8',
        nodeModelList: ['WD_005']
      }, {
        targetId: 'R_GLS_006',
        deviceId: '0013A20040F7B486',
        nodeModelList: ['WD_006']
      }, {
        targetId: 'R_GLS_007',
        deviceId: '0013A20040F7B47C',
        nodeModelList: ['WD_007']
      }, {
        targetId: 'R_GLS_008',
        deviceId: '0013A20040F7AB9C',
        nodeModelList: ['WD_008']
      }, {
        targetId: 'R_GLS_009',
        deviceId: '0013A20040F7B430',
        nodeModelList: ['WD_009']
      }, {
        targetId: 'R_GLS_010',
        deviceId: '0013A20040F7AB7D',
        nodeModelList: ['WD_010']
      }, {
        targetId: 'R_GLS_011',
        deviceId: '0013A20040F7B4A9',
        nodeModelList: ['WD_011']
      }, {
        targetId: 'R_GLS_012',
        deviceId: '0013A20040F7B460',
        nodeModelList: ['WD_012']
      }, {
        targetId: 'R_GLS_013',
        deviceId: '0013A20040F7B49B',
        nodeModelList: ['WD_013']
      }, {
        targetId: 'R_GLS_014',
        deviceId: '0013A20040F7B453',
        nodeModelList: ['WD_014']
      }, {
        targetId: 'R_GLS_015',
        deviceId: '0013A20040F7B474',
        nodeModelList: ['WD_015']
      }, {
        targetId: 'R_V_001',
        deviceId: '0013A20040F7B4A4',
        nodeModelList: ['V_001']
      }, {
        targetId: 'R_V_002',
        deviceId: '0013A20040F7B47F',
        nodeModelList: ['V_002']
      }, {
        targetId: 'R_V_003',
        deviceId: '0013A20040F7B43C',
        nodeModelList: ['V_003']
      }, {
        targetId: 'R_V_004',
        deviceId: '0013A20040F7B455',
        nodeModelList: ['V_004']
      }, {
        targetId: 'R_V_006',
        deviceId: '0013A20040F7B469',
        nodeModelList: ['V_006']
      }, {
        targetId: 'R_V_007',
        deviceId: '0013A20040F7B4A7',
        nodeModelList: ['V_007']
      }, {
        targetId: 'R_P_002',
        deviceId: '0013A20040F7B446',
        nodeModelList: ['P_002']
      }, {
        targetId: 'R_P_003',
        deviceId: '0013A20040F7B44A',
        nodeModelList: ['P_003']
      }, {
        targetId: 'R_P_004',
        deviceId: '0013A20040F7A4E0',
        nodeModelList: ['P_004']
      }, {
        targetId: 'R_P_005',
        deviceId: '0013A20040F7A4D8',
        nodeModelList: ['P_005']
      },]
    }
    ],
    modelInfo: {
      waterDoorList: [{
        targetId: 'WD_005',
        targetName: '수문5'
      }, {
        targetId: 'WD_006',
        targetName: '수문6'
      }, {
        targetId: 'WD_007',
        targetName: '수문7'
      }, {
        targetId: 'WD_008',
        targetName: '수문8'
      }, {
        targetId: 'WD_009',
        targetName: '수문9'
      }, {
        targetId: 'WD_010',
        targetName: '수문10'
      }, {
        targetId: 'WD_011',
        targetName: '수문11'
      }, {
        targetId: 'WD_012',
        targetName: '수문12'
      }, {
        targetId: 'WD_013',
        targetName: '수문13'
      }, {
        targetId: 'WD_014',
        targetName: '수문14'
      }, {
        targetId: 'WD_015',
        targetName: '수문15'
      }],
      valveList: [{
        targetId: 'V_001', 
        target_name: '밸브1'
      },{
        targetId: 'V_002', 
        target_name: '밸브2'
      },{
        targetId: 'V_003', 
        target_name: '밸브3'
      },{
        targetId: 'V_004', 
        target_name: '밸브4'
      },{
        targetId: 'V_006', 
        target_name: '밸브6'
      },{
        targetId: 'V_007', 
        target_name: '밸브7'
      },{
        targetId: 'V_101', 
        target_name: '수문1'
      },{
        targetId: 'V_102', 
        target_name: '수문2'
      },{
        targetId: 'V_103', 
        target_name: '수문3'
      },{
        targetId: 'V_104', 
        target_name: '수문4'
      }],
      pumpList: [{
        targetId: 'P_002',
        target_name: '펌프2'
      },{
        targetId: 'P_003',
        target_name: '펌프3'
      },{
        targetId: 'P_004',
        target_name: '펌프4'
      },{
        targetId: 'P_005',
        target_name: '펌프5'
      }

      ]
    }
  },
  realtionInfo:{

  },
  controlList:[{
    cmdName: '저수조 → 증발지 1',
    trueList: ['V_006', 'V_001', 'V_002', 'V_003', 'V_004', 'P_002'],
    falseList: ['V_101','V_102','V_103','V_104','WD_005']
  },
  {
    cmdName: '저수조 → 증발지 1A',
    trueList: ['V_006', 'V_001', 'P_002'],
    falseList: ['V_101']
  },{
    cmdName: '저수조 → 증발지 1B',
    trueList: ['V_006', 'V_002', 'P_002'],
    falseList: ['V_102']
  },{
    cmdName: '저수조 → 증발지 1C',
    trueList: ['V_006', 'V_003', 'P_002'],
    falseList: ['V_103']
  },{
    cmdName: '저수조 → 증발지 1D',
    trueList: ['V_006', 'V_004', 'P_002'],
    falseList: ['V_104']
  },{
    cmdName: '저수조 → 증발지 일반',
    trueList: ['V_006', 'P_002'],
    falseList: ['WD_005']
  },{
    cmdName: '해주 1 → 증발지 1',
    trueList: ['V_007', 'V_001', 'V_002', 'V_003', 'V_004', 'P_002'],
    falseList: ['V_101','V_102','V_103','V_104','WD_005']
  },{
    cmdName: '해주 1 → 증발지 1A',
    trueList: ['V_007', 'V_001', 'P_002'],
    falseList: ['V_101']
  },{
    cmdName: '해주 1 → 증발지 1B',
    trueList: ['V_007', 'V_002', 'P_002'],
    falseList: ['V_102']
  },{
    cmdName: '해주 1 → 증발지 1C',
    trueList: ['V_007', 'V_003', 'P_002'],
    falseList: ['V_103']
  },{
    cmdName: '해주 1 → 증발지 1D',
    trueList: ['V_007', 'V_004', 'P_002'],
    falseList: ['V_104']
  },{
    cmdName: '증발지 1 → 해주 1',
    trueList: ['V_101','V_102','V_103','V_104','WD_005', 'WD_010'],
    falseList: ['WD_013']
  },
  {
    cmdName: '증발지 1A → 해주 1',
    trueList: ['V_101', 'WD_010'],
    falseList: ['WD_013']
  },{
    cmdName: '증발지 1B → 해주 1',
    trueList: ['V_102', 'WD_010'],
    falseList: ['WD_013']
  },{
    cmdName: '증발지 1C → 해주 1',
    trueList: ['V_103', 'WD_010'],
    falseList: ['WD_013']
  },{
    cmdName: '증발지 1D → 해주 1',
    trueList: ['V_104', 'WD_010'],
    falseList: ['WD_013']
  },{
    cmdName: '증발지 2 → 증발지 3',
    trueList: ['WD_006'],
    falseList: ['WD_007']
  },{
    cmdName: '증발지 3 → 증발지 4',
    trueList: ['WD_007'],
    falseList: ['WD_008']
  },{
    cmdName: '증발지 3 → 해주2',
    trueList: ['WD_008', 'WD_011', 'WD_014'],
    falseList: ['WD_012', 'WD_015']
  },{
    cmdName: '증발지 3 → 해주3',
    trueList: ['WD_008', 'WD_012', 'WD_014'],
    falseList: ['WD_011', 'WD_015']
  },{
    cmdName: '결정지 1 → 해주 3',
    trueList: ['WD_009'],
    falseList: ['WD_012']
  },{
    cmdName: '해주2 → 증발지 2',
    trueList: ['V_007', 'P_004'],
    falseList: []
  },{
    cmdName: '해주3 → 결정지 1',
    trueList: ['V_008', 'P_005'],
    falseList: ['WD_009']
  }],
  
};

module.exports = map;