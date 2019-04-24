const TRUE_DATA = '1';
const FALSE_DATA = '0';
const ERROR_DATA = '-1';

/** @type {{nodeId: string, nodeName: '', text: textElement}[]} */
const writtenSvgTextList = [];

/**
 * @param {string} documentId // 그려질 div의 id
 * @param {string=} title // 제목
 * @param {Boolean=} isShow // true: 화면 표시 (기본값), false: 숨김
 */
function drawSvgBasePlace(documentId, isText, isShow = true) {
  /** @type {mDeviceMap} */
  const realMap = map;

  // svgCanvas 생성
  const { width: svgCanvasWidth, height: svgCanvasHeight } = realMap.drawInfo.frame.mapInfo;
  const {
    backgroundData,
    backgroundPosition = [0, 0],
  } = realMap.drawInfo.frame.mapInfo.backgroundInfo;
  const svgCanvas = SVG(documentId).size(svgCanvasWidth, svgCanvasHeight);

  // 팬줌 초기 맵 사이즈를 지정하기 위한 그려지는 공간의 id 지정
  svgCanvas.attr({ id: 'svgCanvas' });

  // map에 배경의 데이터가 있을경우 배경 이미지 지정
  const backgroundImg = svgCanvas.image(backgroundData);
  backgroundImg.move(backgroundPosition[0], backgroundPosition[1]);

  // 장소 그리기
  realMap.drawInfo.positionInfo.svgPlaceList.forEach(svgPlaceInfo => {
    svgPlaceInfo.defList.forEach(placeDefInfo => {
      /** @type {mSvgModelResource} */
      const placeSvgResourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
        id: placeDefInfo.resourceId,
      });
      if (_.isUndefined(placeSvgResourceInfo)) return false;

      // 장소에 맞는 도형을 찾아 그린다.
      drawSvgElement(
        svgCanvas,
        placeSvgResourceInfo.type,
        placeDefInfo.point,
        placeSvgResourceInfo.elementDrawInfo,
        placeDefInfo.id,
        isShow,
      );
      // 그려진 장소 위에 해당 장소의 이름 그리기
      writeSvgText(svgCanvas, placeDefInfo, placeSvgResourceInfo, isText);
    });
  });

  // 장비, 센서 그리기
  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    svgNodeInfo.defList.forEach(nodeDefInfo => {
      /** @type {mSvgModelResource} */
      const nodeSvgResourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
        id: nodeDefInfo.resourceId,
      });
      if (_.isUndefined(nodeSvgResourceInfo)) return false;

      // 장비, 센서에 맞는 도형을 찾아 그린다.
      drawSvgElement(
        svgCanvas,
        nodeSvgResourceInfo.type,
        nodeDefInfo.point,
        nodeSvgResourceInfo.elementDrawInfo,
        nodeDefInfo.id,
        isShow,
      );
      // 그려진 장비, 센서 위에 해당 장소의 이름 그리기
      writeSvgText(svgCanvas, nodeDefInfo, nodeSvgResourceInfo, isText);
    });
  });
}

/**
 * 노드 또는 센서에 데이터 표시
 * @param {string} nodeDefId
 * @param {number|string} data 데이터 값
 */
