const net = require('net');

let testMsg = BU.makeMessage({
  CMD: "CheckClientEnd",
  CMD_Key: 'hi',
  Map_Version: ''
});

class SocketClient {
  constructor(port, host) {
    this.port = port;
    this.host = host ? host : 'localhost';

    this.client = {};
  }

  connectSocket(callback) {
    this.client = net.createConnection(this.port, this.host, () => {
      return callback();
    });

    this.client.on('data', function (data) {
      console.log('@@@@@@@@@@@@@@', data.toString());
      // this.client.write(testMsg)
      // client.end();
    });
    this.client.on('end', function () {
      console.log('Client disconnected');
    });
  }

  writeData(data) {
    // BU.CLI(data.toString())
    this.client.write(data);
  }

}

module.exports = SocketClient;