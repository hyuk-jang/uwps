/** @type {{nodeId: string, nodeName: '', text: textElement}[]} */
const writtenSvgTextList = [];

/**
 * @param {string} documentId
 * @param {string=} title // 제목
 * @param {Boolean=} isShow // true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgBasePlace(documentId, isShow = true) {
  /** @type {mDeviceMap} */
  const realMap = map;

  // svgCanvas 생성
  const { width: svgCanvasWidth, height: svgCanvasHeight } = realMap.drawInfo.frame.mapInfo;
  const {
    backgroundData,
    backgroundPosition = [0, 0],
  } = realMap.drawInfo.frame.mapInfo.backgroundInfo;
  const svgCanvas = SVG(documentId).size(svgCanvasWidth, svgCanvasHeight);

  svgCanvas.attr({ id: 'svgCanvas' });

  // 배경 이미지 지정
  const backgroundImg = svgCanvas.image(backgroundData);
  backgroundImg.move(backgroundPosition[0], backgroundPosition[1]);

  // Place 그리기
  realMap.drawInfo.positionInfo.svgPlaceList.forEach(svgPlaceInfo => {
    svgPlaceInfo.defList.forEach(defInfo => {
      /** @type {mSvgModelResource} */
      const resourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
        id: defInfo.resourceId,
      });
      if (_.isUndefined(resourceInfo)) return false;

      drawSvgElement(
        svgCanvas,
        resourceInfo.type,
        defInfo.point,
        resourceInfo.elementDrawInfo,
        defInfo.id,
        isShow,
      );
      writeSvgText(svgCanvas, defInfo, resourceInfo);
    });
  });

  // node 그리기
  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    svgNodeInfo.defList.forEach(defInfo => {
      /** @type {mSvgModelResource} */
      const resourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
        id: defInfo.resourceId,
      });
      if (_.isUndefined(resourceInfo)) return false;

      drawSvgElement(
        svgCanvas,
        resourceInfo.type,
        defInfo.point,
        resourceInfo.elementDrawInfo,
        defInfo.id,
        isShow,
      );
      writeSvgText(svgCanvas, defInfo, resourceInfo);
    });
  });
}

/**
 * @param {string} nodeDefId
 * @param {number|string} data 데이터 값
 *
 */
function showNodeData(nodeDefId, data = '') {
  changeNodeColor(nodeDefId, data);
  let dataUnit = getDataUnit(nodeDefId);
  if (data === '' || _.isNull(dataUnit)) dataUnit = '';
  let [dx, dy, style] = [0, 15, 'font-size: 15pt; fill: #05f605; stroke-width: 0.2'];
  const changedAllNodeTspanEle = getChangedNodeTspanEle(config);
  const changedSingleNodeTspanEle = getChangedNodeTspanEle(config, nodeDefId);

  const foundSvgTextInfo = _.find(writtenSvgTextList, { id: nodeDefId });
  if (_.isUndefined(foundSvgTextInfo)) return false;

  // <tspan> 태그 속성 전체 적용
  if (changedAllNodeTspanEle) {
    const changedNodeTspanEle = getChangedNodeTspanEle(config);
    dx = changedNodeTspanEle.allDx;
    dy = changedNodeTspanEle.allDy;
    style = changedNodeTspanEle.allStyle;
  }

  foundSvgTextInfo.text.node.innerHTML = `<tspan x="${foundSvgTextInfo.textX}"> ${
    foundSvgTextInfo.name
  }</tspan>`; // node 이름 표시
  foundSvgTextInfo.text.node.innerHTML += `<tspan id="nodeData" class ="${nodeDefId}" value="${data}" x="${
    foundSvgTextInfo.textX
  }" style="${style}" dx="${dx}" dy="${dy}">${data}</tspan>`; // data 표시
  foundSvgTextInfo.text.node.innerHTML += `<tspan>${dataUnit}</tspan>`; // data 단위 표시

  // <tspan> 태그 속성 단일 적용
  if (changedSingleNodeTspanEle) {
    const { targetDx, targetDy, targetStyle } = getChangedNodeTspanEle(config, nodeDefId);
    const nodeDataTspanTag = _.head($('#nodeData'));
    nodeDataTspanTag.attributes.dx.value = targetDx;
    nodeDataTspanTag.attributes.dy.value = targetDy;
    nodeDataTspanTag.style.cssText = targetStyle;
  }
}