function showNodeData(nodeDefId, data = '', isChangePlaceNodeName = false) {
  // 데이터 값에 따른 상태 색 변경
  changeNodeStatusColor(nodeDefId, data);

  let dataUnit = getDataUnit(nodeDefId); // 데이터 단위
  if (data === '' || _.isNull(dataUnit)) dataUnit = ''; // 장치일 경우 단위가 없음
  let [dx, dy, style, nodeName] = [0, 15, 'font-size: 15pt; fill: #7675ff; stroke-width: 0.2', '']; // <Tspan> 속성

  // svg로 그려진 Text의 정보를 찾는다. (위치값을 알기위한 용도)
  const foundSvgTextInfo = _.find(writtenSvgTextList, { id: nodeDefId });
  if (_.isUndefined(foundSvgTextInfo)) return false;
  // svg로 그려진 Text의 자식 Tspan 을 찾는다.
  const foundNodeTextChild = $(`#text_${nodeDefId}`);

  // 장소, 장비, 센서 이름 재정의
  isChangePlaceNodeName ? (nodeName = foundSvgTextInfo.id) : (nodeName = foundSvgTextInfo.name);

  // 데이터, 속성, 스타일 등을 적용해 tspan 다시 그리기
  foundNodeTextChild.get(0).innerHTML = `<tspan id='nodeName' x="${
    foundSvgTextInfo.textX
  }"> ${nodeName}</tspan>`;
  foundNodeTextChild.get(
    0,
  ).innerHTML += `<tspan id="nodeData" class ="${nodeDefId}" value="${data}" x="${
    foundSvgTextInfo.textX
  }" style="${style}" dx="${dx}" dy="${dy}">${data}</tspan>`; // data 표시
  foundNodeTextChild.get(0).innerHTML += `<tspan>${dataUnit}</tspan>`; // data 단위 표시
}

/**
 * 장치 상태에 따른 svg 장치색 변경
 * @param {string} nDefId
 * @param {number|string} data
 */
function changeNodeStatusColor(nDefId, data) {
  /** @type {mDeviceMap} */
  const realMap = map;
  let getNodeBgColor;

  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    const foundNodeDefInfo = _.find(svgNodeInfo.defList, { id: nDefId });
    if (_.isUndefined(foundNodeDefInfo)) return false;

    // 장소, 장비, 센서의 기본 색상을 찾기위한 그리기 정보 찾기
    const foundSvgModelResourceInfo = _.find(realMap.drawInfo.frame.svgModelResourceList, {
      id: foundNodeDefInfo.resourceId,
    });
    getNodeBgColor = foundSvgModelResourceInfo.elementDrawInfo.color;
  });

  // nDefId 가 장소, 장비, 센서 인지 구분하기 위한 노드 정보 찾기
  const foundNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNo =>
    _.map(svgNo.defList, 'id').includes(nDefId),
  );
  if (_.isUndefined(foundNodeInfo)) return false;

  // 0: 장치, 1: 센서, -1: 미분류
  if (foundNodeInfo.is_sensor === 0) {
    const checkDataStatus = checkTrueFalseData(data); // 데이터의 상태
    const drawedSvgElement = $(`#${nDefId}`);

    // 데이터 상태에 따른 색상 변경
    if (checkDataStatus === FALSE_DATA) {
      drawedSvgElement.attr({ fill: getNodeBgColor[0], opacity: 0.8 });
    } else if (checkDataStatus === TRUE_DATA) {
      drawedSvgElement.attr({ fill: getNodeBgColor[1] });
    } else {
      drawedSvgElement.attr({ fill: getNodeBgColor[2] });
    }
  }
}

/**
 * svg텍스트 그리기
 * @param {SVG} svgCanvas
 * @param {defInfo} defInfo 장치, 노드의  id, resourceId, point[] 정보
 * @param {mSvgModelResource} resourceInfo 장치, 노드의 resource id, type, elemetDrawInfo[width,height,radius,...] 정보
 */
