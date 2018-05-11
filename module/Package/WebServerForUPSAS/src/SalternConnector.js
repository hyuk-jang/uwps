
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
   * @param {{hasTryConnect: boolean, port: number, host: string}} connectInfo 
   */
  constructor(connectInfo) {
    this.port = connectInfo.port;
    this.host = connectInfo.host || 'localhost';
    this.hasTryConnect = connectInfo.hasTryConnect;
    
    let foundInstance = _.find(instanceList, instanceInfo => {
      return _.isEqual(instanceInfo.id, this.configInfo);
    });
    
    if(_.isEmpty(foundInstance)){
      this.baseConverter = BaseModel.default;
      this.stringfySalternDevice = '';
      this.stringfyCommandStorage = '';
      
      instanceList.push({id: this.configInfo, instance: this});

      // 장치와 연결을 수행할지 여부
      if(this.hasTryConnect){
        this.connect();
      }
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
      let stringfySalternData = '';
      try {
        stringfySalternData = this.baseConverter.decodingDefaultRequestMsgForTransfer(bufferData).toString();
      } catch (error) {
        BU.logFile(error);
        return false;
      }

      let parseSalternData = JSON.parse(stringfySalternData);

      // BU.CLI(parseSalternData);

      this.stringfySalternDevice = JSON.stringify(parseSalternData.deviceStorage);
      this.stringfyCurrentCommandSet =  JSON.stringify(parseSalternData.commandStorage.currentCommandSet); 
      this.stringfyStandbyCommandSetList =  JSON.stringify(parseSalternData.commandStorage.standbyCommandSetList);
      this.stringfyDelayCommandSetList = JSON.stringify(parseSalternData.commandStorage.delayCommandSetList); 

      this.io.emit('onSalternDevice', this.stringfySalternDevice);
      // this.io.emit('onSalternCommand', this.stringfyStandbyCommandSetList);
      this.io.emit('onSalternCommand', this.stringfyCurrentCommandSet, this.stringfyStandbyCommandSetList, this.stringfyDelayCommandSetList);
    });
    
    client.on('close', err => {
      this.client = {};
      setTimeout(() => {
        this.connect();
      }, 1000 * 30);
    });

    client.on('end', () => {
      // console.log('Client disconnected');
    });

    client.on('error', error => {
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
      socket.on('excuteSalternControl', msg => {
        let encodingMsg = this.baseConverter.encodingDefaultRequestMsgForTransfer(msg);

        !_.isEmpty(this.client) && this.write(encodingMsg).catch(err => {
          BU.logFile(err);
        });
        
      });

      if(this.stringfySalternDevice.length){
        socket.emit('initSalternDevice', this.stringfySalternDevice);
        // socket.emit('initSalternCommand', this.stringfyStandbyCommandSetList);
        socket.emit('initSalternCommand', this.stringfyCurrentCommandSet, this.stringfyStandbyCommandSetList, this.stringfyDelayCommandSetList);
      }

      socket.on('disconnect', () =>{
      });
    });
  }



}
module.exports = SalternConnector;