const _ = require('underscore')
const BU = require('base-util-jh').baseUtil;

const map = require('./testMap');
const config = require('./config');

let imgObjList = map.MAP.ImgObjList;

let finalArr = [];

// MAP 카테고리 초기화
init();
// 수문, 펌프, 밸브 위치 재조정
makeObjList(config.objectList);
// 수위, 염도, 수중온도, 모듈온도 재조정
makeValueList(config.valueList);
// Relation Setting
makeRelation(config.relation, config.objectList, config.valueList);

BU.writeFile('../autoMap.js', `var Map = ${JSON.stringify(map)}`, 'w', (err, res) => {
  if (err) {
    return BU.CLI('Map 자동 생성에 실패하였습니다.')
  }

  BU.CLI('맵 자동생성을 하였습니다.', '../autoMap.js')
})

/**
 * Reset 'MAP' category
 * apply : P, S, UT, V, WD, WL, MT
 * except: SP, WT, RV, WO, SPL
 */
function init() {
  map.MAP.PumpList = [];
  map.MAP.SaltRateSensorList = [];
  map.MAP.UnderWaterTemperatureList = [];
  map.MAP.ValveList = [];
  map.MAP.WaterDoorList = [];
  map.MAP.WaterLevelSensorList = [];
  map.MAP.ModuleTemperatureList = [];
}

/**
 * Set Map --> WD, P, V
 * Set SetInfo --> WD, P, V
 * @param {Array} objectList config.js 에서 설정한 objectList 값
 */
function makeObjList(objectList) {
  objectList.forEach(objList => {
    _.each(objList, (obj, index) => {
      // BU.CLI(obj)
      let targetPoint = discoverObjectPoint(obj.locatedIdList[0]);
      let finalAxis = calcPlacePoint(obj, targetPoint);

      // Set MAP
      map.MAP[getMapParentName(obj.placeId)].push({
        ID: obj.placeId,
        Name: getName(obj.placeId),
        X: finalAxis[0],
        Y: finalAxis[1],
        ImgID: obj.placeImgId
      })

      // Set SETINFO
      let placeSetInfo = getSetInfoParentName(obj.placeId);
      let setInfo = map.SETINFO[placeSetInfo.key];
      if (setInfo === undefined) {
        setInfo = map.SETINFO[placeSetInfo.key] = [];
      }
      if (setInfo[index] === undefined) {
        setInfo[index] = {
          ID: obj.placeId,
          DeviceType: 'Socket',
          BoardID: '',
          IP: 'localhost',
          Port: `${placeSetInfo.startPort + index}`
        }
      } else {
        setInfo[index].ID = obj.placeId;
        setInfo[index].Port = `${placeSetInfo.startPort + index}`;
      }
    })
  })
}

/**
 * Set Map --> WL, S, WT, MT
 * Set SetInfo --> WL, S, WT, MT
 * @param {Array} valueList config.js 에서 설정한 valueList 값
 */
function makeValueList(valueList) {
  valueList.forEach((cateList, cateIndex) => {
    // BU.CLI(cateList)
    // 해당 이미지 생성 정보 가져옴
    let cateInfo = getListValueList(cateIndex);
    let cateImgInfo = _.findWhere(imgObjList, { ID: cateInfo.key });
    // 그려질 위치 반복
    cateList.forEach((targetId, tIndex) => {
      // 그려질 객체 정보 가져옴[x1, y1, x2, y2]
      let locatedObjPoint = discoverObjectPoint(targetId);
      let cenX = locatedObjPoint[0] + ((locatedObjPoint[2] - locatedObjPoint[0]) / 2);
      let eleH = (locatedObjPoint[3] - locatedObjPoint[1]) / 5;
      let indent = 2;

      let x = cateIndex % 2 === 0 ? cenX - indent - cateImgInfo.ImgData.Width : cenX + indent;
      let y = cateIndex / 2 < 1 ? locatedObjPoint[1] + eleH * 2 : locatedObjPoint[1] + eleH * 3;

      // Set MAP
      map.MAP[cateInfo.list].push({
        ID: cateInfo.id + Number(tIndex + 1),
        Name: `${getName(cateInfo.id)} ${Number(tIndex + 1)}`,
        X: x,
        Y: y,
        ImgID: cateImgInfo.ID
      })

      // Set SETINFO
      let placeSetInfo = getSetInfoParentName(cateInfo.id);
      let setInfo = map.SETINFO[placeSetInfo.key];
      if (setInfo === undefined) {
        setInfo = map.SETINFO[placeSetInfo.key] = [];
      }
      if (setInfo[tIndex] === undefined) {
        setInfo[tIndex] = {
          ID: cateInfo.id + Number(tIndex + 1),
          DeviceType: 'Socket',
          BoardID: '',
          IP: 'localhost',
          Port: `${placeSetInfo.startPort + tIndex}`
        }
      } else {
        setInfo[tIndex].ID = cateInfo.id + Number(tIndex + 1);
        setInfo[tIndex].Port = `${placeSetInfo.startPort + tIndex}`;
      }
    })
  })
}


