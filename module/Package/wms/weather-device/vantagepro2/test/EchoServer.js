const net = require('net');

const _ = require('lodash');

const {BU} = require('base-util-jh');

const config = require('../src/config');







const clientList = [];


const server = net.createServer((socket) => {
  clientList.push(socket);
  // socket.end('goodbye\n');
  let port = config.current.deviceInfo.connect_info.port;
  console.log(`client is Connected ${port}`);

  // socket.write('18?');
  
  socket.on('data', data => {
    console.log(`P: ${port} --> Received Data: ${data} `);
    // return socket.write('this.is.my.socket\r\ngogogogo' + port);
  });

  socket.on('close', () => {
    console.log('client is close');
    _.remove(clientList, socket);
  });

}).on('error', (err) => {
  // handle errors here
  console.error('@@@@', err, server.address());
  // throw err;
});

// grab an arbitrary unused port.
server.listen(config.current.deviceInfo.connect_info.port, () => {
  console.log('opened server on', server.address());
});

server.on('close', () => {
  
  console.log('clonse');
});

server.on('error', (err) => {
  console.error(err);
});



const dummyList = [
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x3D, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0C, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x2C, 0x9C],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x40, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0C, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xE3, 0x66],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x46, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x07, 0x3E],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x46, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x07, 0x3E],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x06, 0x05, 0x3D, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xF1, 0xB8],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x37, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x38, 0xBA],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBD, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x06, 0x05, 0x46, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x7B, 0x01, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x46, 0x7D],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xF9, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x06, 0x05, 0x46, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xC2, 0x50],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB4, 0x01, 0x08, 0x05, 0x43, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x41, 0xBE],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x40, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xF8, 0xBE],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x09, 0x05, 0x40, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x16, 0x43],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x3D, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x37, 0x44],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x3D, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x37, 0x44],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x3D, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x37, 0x44],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x06, 0x05, 0x3B, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x0E, 0x38],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x09, 0x05, 0x3C, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x45, 0xA3],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x09, 0x05, 0x3C, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x45, 0xA3],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x29, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x37, 0xE7],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x41, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x64, 0xA4],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x08, 0x05, 0x3B, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x4F, 0x7B],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x09, 0x05, 0x3E, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x6D, 0xB6],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x09, 0x05, 0x3E, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0x6D, 0xB6],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x07, 0x05, 0x32, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xCF, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xDC, 0x8B],
  [0x4C, 0x4F, 0x4F, 0x00, 0x00, 0xBE, 0x04, 0xFA, 0x75, 0xD7, 0x01, 0x4F, 0xB5, 0x01, 0x06, 0x05, 0x37, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x58, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x0D, 0xD5, 0x00, 0x70, 0x00, 0x12, 0x37, 0x00, 0x00, 0x70, 0x00, 0x70, 0x00, 0x0A, 0x00, 0x08, 0x00, 0x20, 0x01, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xB6, 0x00, 0x08, 0x01, 0x85, 0x02, 0x32, 0x07, 0x0A, 0x0D, 0xB0, 0x33],
];

dummyList.forEach((currentItem, index) => {
  dummyList[index] = Buffer.from(currentItem);
});


let index = 0;

setInterval(() => {
  clientList.forEach(client => {
    let data = dummyList[index].toString();
    client.write(data);
  });
  index += 1;
  index = index >= dummyList.length ? 0 : index;
}, 2000);




process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log(err.message);
  console.log('Node NOT Exiting...');
});