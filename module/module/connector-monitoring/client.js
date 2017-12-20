// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();
 
// open connection to a serial port
client.connectRTUBuffered("COM4", { baudRate: 9600 });
client.setID(3);
 
// read the values of 10 registers starting at address 0
// on device number 1. and log the values to the console.
setInterval(function() {
    client.readInputRegisters(0, 10, function(err, data) {
        console.log(data.data);
    });
}, 1000);