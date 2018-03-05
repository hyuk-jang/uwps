'use strict';
const _ = require('underscore');
const serialport = require('serialport');
const eventToPromise = require('event-to-promise');

const AbstController = require('../AbstController');

/** @type {Array.<{id: string, instance: Serial}>} */
let instanceList = [];

class Serial extends AbstController{
  /**
   * Serial Port 객체를 생성하기 위한 설정 정보
   * @param {{port: string, baud_rate: number }} config {port, baud_rate}
   */
  constructor(config) {
    super();
    this.client = {};
    this.port = config.port;
    this.baud_rate = config.baud_rate;
    
    let foundInstance = _.findWhere(instanceList, {id: this.port});
    if(_.isEmpty(foundInstance)){
      this.config = {port: config.port, baud_rate: config.baud_rate};
      instanceList.push({id: this.port, instance: this});
    } else {
      return foundInstance.instance;
    }
  }

  /**
   * Serial Device로 메시지 전송
   * @param {Buffer|string} 전송 데이터
   * @return {Promise} Promise 반환 객체
   */
  write(msg) {
    return new Promise((resolve, reject) => {
      this.client.write(msg, err => {
        reject(err);
      });
      resolve();
    });
  }


  /** 장치 접속 시도 */
  async connect() {
    // BU.CLI('connect');
    /** 접속 중인 상태라면 접속 시도하지 않음 */
    if(!_.isEmpty(this.client)){
      throw new Error(`이미 접속중입니다. ${this.port}`);
    }
    
    this.client = new serialport(this.port, {
      baudRate: this.baud_rate,
    });

    this.client.on('data', bufferData => {
      // BU.CLI('bufferData', bufferData);
      this.notifyData(bufferData);
    });

    this.client.on('close', () => {
      this.client = {};
      this.notifyClose();
    });

    this.client.on('end', () => {
      BU.CLI('Close');
      this.client = {};
      this.notifyClose();
    });

    this.client.on('error', error => {
      this.notifyError(error);
    });

    await eventToPromise.multi(this.client, ['open'], ['error', 'close']);
    this.notifyConnect();
    return this.client;
  }
}
module.exports = Serial;