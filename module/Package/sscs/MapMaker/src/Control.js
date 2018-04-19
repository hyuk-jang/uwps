const _ = require('lodash')
const {BU} = require('base-util-jh')

const config = require('./config')

class Control {
  /**
   * 
   * @param {config} config 
   */
  constructor(config) {
    this.config = config;

  }
  

  /**
   * Set Map --> WD, P, V
   * Set SetInfo --> WD, P, V
   * @param {Array} objectList config.js 에서 설정한 objectList 값
   */
  makeObjList(objectList) {
    objectList.forEach(objList => {
      _.each(objList, (obj, index) => {
        // BU.CLI(obj)
        let targetPoint = discoverObjectPoint(obj.locatedIdList[0]);
        let finalAxis = calcPlacePoint(obj, targetPoint);

        // Set MAP
        let numId = obj.placeId.replace(/[a-zA-Z]/g, '');
        map.MAP[getResource(obj.placeId, 'map')].push({
          ID: obj.placeId,
          Name: getResource(obj.placeId, 'name') + numId,
          X: finalAxis[0],
          Y: finalAxis[1],
          ImgID: obj.placeImgId
        });\

        // Set SETINFO
        let placeSetInfo = getResource(obj.placeId, 'setInfo');

        if (_.isEmpty(placeSetInfo)) {
          return false;
        }

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
          };
        } else {
          setInfo[index].ID = obj.placeId;
          setInfo[index].Port = `${placeSetInfo.startPort + index}`;
        }
      });
    });
  }

  /**
   * Set Map --> WL, S, WT, MT
   * Set SetInfo --> WL, S, WT, MT
   * @param {Array} valueList config.js 에서 설정한 valueList 값
   */
  makeValueList(valueList) {
    valueList.forEach((cateList, cateIndex) => {
      // BU.CLI(cateList)
      // 해당 이미지 생성 정보 가져옴
      let cateInfo = getListValueList(cateIndex);
      let cateImgInfo = _.findWhere(imgObjList, {
        ID: cateInfo.key
      });
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
          Name: `${getResource(cateInfo.id, 'name')}${Number(tIndex + 1)}`,
          X: x,
          Y: y,
          ImgID: cateImgInfo.ID
        });

        // Set SETINFO
        let placeSetInfo = getResource(cateInfo.id, 'setInfo');
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
          };
        } else {
          setInfo[tIndex].ID = cateInfo.id + Number(tIndex + 1);
          setInfo[tIndex].Port = `${placeSetInfo.startPort + tIndex}`;
        }
      });
    });
  }

  /**
   * config.js valueList index와 매칭되는 객체 생성
   * @param {Number} index config.js valueList Array Index
   * @return {Object} {id, key, list}
   */
  getListValueList(index) {
    let sIndex = index.toString();
    switch (sIndex) {
      case '0':
        return {
          id: 'WL',
          key: 'WLSensor',
          list: 'WaterLevelSensorList'
        };
      case '1':
        return {
          id: 'S',
          key: 'SRSensor',
          list: 'SaltRateSensorList'
        };
      case '2':
        return {
          id: 'UT',
          key: 'UWTemperature',
          list: 'UnderWaterTemperatureList'
        };
      case '3':
        return {
          id: 'MT',
          key: 'MTemperature',
          list: 'ModuleTemperatureList'
        };
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
  makeRelation(relationInfo, objectList, valueList) {
    // BU.CLI(_.flatten(objectList))
    // config objectList Array 2차원 -> 1차원
    let configObjectGroup = _.flatten(objectList);
    // Base로 깔고 갈 Category
    const rCategoryList = ['MT', 'UT', 'WD', 'WL', 'S', 'V', 'P'];
    // const rCategoryList = ['WD', 'WL', 'S', 'V', 'P'];
    // config relation object 순회
    _.each(relationInfo, (rGroup, rKey) => {
      // Relation Category init
      map.RELATION[rKey] = [];
      // config relation category list 순회
      rGroup.forEach((relationObj, index) => {
        // base category setting
        rCategoryList.forEach(ele => relationObj[getResource(ele, 'relation')] = []);

        // Water Way Relation 일 경우
        let locatedIdList = [];
        if (relationObj.ID.indexOf('WW') !== -1) {
          locatedIdList = relationObj.ListSaltPondLine;
        } else {
          locatedIdList.push(relationObj.ID);
        }

        // config flatten objectList 순회 후 relation과 관계가 있다면 저장
        configObjectGroup.forEach(configObj => {
          let parentName = getResource(configObj.placeId, 'relation');
          if (_.intersection(locatedIdList, configObj.locatedIdList).length && parentName.length) {
            relationObj[parentName].push(configObj.placeId);
          }
        });

        // config valueList 순회 후 relation과 관계가 있다면 저장
        valueList.forEach((cateList, cateIndex) => {
          let cateInfo = getListValueList(cateIndex);
          cateList.forEach((targetId, tIndex) => {
            if (locatedIdList.includes(targetId)) {
              relationObj[getResource(cateInfo.id, 'relation')].push(cateInfo.id + Number(tIndex + 1));
            }
          });
        });
        // 최종 Map Relation Category 별로 Save
        map.RELATION[rKey].push(relationObj);
      });
    });
  }

  /**
   * 대상이 그려질 좌표 정보를 가져옴
   * @param {Object} placeObjInfo {id, img, target, axis=[x1, y1]}
   * @param {Array} locatedObjPoint [x1, y1, x2, y2]
   * @return {Array} [x1, y1]
   */
  calcPlacePoint(placeObjInfo, locatedObjPoint) {
    let placeImgInfo = _.findWhere(imgObjList, {
      ID: placeObjInfo.placeImgId
    });
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
  discoverObjectPoint(baseId) {
    // BU.CLIS(baseId, getMapParentName(baseId), map.MAP[getMapParentName(baseId)])
    let targetInfo = _.findWhere(map.MAP[getResource(baseId, 'map')], {
      ID: baseId
    });
    // BU.CLI(targetInfo)
    let imgInfo = _.findWhere(imgObjList, {
      ID: targetInfo.ImgID
    });
    // BU.CLI(baseId, imgInfo)
    let imgType = imgInfo.ImgData.Type;
    let imgData = imgInfo.ImgData;
    let targetPoint = [];
    if (imgType === 'Rect') {
      targetPoint = [
        targetInfo.X, targetInfo.Y, targetInfo.X + imgData.Width, targetInfo.Y + imgData.Height
      ]
    } else if (imgType === 'Line') {
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



}
module.exports = Control;