function writeSvgText(svgCanvas, defInfo, resourceInfo, isChangedPlaceNodeName = false) {
  const { width, height, radius } = resourceInfo.elementDrawInfo; // 텍스트가 그려질 공간 크기 또는 투명도
  const [x1, y1, x2, y2] = defInfo.point; // 텍스트 위치
  let naming; // defInfo.name: 한글, defInfo.id: 영문
  let [textX, textY, textColor, textSize, leading, anchor] = [0, 0, '', 0, '', '']; // 텍스트 스타일, 위치 초기값

  // 토글의 true, false 값에 대한 한/영문 이름 정의
  isChangedPlaceNodeName ? (naming = defInfo.id) : (naming = defInfo.name);

  // svgPositionList를 검색하여 장치인지 센서인지 구분
  let foundSvgInfo = _.find(map.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
    _.map(svgNodeInfo.defList, 'id').includes(defInfo.id),
  );
  if (_.isUndefined(foundSvgInfo)) {
    foundSvgInfo = _.find(map.drawInfo.positionInfo.svgPlaceList, svgNodeInfo =>
      _.map(svgNodeInfo.defList, 'id').includes(defInfo.id),
    );
    if (_.isUndefined(foundSvgInfo)) return false;
  }

  // 텍스트 색, 크기, 미세한 위치 기본값 조정  , 0: 장치, 1: 센서, -1: 미분류
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

  // 사각형, 패턴 형식일 때 위치값 조정
  if (
    resourceInfo.type === 'rect' ||
    resourceInfo.type === 'pattern' ||
    resourceInfo.type === 'image'
  ) {
    textX = x1 + width / 2;
    textY = y1 + height / 2;

    // 줄 형식 형식일 때 위치값 조정
  } else if (resourceInfo.type === 'line') {
    if (x1 === x2) {
      textX = x1;
      textY = y1 - (y1 - y2) / 2;
    } else {
      textX = x1 + (x2 - x1) / 2;
      textY = y1;
    }

    // 원 형식일 때 위치값 조정
  } else if (resourceInfo.type === 'circle') {
    textX = x1 + radius / 2;
    textY = y1 + radius / 2;

    // 마름모 형식일 때 위치값 조정
  } else if (resourceInfo.type === 'polygon') {
    textX = x1 + width;
    textY = y1 + height;
  }

  /** @type {mSvgModelResource} */
  const foundSvgModelResourceInfo = _.find(map.drawInfo.frame.svgModelResourceList, {
    id: defInfo.resourceId,
  });
  if (foundSvgModelResourceInfo.textStyleInfo) {
    textColor = foundSvgModelResourceInfo.textStyleInfo.color;
  }

  // 제외 할 텍스트 찾기
  checkHidableText(defInfo.id) ? (naming = '') : '';

  // 텍스트 그리기
  const svgText = svgCanvas.text(naming);
  svgText
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
      id: `text_${defInfo.id}`,
    });

  // 그려진 svg 텍스트의 정보 수집
  const drawedNodeInfo = {
    id: defInfo.id,
    name: defInfo.name,
    textX,
    textY,
    text: svgText,
  };
  writtenSvgTextList.push(drawedNodeInfo);
}

/**
 * 그려진 map에서 제외할  텍스트 찾기. 반환값이  true이면 제외
 * @param {string} defId
 */
function checkHidableText(defId) {
  /** @type {mDeviceMap} */
  const realMap = map;
  let isHidableText; //

  // defId 값이 장소인지 노드인지 구분
  // 장소
  const foundPlaceInfo = _.find(realMap.drawInfo.positionInfo.svgPlaceList, svgPlaceInfo =>
    _.map(svgPlaceInfo.defList, 'id').includes(defId),
  );
  // 노드
  if (_.isUndefined(foundPlaceInfo)) {
    const foundNodeInfo = _.find(realMap.drawInfo.positionInfo.svgNodeList, svgNodeInfo =>
      _.map(svgNodeInfo.defList, 'id').includes(defId),
    );
    isHidableText = _.includes(
      realMap.relationInfo.hiddenTextSvgModelResourceIdList,
      foundNodeInfo.nodeDefId,
    );
  } else {
    isHidableText = _.includes(
      realMap.relationInfo.hiddenTextSvgModelResourceIdList,
      foundPlaceInfo.placeId,
    );
  }

  return isHidableText;
}

/**
 *  그려진 svg map 에서 장치,센서 클릭하여 제어할 수 있는 기능을 바인딩.
 * @param {socekt} socket
 */
