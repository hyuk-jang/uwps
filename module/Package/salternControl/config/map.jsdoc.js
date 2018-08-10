/**
 * @typedef {Object} deviceMap
 * @property {drawInfo} drawInfo
 * @property {setInfo} setInfo
 * @property {Object} realtionInfo
 * @property {Array.<control>} controlList   // TEST
 * @property {Array.<control>} simpleList   // TEST
 */

/**
 * @typedef {Object} drawInfo
 * @property {frame} frame
 * @property {position} positionList
 */

/**
 * @typedef {Object} frame
 * @property {{width: number, height: number}} mapSize
 * @property {Array.<svgModelResource>} svgModelResourceList
 */

/**
 * @typedef {Object} svgModelResource
 * @property {string} id
 * @property {string} type 'rect', 'line', 'circle', 'rhombus'
 * @property {elementDrawInfo} elementDrawInfo
 * @example
 * type: rect --> width, height, radius, color
 * type: circle --> radius, color
 * type: ellipse --> width, height, color
 * type: rhombus --> width, height, radius, rotate:45, color
 */

/**
 * @typedef {Object} elementDrawInfo
 * @property {number=} width
 * @property {number=} height
 * @property {number=} radius
 * @property {number=} rotate
 * @property {number=} strokeWidth
 * @property {string} color
 */

/**
 * @typedef {Object} setInfo
 * @property {dataLoggerStructureInfo[]} dataLoggerStructureList
 * @property {nodeStructureInfo[]} nodeStructureList
 */

/**
 * @typedef {Object} dataLoggerStructureInfo
 * @property {string} target_prefix 접두어
 * @property {string} target_alias 데이터 로거 별칭
 * @property {dataLoggerDeviceInfo[]} dataLoggerDeviceList
 */

/**
 * @typedef {Object} dataLoggerDeviceInfo
 * @property {string} target_id 장치 SN (고유 식별 번호)
 * @property {string} target_code 장치 번호(001, 002, 003, ...)
 * @property {connect_info} connect_info 장치 연결 정보
 * @property {protocol_info} protocol_info 명령
 */

/**
 * @typedef {Object} modelInfo
 * @property {Array.<deviceModel>} waterDoor
 * @property {Array.<deviceModel>} valve
 * @property {Array.<deviceModel>} pump
 * @property {Array.<deviceModel>} salinity
 * @property {Array.<deviceModel>} waterLevel
 * @property {Array.<deviceModel>} waterTemperature
 * @property {Array.<deviceModel>} moduleFrontTemperature
 * @property {Array.<deviceModel>} moduleRearTemperature
 */

/**
 * @typedef {Object} connectInfo 장치와의 접속 정보
 * @property {bollean} hasOneAndOne
 * @property {string} type 'socket', 'serial', 'zigbee', ...
 * @property {string=} subType 'parser', 'xbee', ....
 * @property {number=} baudRate
 * @property {string=|number=} port
 * @property {string=} host 접속 경로(socket 일 경우 사용)
 * @property {Object=} addConfigInfo type, subType의 Contoller에서 요구하는 추가 접속 정보
 * @property {Array.<deviceRouter>} deviceRouterList type, subType의 Contoller에서 요구하는 추가 접속 정보
 */

/**
 * @typedef {Object} deviceModel
 * @property {string} targetId
 * @property {string} targetName
 * @property {number|string} targetData
 */
//  * @property {SalternDevice} salternRouter

/**
 * @typedef {Object} deviceRouter
 * @property {string} targetId
 * @property {string} targetCategory
 * @property {string} targetProtocol
 * @property {string} deviceId
 * @property {string[]} nodeModelList
 */

/**
 * @typedef {Object} connectInfo 장치와의 접속 정보
 * @property {bollean} hasOneAndOne
 * @property {string} type 'socket', 'serial', 'zigbee', ...
 * @property {string=} subType 'parser', 'xbee', ....
 * @property {number=} baudRate
 * @property {string|number=} port
 * @property {string=} host 접속 경로(socket 일 경우 사용)
 * @property {Object=} addConfigInfo type, subType의 Contoller에서 요구하는 추가 접속 정보
 */

/**
 * @typedef {Object} control
 * @property {string} cmdName 명령 이름
 * @property {string[]} trueList
 * @property {string[]} falseList
 */
