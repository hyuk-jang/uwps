'use strict';
const _ = require('underscore');
const net = require('net');
const eventToPromise = require('event-to-promise');

const AbstController = require('../AbstController');

/** @type {Array.<{id: {host: string, port: number}, instance: Socket}>} */
let instanceList = [];

/** Class Socket 접속 클라이언트 클래스 */
class Socket extends AbstController {
  /**
   * Socket Client 접속 설정 정보
   * @param {{port: number, ip: string|undefinded}} config Socket Port
   */
  constructor(config) {
    super();
    this.client = {};
    this.port = config.port;
    this.host = config.host || 'localhost';

    this.config = {host: this.host, port: this.port};

    let foundInstance = _.find(instanceList, instanceInfo => {
      return _.isEqual(instanceInfo.id, this.config);
    });
    
    if(_.isEmpty(foundInstance)){
      instanceList.push({id: this.config, instance: this});
    } else {
      return foundInstance.instance;
    }

  }

  /** 장치 접속 시도 */
  async connect() {
    /** 접속 중인 상태라면 접속 시도하지 않음 */
    if(!_.isEmpty(this.client)){
      throw new Error(`이미 접속중입니다. ${this.config.port}`);
    }

    this.client = net.createConnection(this.port, this.host);

    this.client.on('data', bufferData => {
      this.notifyData(bufferData);
    });

    this.client.on('close', () => {
      this.client = {};
      this.notifyClose();
    });

    this.client.on('end', () => {
      // console.log('Client disconnected');
      // this.client = {};
      // this._onClose('err');
    });

    this.client.on('error', error => {
      this.notifyError(error);
    });
    await eventToPromise.multi(this.client, ['connect', 'connection', 'open'], ['close, error']);
    this.notifyConnect();
    return this.client;
  }
}

module.exports = Socket;