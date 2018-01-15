const bcjh = require('base-class-jh');

/**
 * Socket Client 
 * @class 
 */
class SocketClient extends bcjh.socket.SocketClient {
  /**
   * Controller 
   * @param {{port:Number, ip: String:Undefinded}} port Socket Port
   */
  constructor(config) {
    super(config.port, config.ip);
    this._eventHandler();
  }

  /**
   * Device 실제 연결. 연결 후 발생된 Event는 
   */
  async connect() {
    await super.connect();
    return this;
  }

  /**
   * Socket Server로 메시지 전송
   * @param {Buffer|String} 전송 데이터
   */
  write(msg) {
    super.client.write(msg);
  }

  /**
   * data 수신 Event Handler Binding
   */
  _eventHandler() {
    super.on('data', data => {
      return this.emit('data', data);
    });

    super.on('close', err => {
      console.trace(err);
      return this.emit('disconnected', err);
    });
  }
}
module.exports = SocketClient;