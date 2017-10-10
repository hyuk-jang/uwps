const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;
const NU = BUJ.newUtil;

global.BU = BU;

const _ = require('underscore');


const Encoder = require('./Encoder');
let encoder = new Encoder(Buffer.from([0x05]));

// let r = encoder.converter().hex2dec('110E8400E29B11D4A716446655440000');

// let buf = Buffer.from('110E8400E29B11D4A716446655440000');

// BU.CLI(buf)

// return;

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
    let result = encoder.makeMsg(cmdList[ele]);
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