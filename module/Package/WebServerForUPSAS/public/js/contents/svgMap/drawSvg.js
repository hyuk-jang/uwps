/** @type {{nodeId: string, nodeName: '', text: textElement}[]} */
const writtenSvgTextList = [];

/**
 * @param {string} documentId
 * @param {string=} bgImgUrl // 배경 이미지 url
 * @param {string=} title // 제목
 */
function drawSvgBackground(documentId, bgImgUrl) {
  /** @type {mDeviceMap} */
  const realMap = map;

  // svgCanvas 생성
  const { width: svgCanvasWidth, height: svgCanvasHeight } = realMap.drawInfo.frame.mapSize;
  const svgCanvas = SVG(documentId).size(svgCanvasWidth, svgCanvasHeight);
  svgCanvas.attr({ id: 'svgCanvas' });

  // 배경 이미지 지정
  const backgroundImg = svgCanvas.image(bgImgUrl, svgCanvasWidth, svgCanvasHeight);
  backgroundImg.move(0, 0);

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
  foundSvgTextInfo.text.node.innerHTML += `<tspan id="nodeData" x="${
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

  const foundNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
    _.map(svgNodeInfo.defList, 'id').includes(nDefId),
  );
  if (_.isUndefined(foundNodeInfo)) return false;

  // 0: 장치, 1: 센서, -1: 미분류
  if (foundNodeInfo.is_sensor === 0) {
    const falseValList = ['CLOSE', 'CLOSING', 'OFF', 0, '0'];
    const trueValList = ['OPEN', 'OPENING', 'ON', 1, '1'];

    const isFalseValue = _.includes(falseValList, data.toUpperCase());
    const isTrueValue = _.includes(trueValList, data.toUpperCase());

    const drawedSvgElement = $(`#${nDefId}`);
    // console.log(getSvgElement);
    if (isFalseValue === true && isTrueValue === false) {
      drawedSvgElement.attr({ fill: getNodeBgColor[0] });
    } else if (isFalseValue === false && isTrueValue === true) {
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
 * FIXME: 변수명 수정 확인
 */
function writeSvgText(svgCanvas, defInfo, resourceInfo) {
  const { width, height, radius } = resourceInfo.elementDrawInfo;
  const [x1, y1, x2, y2] = defInfo.point;
  const moveScale = [0, 0];
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

  // FIXME: 추후 수정
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
  isExcludableText(defInfo.id) ? (naming = '') : ''; // FIXME:

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

    // text 커서 모양 설정
    .attr({
      'pointer-events': 'none',
    });

  // FIXME:
  const svgNode = {
    id: defInfo.id,
    name: defInfo.name,
    textX,
    textY,
    text,
  };
  writtenSvgTextList.push(svgNode);
}

/**
 * text를 제외할 요소 찾기. 반환값이  true: 제외
 * @param {string} defId
 */
function isExcludableText(defId) {
  /** @type {mDeviceMap} */
  const realMap = map;
  let isExclusionText; // FIXME:

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
 *
 * @param {socekt} socket
 */
function bindingClickEventNode(socket) {
  /** @type {mDeviceMap} */
  const realMap = map;
<<<<<<< HEAD
  let controlValue;
=======
>>>>>>> a3fc25d13b937e339d8328ffbd9935185a1d4591

  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    svgNodeInfo.defList.forEach(nodeDefInfo => {
      const drawedSvgElement = $(`#${nodeDefInfo.id}`);
      // console.log(drawedSvgElement)
      drawedSvgElement.on('click touchstart', e => {
        const foundSvgNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, info =>
          _.map(info.defList, 'id').includes(nodeDefInfo.id),
        );
        if (_.isUndefined(foundSvgNodeInfo)) return false;

        // 장치 or 센서 구분  1: 센서, 0: 장치, -1: 미분류
        if (foundSvgNodeInfo.is_sensor === 1) {
          BootstrapDialog.show({
            size: BootstrapDialog.SIZE_LARGE,
            title: `${nodeDefInfo.name}`,
            message: `'${
              nodeDefInfo.name
            }' 의 값을 입력하세요.: <input type="text" class="form-control">`,
            buttons: [
              {
                label: 'OK',
                action(dialogItself) {
                  const getDialogValue = dialogItself
                    .getModalBody()
                    .find('input')
                    .val();
                  if (_.isUndefined(getDialogValue)) return false;

                  executeCommand(socket, 3, nodeDefInfo.id);
                  dialogItself.close();
                },
              },
              {
                label: 'CANCEL',
                cssClass: 'btn-primary',
                action(dialogItself) {
                  dialogItself.close();
                },
              },
            ],
          });
        } else {
          BootstrapDialog.show({
            cssClass: 'dialog-vertical-center',
            size: BootstrapDialog.SIZE_LARGE,
            title: `${nodeDefInfo.name}`,
            message: `'${nodeDefInfo.name}' 의 상태를 변경합니다.`,
            buttons: [
              {
                label: 'OPEN',
                action(dialogItself) {
                  executeCommand(socket, 1, nodeDefInfo.id);
                  dialogItself.close();
                },
              },
              {
                label: 'CLOSE',
                action(dialogItself) {
                  executeCommand(socket, 0, nodeDefInfo.id);
                  dialogItself.close();
                },
              },
              {
                label: 'CANCEL',
                cssClass: 'btn-primary',
                action(dialogItself) {
                  dialogItself.close();
                },
              },
            ],
          });
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
function executeCommand(socket, controlValue, nodeId) {
  const requestMsg = {
    commandId: 'SINGLE',
    contents: {
      requestCommandType: 'CONTROL',
      nodeId,
      controlValue,
      rank: 2,
    },
  };
  console.log(requestMsg);
  socket.emit('executeCommand', requestMsg);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {string} svgDrawType rect, polygon, circle, line ...
 * @param {Object} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} defId 그려지는 svg 도형에 주어줄 장소 또는 노드의 defInfo.id 값
 */
function drawSvgElement(svgCanvas, svgDrawType, point, elementDrawInfo, defId) {
  switch (svgDrawType.toString()) {
    case 'rect':
      drawSvgRect(svgCanvas, point, elementDrawInfo, defId);
      break;
    case 'image':
      drawSvgImage(svgCanvas, point, elementDrawInfo, defId);
      break;
    case 'line':
      drawSvgLine(svgCanvas, point, elementDrawInfo, defId);
      break;
    case 'circle':
      drawSvgCircle(svgCanvas, point, elementDrawInfo, defId);
      break;
    case 'polygon':
      drawSvgPolygon(svgCanvas, point, elementDrawInfo, defId);
      break;
    case 'pattern':
      drawSvgPattern(svgCanvas, point, elementDrawInfo, defId);
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
 */
function drawSvgRect(svgCanvas, point, elementDrawInfo, id) {
  const [x, y] = point;

  const { width, height } = elementDrawInfo;
  let { color, radius, opacity } = elementDrawInfo;

  _.isUndefined(radius) ? (radius = 1) : '';
  _.isUndefined(opacity) ? (opacity = 1) : '';

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
 */
function drawSvgLine(svgCanvas, point, elementDrawInfo, id) {
  const [x1, y1, x2, y2] = point;
  let { width, color } = elementDrawInfo;
  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];

  svgCanvas
    .line(x1, y1, x2, y2)
    .stroke({ color: color[0], width })
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
 */
function drawSvgCircle(svgCanvas, point, elementDrawInfo, id) {
  const [x, y] = point;
  let { color } = elementDrawInfo;
  const { radius } = elementDrawInfo;

  // color가 배열이 아니면 배열로 변환
  color = Array.isArray(color) ? color : [color];
  const model = svgCanvas
    .circle(radius)
    .fill(color[0])
    .move(x, y)
    .stroke({ width: 0.5 })
    .attr({
      id,
    });
  drawSvgShadow(model, id);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id 값
 */
function drawSvgPolygon(svgCanvas, point, elementDrawInfo, id) {
  const [x, y] = point;
  let { width, height, color } = elementDrawInfo;
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
    });
  drawSvgShadow(model, id);
}

/**
 *
 * @param {SVG} svgCanvas
 * @param {number[]} point point[]
 * @param {mElementDrawInfo} elementDrawInfo {width, height, radius, color}
 * @param {string} id 그려지는 svg 도형에 주어줄 id값
 */
function drawSvgPattern(svgCanvas, point, elementDrawInfo, id) {
  const [x, y] = point;
  const { width, height } = elementDrawInfo;
  let { color } = elementDrawInfo;
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
      .radius(3.5);
  });
  svgCanvas
    .rect(width, height)
    .move(x, y)
    .fill(pattern)
    .attr({
      id,
    });
}

function drawSvgImage(svgCanvas, point, elementDrawInfo, id) {
  const [x, y] = point;
  const { width, height } = elementDrawInfo;
  const { imgUrl } = elementDrawInfo;
  let { radius, opacity } = elementDrawInfo;

  _.isUndefined(radius) ? (radius = 1) : '';
  _.isUndefined(opacity) ? (opacity = 1) : '';

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