/**
 *
 * @param {string} nDefId
 * @param {number|string} data
 */
function changeNodeColor(nDefId, data) {
  /** @type {mDeviceMap} */
  const realMap = map;
  let getNodeBgColor;

  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    const foundNodeDefInfo = _.find(svgNodeInfo.defList, { id: nDefId });
    if (_.isUndefined(foundNodeDefInfo)) return false;

    const foundSvgModelResourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
      id: foundNodeDefInfo.resourceId,
    });
    getNodeBgColor = foundSvgModelResourceInfo.elementDrawInfo.color;
  });

  const foundNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNo =>
    _.map(svgNo.defList, 'id').includes(nDefId),
  );
  if (_.isUndefined(foundNodeInfo)) return false;

  // 0: 장치, 1: 센서, -1: 미분류
  if (foundNodeInfo.is_sensor === 0) {
    const checkDataStatus = checkDataType(data);
    const drawedSvgElement = $(`#${nDefId}`);

    if (checkDataStatus === 'falseData') {
      drawedSvgElement.attr({ fill: getNodeBgColor[0], opacity: 0.8 });
    } else if (checkDataStatus === 'trueData') {
      drawedSvgElement.attr({ fill: getNodeBgColor[1] });
    } else {
      drawedSvgElement.attr({ fill: getNodeBgColor[2] });
    }
  }
}

/**
 * 텍스트 그리기
 * @param {SVG} svgCanvas
 * @param {defInfo} defInfo 장치, 노드의  id, resourceId, point[] 정보
 * @param {mSvgModelResource} resourceInfo 장치, 노드의 resource id, type, elemetDrawInfo[width,height,radius,...] 정보
 */
function writeSvgText(svgCanvas, defInfo, resourceInfo) {
  const { width, height, radius } = resourceInfo.elementDrawInfo;
  const [x1, y1, x2, y2] = defInfo.point;
  const changedAllTextStyle = getChangedTextStyle(config);
  const changedSingleTextStyle = getChangedTextStyle(config, defInfo.id);
  let naming = defInfo.name; // defInfo.name: 한글, defInfo.id: 영문
  let [textX, textY, textColor, textSize, leading, anchor] = [0, 0, '', 0, '', ''];

  // svgPositionList를 검색하여 장치인지 센서인지 정의
  let foundSvgInfo = _.find(map.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
    _.map(svgNodeInfo.defList, 'id').includes(defInfo.id),
  );
  if (_.isUndefined(foundSvgInfo)) {
    foundSvgInfo = _.find(map.drawInfo.positionInfo.svgPlaceList, svgNodeInfo =>
      _.map(svgNodeInfo.defList, 'id').includes(defInfo.id),
    );
    if (_.isUndefined(foundSvgInfo)) return false;
  }

  if (foundSvgInfo.is_sensor === 1) {
    textColor = 'black';
    anchor = 'middle';
    textSize = 11;
    leading = '1.1em';
  } else if (foundSvgInfo.is_sensor === 0) {
    textColor = 'black';
    anchor = 'middle';
    textSize = 11;
    leading = '1.1em';
  } else if (foundSvgInfo.is_sensor === -1) {
    textColor = 'black';
    anchor = 'middle';
    textSize = 11;
    leading = '1.1em';
  } else {
    textColor = 'black';
    anchor = 'middle';
    textSize = 25;
    leading = '0.8em';
  }

  // 사각형, 패턴 형식
  if (
    resourceInfo.type === 'rect' ||
    resourceInfo.type === 'pattern' ||
    resourceInfo.type === 'image'
  ) {
    textX = x1 + width / 2;
    textY = y1 + height / 2;

    // 줄 형식
  } else if (resourceInfo.type === 'line') {
    if (x1 === x2) {
      textX = x1;
      textY = y1 - (y1 - y2) / 2;
    } else {
      textX = x1 + (x2 - x1) / 2;
      textY = y1;
    }

    // 원
  } else if (resourceInfo.type === 'circle') {
    textX = x1 + radius / 2;
    textY = y1 + radius / 2;

    // 마름모
  } else if (resourceInfo.type === 'polygon') {
    textX = x1 + width;
    textY = y1 + height;
  }

  // FIXME: 비구조화 작업 필요
  if (changedAllTextStyle) {
    const changedTextStyle = getChangedTextStyle(config);
    textSize += changedTextStyle.textSize;
    textColor = changedTextStyle.textColor;
    textX += changedTextStyle.moveScale[0];
    textY += changedTextStyle.moveScale[1];
    leading = changedTextStyle.leading;
    anchor = changedTextStyle.anchor;
  }

  if (changedSingleTextStyle) {
    const changedTextStyle = getChangedTextStyle(config, defInfo.id);
    textSize += changedTextStyle.styleInfo.textSize;
    textColor = changedTextStyle.styleInfo.textColor;
    textX += changedTextStyle.styleInfo.moveScale[0];
    textY += changedTextStyle.styleInfo.moveScale[1];
    leading = changedTextStyle.styleInfo.leading;
    anchor = changedTextStyle.styleInfo.anchor;
  }

  // 제외목록 체크
  isExcludableText(defInfo.id) ? (naming = '') : '';
  const text = svgCanvas.text(naming);
  text
    .move(textX, textY)
    .font({
      fill: textColor,
      size: textSize,
      anchor,
      leading,
      weight: 'bold',
    })
    .attr({
      'pointer-events': 'none', // text 커서 모양 설정
    });

  const drawedNodeInfo = {
    id: defInfo.id,
    name: defInfo.name,
    textX,
    textY,
    text,
  };
  writtenSvgTextList.push(drawedNodeInfo);
}

