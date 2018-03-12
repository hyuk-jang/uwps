const BU = require('base-util-jh')
global.BU = BU;

const SmBuffer = require('./SmBuffer');
const Converter = require('./Converter');

// Socket
const socket = require('./socket')
// Serial
const serial = require('./serial')


const db = require('./db');
const classModule = require('./classModule');


module.exports = {
  SmBuffer,
  Converter,
  db,
  classModule,
  socket,
  serial
}

// if __main process
if (require !== undefined && require.main === module) {
  let hi = classModule.makeRequestMsgForTransfer('hi');
  console.log('hi', hi)
  
  let ih = classModule.resolveResponseMsgForTransfer(hi)
  console.log('ih', ih.toString())


}
