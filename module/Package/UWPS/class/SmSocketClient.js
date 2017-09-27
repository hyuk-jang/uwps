const net = require('net');
const eventToPromise = require('event-to-promise');

const SocketClient = require('./SocketClient');
const SmBuffer = require('./SmBuffer');

class SmSocketClient extends SocketClient {
  constructor(port, host) {
    super(port, host);
    // this.port = port;
    // this.host = host;
  }


  _initSocket() {
    // BU.CLI('initSocket')
    // console.log(this.client)
    this.smBuffer = new SmBuffer(this);

    // Socket
    this.on('endBuffer', (err, resBufferData) => {
      // BU.CLIS('endBUffer', err, resBufferData)
      if (err) {
        this._onUsefulData(err, resBufferData)
        return;
      }
      this._onUsefulData(null, resBufferData);
      // BU.CLI(resBufferData)
    });


  }

  // connect(){
  //   BU.CLI('왓더 헬')
  //   return super.connect(this.port, this.host);
  // }


  // onData
  _onData(data) {
    // BU.CLI('data',data.toString())
    if(this.smBuffer === undefined){
      return false;
    }
    return this.smBuffer.addBuffer(data);
  }

  _onUsefulData(err, data) {
    return this.emit('dataBySocketClient', err, data);
  }
}

module.exports = SmSocketClient;