/**
 * text를 제외할 요소 찾기. 반환값이  true: 제외
 * @param {string} defId
 */
function isExcludableText(defId) {
  /** @type {mDeviceMap} */
  const realMap = map;
  let isExclusionText;

  const foundPlaceInfo = _.find(realMap.drawInfo.positionInfo.svgPlaceList, svgPlaceInfo =>
    _.map(svgPlaceInfo.defList, 'id').includes(defId),
  );
  if (_.isUndefined(foundPlaceInfo)) {
    const foundNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
      _.map(svgNodeInfo.defList, 'id').includes(defId),
    );
    isExclusionText = _.includes(
      realMap.relationInfo.exclusionTextDefIdList,
      foundNodeInfo.nodeDefId,
    );
  } else {
    isExclusionText = _.includes(
      realMap.relationInfo.exclusionTextDefIdList,
      foundPlaceInfo.placeId,
    );
  }

  return isExclusionText;
}

/**
 *  그려진 노드에 제어기능을 바인딩.
 * @param {socekt} socket
 */
function bindingClickEventNode(socket) {
  /** @type {mDeviceMap} */
  const realMap = map;

  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    svgNodeInfo.defList.forEach(nodeDefInfo => {
      const $drawedSvgElement = $(`#${nodeDefInfo.id}`);
      // console.log(drawedSvgElement)
      $drawedSvgElement.on('click touchstart', e => {
        const foundSvgNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, info =>
          _.map(info.defList, 'id').includes(nodeDefInfo.id),
        );
        if (_.isUndefined(foundSvgNodeInfo)) return false;

        // 장치 or 센서 구분  1: 센서, 0: 장치, -1: 미분류
        if (foundSvgNodeInfo.is_sensor === 0) {
          const $nodeTspanEleInfo = $(`tspan.${nodeDefInfo.id}`);
          const currentNodeStatus = _.head($nodeTspanEleInfo).innerHTML;
          const checkedDataStatus = checkDataType(currentNodeStatus);
          if (checkedDataStatus === 'trueData') {
            const confirmBool = confirm(`'${nodeDefInfo.name}' 을(를) 닫으시겠습니까?`);
            confirmBool ? executeCommand(socket, 2, nodeDefInfo.id) : null;
          } else if (checkedDataStatus === 'falseData') {
            const confirmBool = confirm(`'${nodeDefInfo.name}' 을(를) 여시겠습니까?`);
            confirmBool ? executeCommand(socket, 1, nodeDefInfo.id) : null;
          } else {
            alert('장치 상태 이상');
          }
        }
      });
    });
  });
}