/**
 * config.js valueList index와 매칭되는 객체 생성
 * @param {Number} index config.js valueList Array Index
 * @return {Object} {id, key, list}
 */
function getListValueList(index) {
  let sIndex = index.toString()
  switch (sIndex) {
    case '0':
      return { id: 'WL', key: 'WLSensor', list: 'WaterLevelSensorList' };
    case '1':
      return { id: 'S', key: 'SRSensor', list: 'SaltRateSensorList' };
    case '2':
      return { id: 'UT', key: 'UWTemperature', list: 'UnderWaterTemperatureList' };
    case '3':
      return { id: 'MT', key: 'MTemperature', list: 'ModuleTemperatureList' };
  }
}


/**
 * Set Relation
 * @description Set --> SaltPlateData, WaterTankData, WaterOutData, ReservoirDataj, WaterWayData
 * @description Except --> ValveRankData, FeedRankData, MaxSalinityFeedRankData
 * @param {Object} relationInfo 
 * @param {Array} objectList 
 * @param {Array} valueList 
 */
function makeRelation(relationInfo, objectList, valueList) {
  // BU.CLI(_.flatten(objectList))
  // config objectList Array 2차원 -> 1차원
  let configObjectGroup = _.flatten(objectList);
  // Base로 깔고 갈 Category
  const rCategoryList = ['MT', 'UT', 'WD', 'WL', 'S', 'V', 'P'];
  // config relation object 순회
  _.each(relationInfo, (rGroup, rKey) => {
    // Relation Category init
    map.RELATION[rKey] = [];
    // config relation category list 순회
    rGroup.forEach((relationObj, index) => {
      // base category setting
      rCategoryList.forEach(ele => relationObj[getRelationParentName(ele)] = [])

      // Water Way Relation 일 경우
      let locatedIdList = [];
      if (relationObj.ID.indexOf('WW') !== -1) {
        locatedIdList = relationObj.ListSaltPondLine;
      } else {
        locatedIdList.push(relationObj.ID)
      }

      // config flatten objectList 순회 후 relation과 관계가 있다면 저장
      configObjectGroup.forEach(configObj => {
        if (_.intersection(locatedIdList, configObj.locatedIdList).length) {
          relationObj[getRelationParentName(configObj.placeId)].push(configObj.placeId)
        }
      })

      // config valueList 순회 후 relation과 관계가 있다면 저장
      valueList.forEach((cateList, cateIndex) => {
        let cateInfo = getListValueList(cateIndex);
        cateList.forEach((targetId, tIndex) => {
          if(locatedIdList.includes(targetId)){
            relationObj[getRelationParentName(cateInfo.id)].push(cateInfo.id + Number(tIndex + 1))
          }
        })
      })
      // 최종 Map Relation Category 별로 Save
      // relationObj.ID = relationObj.locatedId;
      // delete relationObj.locatedId;
      map.RELATION[rKey].push(relationObj);
    })
  })
}






/**
 * Return Object Name
 * @param {String} id 객체 id (ex) WD1, WD2, P1, P2, V1
 * @return {String} Object Name 
 */
function getName(id) {
  // if (id.indexOf('SPL') !== -1)
  //   return '수로'
  // else if (id.indexOf('SP') !== -1)
  //   return '염판'
  // else if (id.indexOf('WT') !== -1)
  //   return '해주'
  // else if (id.indexOf('RV') !== -1)
  //   return '저수조'
  // else if (id.indexOf('WO') !== -1)
  //   return '바다'
  if (id.indexOf('UT') !== -1)
    return `수중온도${id.replace('UT', '')}`;
  else if (id.indexOf('MT') !== -1)
    return `모듈온도${id.replace('MT', '')}`;
  else if (id.indexOf('WL') !== -1)
    return `수위${id.replace('WL', '')}`;
  else if (id.indexOf('S') !== -1)
    return `염도${id.replace('S', '')}`;
  else if (id.indexOf('WD') !== -1)
    return `수문${id.replace('WD', '')}`;
  else if (id.indexOf('V') !== -1)
    return `밸브${id.replace('V', '')}`;
  else if (id.indexOf('P') !== -1)
    return `펌프${id.replace('P', '')}`;
}

/**
 * 대상이 그려질 좌표 정보를 가져옴
 * @param {Object} placeObjInfo {id, img, target, axis=[x1, y1]}
 * @param {Array} locatedObjPoint [x1, y1, x2, y2]
 * @return {Array} [x1, y1]
 */
