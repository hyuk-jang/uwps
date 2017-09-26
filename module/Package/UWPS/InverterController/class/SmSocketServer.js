const SocketServer = require('./SocketServer');
const SmBuffer = require('./SmBuffer');

const BU = require('../module/baseUtil');

class SmSocketServer extends SocketServer {
  constructor(port) {
    super(port);
  }


  _initSocket(socket) {
    // BU.CLI('initSocket')
    socket.smBuffer = new SmBuffer(socket);

    // Socket
    socket.on('endBuffer', (err, resBufferData) => {
      if (err) {
        this._onUsefulData(err, resBufferData, socket)
        return;
      }
      this._onUsefulData(null, resBufferData, socket);
      // BU.CLI(resBufferData)
    });


  }


  // onData
  _onData(data, socket) {
    return socket.smBuffer.addBuffer(data);
  }

  _onUsefulData(err, data, socket) {
    return this.emit('dataBySocketServer', err, data, socket);
  }

  _onClose(socket) {}

}
module.exports = SmSocketServer;