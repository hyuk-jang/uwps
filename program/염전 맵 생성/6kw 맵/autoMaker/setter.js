

let _ = require('underscore')
let BU = require('base-util-jh').baseUtil;

const fs = require('fs');


let map = require('../map');




let pump = [
  {
    id: 'P1',
    target: 'WO1',
    img: 'Pump_A',
    direction: 7,
    xCriPer: 100,
    yCriper: 0
  },
  {
    id: 'P2',
    target: 'RV1',
    img: 'Pump_A',
    direction: 1,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'P3',
    target: 'WT1',
    img: 'Pump_A',
    direction: 1,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'P4',
    target: 'WT2',
    img: 'Pump_A',
    direction: 5,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'P5',
    target: 'WT3',
    img: 'Pump_A',
    direction: 5,
    xCriPer: 0,
    yCriper: 0
  },
]

let valve = [
  {
    id: 'V1',
    target: 'SP1',
    img: 'Valve_A',
    direction: 7,
  },
  {
    id: 'V2',
    target: 'SP2',
    img: 'Valve_A',
    direction: 5,
  },
  {
    id: 'V3',
    target: 'SP3',
    img: 'Valve_A',
    direction: 7,
  },
  {
    id: 'V4',
    target: 'SP4',
    img: 'Valve_A',
    direction: 5,
  },
  {
    id: 'V5',
    target: 'SP5',
    img: 'Valve_A',
    direction: 5,
  },
]

let waterDoor = [
  {
    id: 'WD1',
    target: 'SP1',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD2',
    target: 'SP2',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD3',
    target: 'SP3',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD4',
    target: 'SP4',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD5',
    target: 'SP5',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD6',
    target: 'SP6',
    img: 'WaterDoor_B',
    direction: 4,
    xCriPer: 0,
    yCriper: 80
  },
  {
    id: 'WD7',
    target: 'SP7',
    img: 'WaterDoor_B',
    direction: 4,
    xCriPer: 0,
    yCriper: 80
  },
  {
    id: 'WD8',
    target: 'SP8',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD9',
    target: 'SP9',
    img: 'WaterDoor_A',
    direction: 5,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD10',
    target: 'WT1',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD11',
    target: 'WT2',
    img: 'WaterDoor_A',
    direction: 5,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD12',
    target: 'WT3',
    img: 'WaterDoor_A',
    direction: 5,
    xCriPer: 0,
    yCriper: 0
  },
  {
    id: 'WD13',
    target: 'SPL2',
    img: 'WaterDoor_A',
    direction: 3,
    xCriPer: 100,
    yCriper: 0
  },
  {
    id: 'WD14',
    target: 'SPL4',
    img: 'WaterDoor_A',
    direction: 5,
    xCriPer: 100,
    yCriper: 0
  },
  {
    id: 'WD15',
    target: 'WO2',
    img: 'WaterDoor_A',
    direction: 1,
    xCriPer: 0,
    yCriper: 0
  },
]



let waterLevel = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9', 'SP10', 'WT1', 'WT2', 'WT3', 'RV1'];
let salinity = ['SP7', 'WT1', 'WT2', 'WT3'];
let brineTemperature = ['SP1', 'SP2', 'SP3', 'SP4', 'SP5', 'SP6', 'SP7', 'SP8', 'SP9', 'SP10'];
let moduleTemperature = ['SP1', 'SP2', 'SP3', 'SP4'];


let objectList = [
  pump, valve, waterDoor
]

let valueList = [
  waterLevel, salinity, brineTemperature, moduleTemperature
]


let imgObjList = map.MAP.ImgObjList;

objectList.forEach(objList => {
  _.each(objList, obj => {
    let imgInfo = _.findWhere(imgObjList, { ID: obj.img });

    // BU.CLI(obj)
    // BU.CLIS(map.MAP[getParentName(obj.target)], obj.target)
    // let targetInfo = _.findWhere(map.MAP[getParentName(obj.target)], { ID: obj.target });
    // BU.CLI(targetInfo)
    let targetAxis = calcAxis(obj.target);
    BU.CLI(targetAxis)
  })
})

function calcAxis(baseId) {
  let targetInfo = _.findWhere(map.MAP[getParentName(baseId)], { ID: baseId });
  let imgInfo = _.findWhere(imgObjList, { ID: targetInfo.ImgID });
  // BU.CLI(baseId, imgInfo)
  let imgType = imgInfo.ImgData.Type;
  let imgData = imgInfo.ImgData;
  let targetAxis = [];
  if (imgType === 'Rect') {
    targetAxis = [
      targetInfo.X, targetInfo.Y, targetInfo.X + imgData.Width, targetInfo.Y + imgData.Height
    ]
  } else if (imgType === 'Squares') {
    targetAxis = [
      targetInfo.X - imgData.Width / 2, targetInfo.Y - imgData.Height / 2, targetInfo.X + imgData.Width / 2, targetInfo.Y + imgData.Height / 2
    ]
  } else if (imgType === 'Circle') {
    targetAxis = [
      targetInfo.X - imgData.Width / 2, targetInfo.Y - imgData.Height / 2, targetInfo.X + imgData.Width / 2, targetInfo.Y + imgData.Height / 2
    ]
  } else if (imgType === 'Line') {
    let len = imgData.StrokeWidth / 2;
    if (targetInfo.Points[0] === targetInfo.Points[2]) {
      targetAxis = [
        targetInfo.Points[0], targetInfo.Points[1] - len, targetInfo.Points[2], targetInfo.Points[3] - len
      ]
    } else {
      targetAxis = [
        targetInfo.Points[0] - len, targetInfo.Points[1], targetInfo.Points[2] - len, targetInfo.Points[3]
      ]
    }
  } else {

  }

  return targetAxis;
}


function getParentName(id) {
  if (id.indexOf('SPL') !== -1)
    return 'SaltPondLineList'
  else if (id.indexOf('SP') !== -1)
    return 'SaltPlateList'
  else if (id.indexOf('WT') !== -1)
    return 'WaterTankList'
  else if (id.indexOf('RV') !== -1)
    return 'ReservoirList'
  else if (id.indexOf('WO') !== -1)
    return 'WaterOutList'

}



BU.CLI('hi')