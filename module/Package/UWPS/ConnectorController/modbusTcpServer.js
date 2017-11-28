// create an empty modbus client
const ModbusRTU = require('modbus-serial');


const vector = {
  getInputRegister: function (addr, unitID) {
    return addr;
  },
  getHoldingRegister: function (addr, unitID) {
    return addr + 8000;
  },
  getCoil: function (addr, unitID) {
    return (addr % 2) === 0;
  },
  setRegister: function (addr, value, unitID) {
    console.log('set register', addr, value, unitID);
    return;
  },
  setCoil: function (addr, value, unitID) {
    console.log('set coil', addr, value, unitID);
    return;
  }
};

function startServer(port, host, unitID) {
  host = host == null || host == '' ? '0.0.0.0' : host;
  unitID = unitID == null || host == '' ? 1 : unitID;
  // set the server to answer for modbus requests
  console.log(`ModbusTCP listening on modbus://${host}:${port}`);
  let serverTCP = new ModbusRTU.ServerTCP(vector, {
    host: host,
    port: port,
    debug: true,
    unitID: unitID
  });

  serverTCP.on('socketError', function (err) {
    // Handle socket error if needed, can be ignored
    console.error(err);
  });

  return serverTCP;
}

module.exports = {
  vector,
  startServer
}