/**
 *
 * @param {socket} socket
 * @param {string} controlType 0: 장치 (Close, Off), 1: 장치 (Open, On), 3: 장치 값 설정
 * @param {string} nodeId
 */
function executeCommand(socket, controlType, nodeId) {
  const requestMsg = {
    commandId: 'SINGLE',
    contents: {
      requestCommandType: 'CONTROL',
      nodeId,
      controlType,
      rank: 2,
    },
  };
  socket.emit('executeCommand', requestMsg);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {string} svgDrawType rect, polygon, circle, line ...
 * @param {Object} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} defId 그려지는 svg 도형에 주어줄 장소 또는 노드의 defInfo.id 값
 * @param {Boolean} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgElement(svgCanvas, svgDrawType, point, elementDrawInfo, defId, isShow = true) {
  switch (svgDrawType.toString()) {
    case 'rect':
      drawSvgRect(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    case 'image':
      drawSvgImage(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    case 'line':
      drawSvgLine(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    case 'circle':
      drawSvgCircle(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    case 'polygon':
      drawSvgPolygon(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    case 'pattern':
      drawSvgPattern(svgCanvas, point, elementDrawInfo, defId, isShow);
      break;
    default:
      break;
  }
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color, opactiy}
 * @param {string} id 그려지는 svg 도형에 주어줄 id 값
 * @param {Boolean=} isShow  true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgRect(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x, y] = point;
  const { width, height, radius = 1 } = elementDrawInfo;
  let { color, opacity = 1 } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];
  const model = svgCanvas
    .rect(width, height)
    .fill(color[0])
    .move(x, y)
    .radius(radius)
    .attr({
      id,
      radius,
      opacity,
    });
  drawSvgShadow(model, id);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id 값
 * @param {Boolean=} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgLine(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x1, y1, x2, y2] = point;
  const { width } = elementDrawInfo;
  let { color, opacity = 1 } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];

  svgCanvas
    .line(x1, y1, x2, y2)
    .stroke({ color: color[0], width, opacity })
    .attr({
      id,
    });
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id 값
 * @param {Boolean=} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgCircle(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x, y] = point;
  let { color, opacity = 1 } = elementDrawInfo;
  const { radius } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];
  const model = svgCanvas
    .circle(radius)
    .fill(color[0])
    .move(x, y)
    .stroke({ width: 0.5 })
    .attr({
      id,
      opacity,
    });
  drawSvgShadow(model, id);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id 값
 * @param {Boolean=} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgPolygon(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x, y] = point;
  const { width, height } = elementDrawInfo;
  let { color, opacity = 1 } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];

  const model = svgCanvas.polyline(
    `${width},${0} ${width * 2},${height} ${width},${height * 2} ${0},${height}`,
  );
  model
    .fill(color[0])
    .move(x, y)
    .stroke({ width: 0.5 })
    .attr({
      id,
      opacity,
    });
  drawSvgShadow(model, id);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id값
 * @param {Boolean=} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgPattern(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x, y] = point;
  const { width, height, radius = 1 } = elementDrawInfo;
  let { color, opacity = 1 } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];

  // 그림자를 적용하기위해 pattern 뒤에 사각형 그리기.
  const model = svgCanvas.rect(width, height);
  model.move(x, y).stroke({ color: 'black' });

  drawSvgShadow(model, id);

  // pattern 안의 작은 사각형의 크기
  const patternSize = 21;
  const pattern = svgCanvas.pattern(patternSize, patternSize, add => {
    add.rect(patternSize, patternSize).fill('white');
    add
      .rect(patternSize, patternSize)
      .move(0.4, 0.4)
      .fill(color[0])
      .radius(radius)
      .attr({
        opacity,
      });
  });
  svgCanvas
    .rect(width, height)
    .move(x, y)
    .fill(pattern)
    .attr({
      id,
      opacity,
    });
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id값
 * @param {Boolean=} isShow true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgImage(svgCanvas, point, elementDrawInfo, id, isShow = true) {
  const [x, y] = point;
  const { width, height, imgUrl, radius = 1 } = elementDrawInfo;
  let { opacity = 1 } = elementDrawInfo;

  isShow ? opacity : (opacity = 0);

  const model = svgCanvas
    .image(imgUrl)
    .move(x, y)
    .size(width, height)
    .attr({
      id,
      radius,
      opacity,
    });
  drawSvgShadow(model, id);
}

