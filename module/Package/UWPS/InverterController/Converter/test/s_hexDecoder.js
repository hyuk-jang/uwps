const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;
const NU = BUJ.newUtil;

const _ = require('underscore');

global.BU = BU;
global._ = _;

let arr = [];
let obj = {};

function init() {
  arr = [];
  obj = {};
}


const DecodingMsgSingleHex = require('../s_hex/Decoder');
const decodingMsgSingleHex = new DecodingMsgSingleHex();

const DecodingMsgSocket = require('../dev/Decoder');
const decodingMsgSocket = new DecodingMsgSocket();

const singleHexProtocolTable = require('../s_hex/singleHexProtocolTable');
const protocolTable = singleHexProtocolTable.encodingProtocolTable('04');


// decodingMsgSocket.on('endBuffer', (err, result) => {
//   BU.CLI('@@@@ endBuffer @@@@@ ', result)
//   return result;
// })

function makeSingleMsg(cmd, obj) {
  let returnValue = {
    cmd,
    contents: obj
  }

  return returnValue;
}


const cmdList = {
  getFault: 'fault',
  getPv: 'pv',
  getGrid: 'grid',
  getPower: 'power',
  getSysInfo: 'sysInfo',
  getWeather: 'weather'
}


function makeBufferMsg(cmd, arr) {
  let ACK = decodingMsgSingleHex.ACK;
  let EOT = decodingMsgSingleHex.EOT;

  let dialing = protocolTable[cmd].dialing;
  let code = protocolTable[cmd].code;
  let address = protocolTable[cmd].address;
  dialing = Buffer.from(dialing, 'ascii');
  code = Buffer.from(code, 'ascii');
  address = Buffer.from(address, 'ascii');

  let con = Buffer.concat([dialing, code, address]);
  arr.unshift(con)

  let realBuffer = Buffer.concat(arr);
  let checkSum = decodingMsgSingleHex.getBufferCheckSum(realBuffer, 4);

  return Buffer.concat([ACK, realBuffer, checkSum, EOT])
}

function makeSysInfo() {
  let res = null;
  // 시스템 정보 명령
  init();
  // 1: isSingle, 030: Kw(10:1 Scale)
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0x1030));
  // 제조년: 20yymm
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0x0510));
  // Serial Number: 
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0x0001));

  res = makeBufferMsg('sysInfo', arr);
  res = decodingMsgSingleHex._receiveData(res);

  return res;
}
exports.makeSysInfo = makeSysInfo;
res = makeSysInfo();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.sysInfo(makeSingleMsg('sysInfo', res));
BU.CLI(res)



// 전력량 계측 정보 명령 --> power
function makePower(){
  let res = null;
  init();
  // currPvKw
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(2724));
  // ivtHighAddr // currIvtKva
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(57));
  // ivtLowAddr 
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(230));
  // currIvtKw
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(2518));
  // ivtMaxKw
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(298));
  // ivtPf
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(998));
  // ivtDailyKwh
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(1134));
  // x
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0));
  
  res = makeBufferMsg('power', arr);
  res = decodingMsgSingleHex._receiveData(res);
  return res;
}
exports.makePower = makePower;
res = makePower();
BU.CLI(res);


// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('power', res));
BU.CLI(res)






// 계통 계측 정보 명령
function makeGrid(){
  let res = null;
  init();
  // R 상 I
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(217));
  // S 상 I
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0));
  // T 상 I
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0));
  // RS 상 V
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(65));
  // ST 상 V
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0));
  // TR 상 V
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(0));
  // HZ
  arr.push(decodingMsgSingleHex.convertNum2Hx2Buffer(601));
  
  res = makeBufferMsg('grid', arr);
  res = decodingMsgSingleHex._receiveData(res);
  return res;
}
exports.makeGrid = makeGrid;

res = makeGrid();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('grid', res));
BU.CLI(res)



// 태양전지 
function makePv(){
  let res = null;
  let vol = decodingMsgSingleHex.convertNum2Hx2Buffer(266, 4);
  let amp = decodingMsgSingleHex.convertNum2Hx2Buffer(57, 4);
  
  res = makeBufferMsg('pv', arr);
  res = decodingMsgSingleHex._receiveData(res);
  return res;
}
exports.makePv = makePv;

res = makePv();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.pv(makeSingleMsg('pv', res));
BU.CLI(res)





// Fault 발생
function makeFault(){
let res = null;
  let faultBuffer = makeFaultMsg();
  // res = decodingMsgSingleHex.fault(faultBuffer)
  // BU.CLI(res)
  
  res = makeBufferMsg('fault', [faultBuffer]);
  res = decodingMsgSingleHex._receiveData(res);
  return res;
}
exports.makeFault = makeFault;

function makeFaultMsg() {
  let returnValue = [];
  for (let count = 0; count < 16; count++) {
    let randomHex = _.random(0, 15).toString(16);
    let buffer = Buffer.from(randomHex, 'ascii');
    returnValue.push(buffer);
  }
  return Buffer.concat(returnValue);
}

res = makeFault();
BU.CLI(res);


// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('fault', res));
BU.CLI(res)