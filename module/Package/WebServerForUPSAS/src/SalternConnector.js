
const _ = require('lodash');
const net = require('net');
const eventToPromise = require('event-to-promise');

const SocketIO = require('socket.io')();
const {BU} = require('base-util-jh');


const {BaseModel} = require('../../../module/device-protocol-converter-jh');


/** @type {Array.<{id: constructorSocket, instance: Socket}>} */
let instanceList = [];
class SalternConnector {
  /**
   * Socket Client 접속 설정 정보
   * @param {{port: number, host: string}} connectInfo 
   */
  constructor(connectInfo) {
    this.port = connectInfo.port;
    this.host = connectInfo.host || 'localhost';
    
    let foundInstance = _.find(instanceList, instanceInfo => {
      return _.isEqual(instanceInfo.id, this.configInfo);
    });
    
    if(_.isEmpty(foundInstance)){
      this.baseConverter = BaseModel.default;
      instanceList.push({id: this.configInfo, instance: this});
      this.connect();
    } else {
      return foundInstance.instance;
    }
  }

  /**
   * Socket Server로 메시지 전송
   * @param {Buffer|String} 전송 데이터
   * @return {promise} Promise 반환 객체
   */
  write(msg) {
    // BU.CLI(msg);
    let res = this.client.write(msg);
    if(res){
      return Promise.resolve();
    } else {
      return Promise.reject(res);
    }
  }

  /** 장치 접속 시도 */
  async connect() {
    BU.log('Try Connect', this.port);
    /** 접속 중인 상태라면 접속 시도하지 않음 */
    if(!_.isEmpty(this.client)){
      throw new Error(`이미 접속중입니다. ${this.port}`);
    }

    const client = net.createConnection(this.port, this.host);
    client.on('data', bufferData => {
      // let salternData = _.isBuffer(bufferData) ? JSON.parse(bufferData.toString()) : bufferData;
      let salternData =  this.baseConverter.decodingDefaultRequestMsgForTransfer(bufferData);


      
      // BU.CLI(salternData);
      // let jsonData = salternData.toString();
      this.io.emit('onSalternData', salternData.toString());
      // this.notifyData(bufferData);
    });
    
    client.on('close', err => {
      this.client = {};
      // this.notifyDisconnect(err);
    });

    client.on('end', () => {
      // console.log('Client disconnected');
    });

    client.on('error', error => {
      // this.notifyError(error);
    });
    await eventToPromise.multi(client, ['connect', 'connection', 'open'], ['close, error']);
    BU.log('connected Saltern Socket', this.port);
    this.client = client;
    return this.client;
  }

  /**
   * Web Socket 설정
   * @param {Object} pramHttp 
   */
  setSocketIO(pramHttp) {
    this.io = require('socket.io')(pramHttp);
    this.io.on('connection', socket =>{
      console.log('a user connected');
      this.io.emit('hello', 'world');


      socket.on('excuteSalternControl', msg => {
        BU.CLI('msg', msg);
        let encodingMsg = this.baseConverter.encodingDefaultRequestMsgForTransfer(msg);
        BU.CLI('encodingMsg', encodingMsg);

        this.write(encodingMsg).catch(err => {
          BU.logFile(err);
        });
      });
      socket.on('disconnect', () =>{
        console.log('user disconnected');
      });
    });
  }



}
module.exports = SalternConnector;