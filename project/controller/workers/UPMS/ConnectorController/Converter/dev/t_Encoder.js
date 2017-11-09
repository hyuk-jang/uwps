const BU = require('base-util-jh').baseUtil;

const NU = require('base-util-jh').newUtil;

const EncodingMsgSocket = require('../dev/Encoder');
let encodingMsgSocket = new EncodingMsgSocket();

const cmdList = {
  getOperation: 'operation',
  getPv: 'pv',
  getGrid: 'grid',
  getPower: 'power',
  getSystem: 'system',
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