/**
 * 그림자
 * @param {SVG} model 그려질 장소.
 * @param {string} defId 장소와 노드를 구분하기 위한 장소 또는 노드의 defId 값
 */
function drawSvgShadow(model, defId) {
  if (isSensor(defId)) {
    model.filter(add => {
      const blur = add
        .offset(0, 5)
        .in(add.sourceAlpha)
        .gaussianBlur(3);
      add.blend(add.source, blur);
    });
  } else {
    model.filter(add => {
      const blur = add
        .offset(7, 7)
        .in(add.sourceAlpha)
        .gaussianBlur(4);

      add.blend(add.source, blur);
    });
  }
}

/**
 * true: 센서, false: 장소
 * @param {string} nDefId
 */
function isSensor(nDefId) {
  /** @type {mDeviceMap} */
  const realMap = map;

  const foundNodeDefInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
    _.map(svgNodeInfo.defList, 'id').includes(nDefId),
  );
  if (_.isUndefined(foundNodeDefInfo)) return false;

  return true;
}

/**
 * 데이터 단위 찾기
 * @param {string} nDefId 단위를 가져올  nodeDefInfoId
 */
function getDataUnit(nDefId) {
  /** @type {mDeviceMap} */
  const realMap = map;

  const foundUnit = _.find(realMap.setInfo.nodeStructureList, nodeStructureInfo =>
    _.map(nodeStructureInfo.defList, 'target_prefix').includes(_.replace(nDefId, /[_\d]/g, '')),
  );
  if (_.isUndefined(foundUnit)) return false;
  return foundUnit.data_unit;
}

/**
 *  config의 변경된 노드 <tspan> 속성을 가져온다
 * @param {config} config
 * @param {string} nodeDefId
 */
function getChangedNodeTspanEle(config, nodeDefId) {
  let nodeTspanEle;
  if (_.isUndefined(nodeDefId)) {
    nodeTspanEle = config.allNodeTspanEleInfo;
  } else {
    const foundSingleNodeTspanInfo = _.find(config.singleNodeTspanEleList, {
      nodeId: nodeDefId,
    });
    if (_.isUndefined(foundSingleNodeTspanInfo)) return false;
    nodeTspanEle = foundSingleNodeTspanInfo;
  }

  return nodeTspanEle;
}

/**
 * config의 변경된 text style 속성을 가져온다.
 * @param {config} config
 * @param {string} targetId
 */
function getChangedTextStyle(config, targetId) {
  let foundTextStyleInfo;
  if (_.isUndefined(targetId)) {
    foundTextStyleInfo = config.allTextStyleInfo;
  } else {
    foundTextStyleInfo = _.find(config.singleTextStyleList, { targetId });
    if (_.isUndefined(foundTextStyleInfo)) return false;
  }

  return foundTextStyleInfo;
}

/**
 * 데이터가 true값인지 false값인지 구분한다.
 * @param {string} data
 */
function checkDataType(data) {
  const falseValList = ['CLOSE', 'CLOSING', 'OFF', 0, '0'];
  const trueValList = ['OPEN', 'OPENING', 'ON', 1, '1'];
  const isFalseValue = _.includes(falseValList, data.toUpperCase());
  const isTrueValue = _.includes(trueValList, data.toUpperCase());
  let result;

  if (isTrueValue && isFalseValue === false) {
    result = 'trueData';
  } else if (isTrueValue === false && isFalseValue) {
    result = 'falseData';
  } else {
    result = 'error';
  }
  return result;
}
