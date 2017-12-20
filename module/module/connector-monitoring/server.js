// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var vector = {
    getInputRegister: function(addr, unitID) { return addr; },
    getHoldingRegister: function(addr, unitID) { return addr + 8000; },
    getCoil: function(addr, unitID) { return (addr % 2) === 0; },
    setRegister: function(addr, value, unitID) { console.log("set register", addr, value, unitID); return; },
    setCoil: function(addr, value, unitID) { console.log("set coil", addr, value, unitID); return; }
};
 
// set the server to answer for modbus requests
console.log("ModbusTCP listening on modbus://0.0.0.0:8502");
var serverTCP = new ModbusRTU.ServerTCP(vector, { host: "0.0.0.0", port: 8502, debug: true, unitID: 1 });
 
serverTCP.on("socketError", function(err){
    // Handle socket error if needed, can be ignored
    console.error(err);
});