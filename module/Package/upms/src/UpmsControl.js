'use strict';

/** Promise를 더욱 풍부하게 사용하기 위한 Library */
const Promise = require('bluebird');
/** Event 처리 Library */
const EventEmitter = require('events');
/** Event 처리 Listener --> Promise로 반환 */
const eventToPromise = require('event-to-promise');

/** 자주쓰는 Util 모음 */
const BU = require('base-util-jh').baseUtil;

/** Device Connect, Write 처리 Middleware */
const DCM = require('device-connect-manager');

class UpmsControl {
  constructor() {


    /** Device Connect, Write 처리 Middleware */
    this.dcm = new DCM();

  }



  
  
}

module.exports = UpmsControl;