
/**
 * @typedef {Object} commandFormat 명령 자료 구조
 * @property {number} rank
 * @property {string} name
 * @property {string} uuid
 * @property {Object} observer
 * @property {AbstCommander} commander
 * @property {Array} cmdList
 * @property {number} currCmdIndex
 */


/**
 * @typedef {Object} deviceClientFormat Device Client 생성 자료 구조
 * @property {string} target_id device ID
 * @property {string} target_protocol s_hex, dm_v2, ...
 * @property {string} target_category inverter, connector
 * @property {string} connect_type 'socket', 'serial', ...
 * @property {number|string} port socket --> number, serial --> string, ...
 * @property {string} host 접속 경로(socket 일 경우 사용)
 * @property {number} baud_rate serial 일 경우 
 * @property {{type: string, option: *}=} parser serial 일 경우 pipe 처리할 parser option
 * @property {} protocol 프로토콜 변환기 ID
 */


// let deviceCommander = require('../device-commander/DeviceCommander');