function calcPlacePoint(placeObjInfo, locatedObjPoint) {
  let placeImgInfo = _.findWhere(imgObjList, { ID: placeObjInfo.placeImgId });
  let placeImgData = placeImgInfo.ImgData;
  let placeImgType = placeImgInfo.ImgData.Type;

  let targetAxis = [];

  let x = locatedObjPoint[0] + (placeObjInfo.axis[0] * (locatedObjPoint[2] - locatedObjPoint[0]));
  let y = locatedObjPoint[1] + (placeObjInfo.axis[1] * (locatedObjPoint[3] - locatedObjPoint[1]));
  if (placeImgType === 'Rect') {
    x = x - (placeObjInfo.axis[0] * placeImgData.Width) + (placeObjInfo.xMoveScale * placeImgData.Width)
    y = y - (placeObjInfo.axis[1] * placeImgData.Height) + (placeObjInfo.yMoveScale * placeImgData.Height)
  } else if (placeImgType === 'Squares' || placeImgType === 'Circle') {
    x = x - ((placeObjInfo.axis[0] - 0.5) * placeImgData.Radius * 2) + (placeObjInfo.xMoveScale * (placeImgData.Radius * 2))
    y = y - ((placeObjInfo.axis[1] - 0.5) * placeImgData.Radius * 2) + (placeObjInfo.yMoveScale * (placeImgData.Radius * 2))
  }

  targetAxis = [x, y];
  return targetAxis;
}

/**
 * 해당 객체 ID가 그려지고 있는 좌표 포인트를 가져옴
 * @param {String} baseId id
 * @return {Array} [x1, y1, x2, y2] Rect 기준으로 가져옴
 */
function discoverObjectPoint(baseId) {
  let targetInfo = _.findWhere(map.MAP[getMapParentName(baseId)], { ID: baseId });
  let imgInfo = _.findWhere(imgObjList, { ID: targetInfo.ImgID });
  // BU.CLI(baseId, imgInfo)
  let imgType = imgInfo.ImgData.Type;
  let imgData = imgInfo.ImgData;
  let targetPoint = [];
  if (imgType === 'Rect') {
    targetPoint = [
      targetInfo.X, targetInfo.Y, targetInfo.X + imgData.Width, targetInfo.Y + imgData.Height
    ]
  }
  else if (imgType === 'Line') {
    let len = imgData.StrokeWidth / 2;
    if (targetInfo.Points[1] === targetInfo.Points[3]) {
      targetPoint = [
        targetInfo.Points[0], targetInfo.Points[1] - len, targetInfo.Points[2], targetInfo.Points[3] + len
      ]
    } else {
      targetPoint = [
        targetInfo.Points[0] - len, targetInfo.Points[1], targetInfo.Points[2] + len, targetInfo.Points[3]
      ]
    }
  }
  return targetPoint;
}

/**
 * Return an string for writing 'MAP' Category
 * @param {String} id Object Id => WD1, WD2, P1
 * @return {String} Map Category
 */
function getMapParentName(id) {
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
  else if (id.indexOf('WD') !== -1)
    return 'WaterDoorList'
  else if (id.indexOf('V') !== -1)
    return 'ValveList'
  else if (id.indexOf('P') !== -1)
    return 'PumpList'
}

/**
 * Return an object for writing 'SETINFO'
 * @param {String} id Object Id => WD1, WD2, P1
 * @return {Object} {key, startPort}
 */
function getSetInfoParentName(id) {
  if (id.indexOf('WD') !== -1)
    return { key: 'WaterDoorData', startPort: 11001 }
  else if (id.indexOf('WL') !== -1)
    return { key: 'WaterLevelData', startPort: 12001 }
  else if (id.indexOf('UT') !== -1)
    return { key: 'UnderWaterTemperatureData', startPort: 16001 }
  else if (id.indexOf('MT') !== -1)
    return { key: 'ModuleTemperatureData', startPort: 17001 }
  else if (id.indexOf('S') !== -1)
    return { key: 'SalinityData', startPort: 13001 }
  else if (id.indexOf('V') !== -1)
    return { key: 'ValveData', startPort: 14001 }
  else if (id.indexOf('P') !== -1)
    return { key: 'PumpData', startPort: 15001 }
}



/**
 * Return an object for writing 'RELATION'
 * @param {String} id Object Id => WD1, WD2, P1
 * @return {String} Category
 */
function getRelationParentName(id) {
  if (id.indexOf('SPL') !== -1)
    return 'ListSaltPondLine'
  else if (id.indexOf('MT') !== -1)
    return 'ListModuleTemperature'
  else if (id.indexOf('UT') !== -1)
    return 'ListUnderWaterTemperature'
  else if (id.indexOf('WD') !== -1)
    return 'ListWaterDoor'
  else if (id.indexOf('WL') !== -1)
    return 'ListWaterLevel'
  else if (id.indexOf('S') !== -1)
    return 'ListSalinity'
  else if (id.indexOf('V') !== -1)
    return 'ListValve'
  else if (id.indexOf('P') !== -1)
    return 'ListPump'
}