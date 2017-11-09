const node_modbus = require('node-modbus')


function runServer(port) {
  let server = node_modbus.server.tcp.complete({ port: port, responseDelay: 200 })
  return server;
}

module.exports = runServer;