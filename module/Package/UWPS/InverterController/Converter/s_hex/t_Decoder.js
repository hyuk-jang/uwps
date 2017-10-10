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


const Decoder = require('./Decoder');
const decoder = new Decoder();

const DecodingMsgSocket = require('../dev/Decoder');
const decodingMsgSocket = new DecodingMsgSocket();

const protocol = require('./s_hexProtocol');
const protocolTable = protocol.encodingProtocolTable('01');

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
  // BU.CLI(cmd, arr)
  let ACK = decoder.ACK;
  let EOT = decoder.EOT;

  let dialing = protocolTable[cmd].dialing;
  let code = protocolTable[cmd].code;
  let address = protocolTable[cmd].address;

  let body = decoder.makeMsg2Buffer([dialing, code, address], arr);

  // let realBuffer = Buffer.concat(arr);
  let checkSum = decoder.getBufferCheckSum(body, 4);
  return Buffer.concat([ACK, body, checkSum, EOT])
}


function makeReceiveData(cmd, hasBinary, bufferWidth) {
  init();
  let returnValue = {};
  let buffer = null;
  let body = [];
  let convertBufferBody = [];
  switch (cmd) {
    case 'sysInfo':
      body = [
        0x1030, // 1: isSingle, 030: Kw(10:1 Scale)
        0x0510, // 제조년: 20yymm
        0x0001 // Serial Number: 
      ];
      break;
    case 'power':
      body = [
        2724, // currPvKw
        57, // ivtHighAddr // currIvtKva
        230, // ivtLowAddr 
        2518, // currIvtKw
        298, // ivtMaxKw
        998, // ivtPf
        1134, // ivtDailyKwh
        0 // x
      ];
      break;
    case 'grid':
      body = [
        217, // R 상 I
        0, // S 상 I
        0, // T 상 I
        65, // RS 상 V
        0, // ST 상 V
        0, // TR 상 V
        601 // HZ
      ];
      break;
    case 'pv':
      body = [
        266,
        57
      ];
      break;
    case 'fault':
      body = makeFaultMsg();
      break;
    default:
      break;
  }
  BU.CLI(body)

  if (hasBinary) {
    convertBufferBody = body;
  } else {
    body.forEach(element => {
      convertBufferBody.push(decoder.convertNum2Hx2Buffer(element, bufferWidth));
    });
  }

  BU.CLI(convertBufferBody)
  buffer = makeBufferMsg(cmd, convertBufferBody);

  returnValue = decoder._receiveData(buffer)
  BU.CLI(cmd, buffer, returnValue);

  return returnValue;
}

makeReceiveData('sysInfo')
makeReceiveData('power')
makeReceiveData('grid')
makeReceiveData('pv')
makeReceiveData('fault', true)


// res = makeFault();
// BU.CLI(res);

return;

function makeSysInfo() {
  let res = null;
  // 시스템 정보 명령
  init();
  // 1: isSingle, 030: Kw(10:1 Scale)
  arr.push(decoder.convertNum2Hx2Buffer(0x1030));
  // 제조년: 20yymm
  arr.push(decoder.convertNum2Hx2Buffer(0x0510));
  // Serial Number: 
  arr.push(decoder.convertNum2Hx2Buffer(0x0001));

  res = makeBufferMsg('sysInfo', arr);

  res = decoder._receiveData(res);

  return res;
}
exports.makeSysInfo = makeSysInfo;
res = makeSysInfo();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket._receiveData(res);
BU.CLI(res)




// 전력량 계측 정보 명령 --> power
function makePower() {
  let res = null;
  init();
  // currPvKw
  arr.push(decoder.convertNum2Hx2Buffer(2724));
  // ivtHighAddr // currIvtKva
  arr.push(decoder.convertNum2Hx2Buffer(57));
  // ivtLowAddr 
  arr.push(decoder.convertNum2Hx2Buffer(230));
  // currIvtKw
  arr.push(decoder.convertNum2Hx2Buffer(2518));
  // ivtMaxKw
  arr.push(decoder.convertNum2Hx2Buffer(298));
  // ivtPf
  arr.push(decoder.convertNum2Hx2Buffer(998));
  // ivtDailyKwh
  arr.push(decoder.convertNum2Hx2Buffer(1134));
  // x
  arr.push(decoder.convertNum2Hx2Buffer(0));

  res = makeBufferMsg('power', arr);
  res = decoder._receiveData(res);
  return res;
}
exports.makePower = makePower;
res = makePower();
BU.CLI(res);


// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('power', res));
BU.CLI(res)





// 계통 계측 정보 명령
function makeGrid() {
  let res = null;
  init();
  // R 상 I
  arr.push(decoder.convertNum2Hx2Buffer(217));
  // S 상 I
  arr.push(decoder.convertNum2Hx2Buffer(0));
  // T 상 I
  arr.push(decoder.convertNum2Hx2Buffer(0));
  // RS 상 V
  arr.push(decoder.convertNum2Hx2Buffer(65));
  // ST 상 V
  arr.push(decoder.convertNum2Hx2Buffer(0));
  // TR 상 V
  arr.push(decoder.convertNum2Hx2Buffer(0));
  // HZ
  arr.push(decoder.convertNum2Hx2Buffer(601));

  res = makeBufferMsg('grid', arr);
  res = decoder._receiveData(res);
  return res;
}
exports.makeGrid = makeGrid;

res = makeGrid();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('grid', res));
BU.CLI(res)



// 태양전지 
function makePv() {
  init();
  let res = null;
  let vol = decoder.convertNum2Hx2Buffer(266, 4);
  let amp = decoder.convertNum2Hx2Buffer(57, 4);

  arr = [vol, amp];

  res = makeBufferMsg('pv', arr);
  res = decoder._receiveData(res);
  return res;
}
exports.makePv = makePv;

res = makePv();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.pv(makeSingleMsg('pv', res));
BU.CLI(res)





// Fault 발생
function makeFault() {
  let res = null;
  let faultBuffer = makeFaultMsg();
  // res = decodingMsgSingleHex.fault(faultBuffer)
  // BU.CLI(res)

  res = makeBufferMsg('fault', [faultBuffer]);
  res = decoder._receiveData(res);
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

  // BU.CLI(returnValue)
  return Buffer.concat(returnValue);
}

res = makeFault();
BU.CLI(res);


// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('fault', res));
BU.CLI(res)