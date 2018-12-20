/**
 * @type {upsasConfig}
 */
const config = {
  allNodeTspanEleInfo: {
    allDx: 0,
    allDy: 20,
    allStyle: 'font-size: 15pt; fill: #7675ff; stroke-width: 0.2',
  },
  singleNodeTspanEleList: [{}],
  allTextStyleInfo: {
    textColor: '#403838',
    textSize: 0,
    anchor: 'middle',
    leading: '1.1em',
    moveScale: [0, 0],
  },
  singleTextStyleList: [
    {
      targetId: 'SEB_1_A',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_1_B',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_1_C',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_1_D',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_1_E',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_일반',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_2',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_3',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEB_4',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SCB',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'EA_일반',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'EA_G2G',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'BW_1',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'BW_2',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'BW_3',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'RV',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
    {
      targetId: 'SEA',
      styleInfo: {
        textColor: 'white',
        textSize: 0,
        anchor: 'middle',
        leading: '1em',
        moveScale: [0, 0],
      },
    },
  ],
};

/**
 * @typedef {Object} upsasConfig
 * @property {cAllNodeTspanEleInfo} allNodeTspanEleInfo
 * @property {cSingleNodeTspanEleList[]} singleNodeTspanEleList
 * @property {cAllTextStyleInfo} allTextStyleInfo
 * @property {cSingleTextStyleList[]} singleTextStyleList
 */

/**
 * @typedef {Object} cAllNodeTspanEleInfo
 * @property {number} dx
 * @property {number} dy
 * @property {string} style
 */

/**
 * @typedef {Object} cSingleNodeTspanEleList
 * @property {number} nodeId
 * @property {number} targetDx
 * @property {number} targetDy
 * @property {string} targetStyle
 */

/**
 * @typedef {Object} cAllTextStyleInfo
 * @property {string} textColor
 * @property {number} textSize
 * @property {string} leading
 * @property {string} anchor
 * @property {number[]} moveScale
 */

/**
 * @typedef {Object} cSingleTextStyleList
 * @property {string} targetId
 * @property {Object} styleInfo
 * @property {string} styleInfo.textColor
 * @property {number} styleInfo.textSize
 * @property {string} styleInfo.leading
 * @property {string} styleInfo.anchor
 * @property {number[]} styleInfo.moveScale
 */
