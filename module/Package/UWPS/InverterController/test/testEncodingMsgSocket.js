const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

global.BU = BU;

const EncodingMsgSocket = require('../EncodingMsgSocket.js');
let encodingMsgSocket = new EncodingMsgSocket();

const cmdList = {
  getFault: 'fault',
  getPv: 'pv',
  getGrid: 'grid',
  getPower: 'power',
  getSysInfo: 'sysInfo',
  getWeather: 'weather'
}

for (let ele in cmdList) {
  BU.CLI(cmdList[ele])
  let result = encodingMsgSocket.makeMsg(cmdList[ele]);
  BU.CLI(result)
}


// console.log(encodingMsgSocket.fault())

// BU.CLI(encodingMsgSingleHex.pv('01'))

// BU.CLI(encodingMsgSingleHex.utilityLine('01'))

// BU.CLI(encodingMsgSingleHex.power('01'))

// BU.CLI(encodingMsgSingleHex.sysInfo('01'))


// let fault = encodingMsgSingleHex.fault('03');