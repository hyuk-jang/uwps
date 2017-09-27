const BU = require('../../module/baseUtil');
const NU = require('../../module/newUtil');

const _ = require('underscore');


const EncodingMsgSingleHex = require('../s_hex/Encoder');
let encodingMsgSingleHex = new EncodingMsgSingleHex('04');


const cmdList = {
  getFault: 'fault',
  getPv: 'pv',
  getGrid: 'grid',
  getPower: 'power',
  getSysInfo: 'sysInfo',
  getWeather: 'weather'
}

try {

  for (let ele in cmdList) {
    BU.CLI(cmdList[ele])
    // let result = encodingMsgSingleHex[cmdList[ele]](_.random(0,9) + '' + _.random(0,9), cmdList[ele]);
    let result = encodingMsgSingleHex.makeMsg(cmdList[ele]);
    BU.CLI(result)
  }
} catch (error) {
  BU.CLI(error)
}




// console.log(encodingMsgSingleHex.fault('03'))

// BU.CLI(encodingMsgSingleHex.pv('01'))

// BU.CLI(encodingMsgSingleHex.grid('01'))

// BU.CLI(encodingMsgSingleHex.power('01'))

// BU.CLI(encodingMsgSingleHex.sysInfo('01'))


// let fault = encodingMsgSingleHex.fault('03');