function bindingClickEventNode(socket, selectedModeVal = 'view') {
  /** @type {mDeviceMap} */
  const realMap = map;

  realMap.drawInfo.positionInfo.svgNodeList.forEach(svgNodeInfo => {
    svgNodeInfo.defList.forEach(nodeDefInfo => {
      const $drawedSvgElement = $(`#${nodeDefInfo.id}`);

      // 클릭 이벤트 바인딩
      $drawedSvgElement.on('click touchstart', () => {
        const deviceType = svgNodeInfo.is_sensor; // 장치 or 센서 구분  1: 센서, 0: 장치, -1: 미분류
        const $nodeTspanEleInfo = $(`tspan.${nodeDefInfo.id}`); // svg 그려진 노드 <Tspan> 정보

        // 장치 and 제어모드
        if (deviceType === 0 && selectedModeVal === 'control') {
          const currentNodeStatus = _.head($nodeTspanEleInfo).innerHTML; // 현재 들어오는 노드의 최근 데이터
          const checkedDataStatus = checkTrueFalseData(currentNodeStatus); // 데이터의 타입이 true데이터인지 false 데이터인지 체크
          // 현재 상태에 따라 confirm창 내용 변경
          if (checkedDataStatus === TRUE_DATA) {
            const confirmBool = confirm(`'${nodeDefInfo.name}' 을(를) 닫으시겠습니까?`);
            confirmBool ? executeCommand(socket, '0', nodeDefInfo.id) : null;
          } else if (checkedDataStatus === FALSE_DATA) {
            const confirmBool = confirm(`'${nodeDefInfo.name}' 을(를) 여시겠습니까?`);
            confirmBool ? executeCommand(socket, '1', nodeDefInfo.id) : null;
          } else if (checkedDataStatus === ERROR_DATA) {
            alert('장치 상태 이상');
          }

          // 장치 and 개발모드
        } else if (deviceType === 0 && selectedModeVal === 'develop') {
          const inputtedDeviceValue = prompt(`'${nodeDefInfo.name}'`);
          if (_.isNull(inputtedDeviceValue)) return false;

          // 데이터가 true/ false 값인지 확인
          const checkedInputValue = checkTrueFalseData(inputtedDeviceValue);
          checkedInputValue === TRUE_DATA || checkedInputValue === FALSE_DATA
            ? changeNodeData(nodeDefInfo.id, inputtedDeviceValue)
            : alert('입력값을 확인해 주세요');
        }
        // 센서 and 개발모드
        else if (deviceType === 1 && selectedModeVal === 'develop') {
          const inputtedSensorValue = prompt(`'${nodeDefInfo.name}'`);
          inputtedSensorValue ? changeNodeData(nodeDefInfo.id, inputtedSensorValue) : null;
        }
      });
    });
  });
}

/**
 * socket 명령 구조
 * @param {socket} socket
 * @param {string} controlType 0: 장치 (Close, Off), 1: 장치 (Open, On), 3: 장치 값 설정
 * @param {string} nodeId
 */
function executeCommand(socket, controlType, nodeId) {
  const requestMsg = {
    commandId: 'SINGLE',
    contents: {
      wrapCmdType: 'CONTROL',
      nodeId,
      singleControlType: controlType,
      rank: 2,
    },
  };
  console.log(requestMsg);
  socket.emit('executeCommand', requestMsg);
}

/**
 * svg.js 의 도형별 그리기 이벤트를 모음
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
 * 사각형
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
 * 줄
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
 * 원
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
 * 다각형
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
 * 패턴 방식 (바둑판 등)
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
 * 이미지
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
function applyConfigTspanEle(config, nodeDefId) {
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
function applyConfigTextStyle(config, targetId) {
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
function checkTrueFalseData(data) {
  const falseValList = ['CLOSE', 'CLOSING', 'OFF', 0, '0'];
  const trueValList = ['OPEN', 'OPENING', 'ON', 1, '1'];
  const isFalseValue = _.includes(falseValList, data.toUpperCase());
  const isTrueValue = _.includes(trueValList, data.toUpperCase());
  let result;

  if (isTrueValue && isFalseValue === false) {
    result = TRUE_DATA;
  } else if (isTrueValue === false && isFalseValue) {
    result = FALSE_DATA;
  } else {
    result = ERROR_DATA;
  }
  return result;
}
