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

const Encoder = require('./Encoder');
const encoder = new Encoder();


const dialing = 0x01;

const protocol = require('./s5500kProtocol');
const protocolTable = protocol.encodingProtocolTable(dialing);


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
  getOperation: 'operation',
  getPv: 'pv',
  getGrid: 'grid',
  getPower: 'power',
  getSystem: 'system',
  getWeather: 'weather'
}

function makeReceiveMsg() {
  let res = null;
  init();

  
  

}



// function makeBufferMsg(cmd, arr) {
  let resMsg = [
    0xB1, // Header1
    0xB5, // Header2
    dialing,  // Station ID
    0x15, // Input Voltage1 LSB
    0x0E, // Input Voltage1 MSB
    0x32, // Input Current1 LSB
    0x0A, // Input Current1 MSB
    0x98, // Input Power1 LSB
    0x08, // Input Power1 MSB
    0xAC, // Input Voltagr2 LSB
    0x0D, // input Voltage2 MSB
    0xCE, // Input Current2 LSB
    0x04, // INput Current2 MSB
    0x4C, // input Power2 LSB
    0x04, // Input Power2 MSB
    0xFD, // Output Voltage LSB
    0x08, // Output Voltage MSB
    0xD0, // OUtput Current LSB
    0x07, // OUtput Current MSB
    0x79, // Output Power LSB
    0x00, // Output Power MSB
    0x59, // Frequency LSB
    0x02, // Frequency MSB
    0xE7, // E - Total LSB
    0x03, // E - Total -
    0x00, // E - Total MSB 
    0x6A, // E - Today LSB
    0x08, // E - Today MSB
    0x60, // Temperature LSB
    0x01, // Temperature MSB
    0x00, // REserved
    0x8E, // Time LSB
    0x89, // Time - 
    0x00, // Time MSB
    0x40, // INV Status
    0x80, // Grid FAult
    0x10, // Fault1
    0x20, // Fault2
    0x08  // Warring
  ]

  let buffer = Buffer.from(resMsg);

  let ckSum = decoder.getCheckSum(buffer);
  BU.CLI(ckSum)

  buffer = Buffer.concat([buffer, ckSum]);


  decoder._receiveData(buffer)


// }

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

  res = makeBufferMsg('system', arr);
  res = decoder._receiveData(res);

  return res;
}
exports.makeSysInfo = makeSysInfo;
res = makeSysInfo();
BU.CLI(res);

// Decoding Socket Test
res = decodingMsgSocket.sysInfo(makeSingleMsg('system', res));
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
  let res = null;
  let vol = decoder.convertNum2Hx2Buffer(266, 4);
  let amp = decoder.convertNum2Hx2Buffer(57, 4);

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
  return Buffer.concat(returnValue);
}

res = makeFault();
BU.CLI(res);


// Decoding Socket Test
res = decodingMsgSocket.power(makeSingleMsg('fault', res));
BU.CLI(res)