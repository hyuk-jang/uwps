
// const {expect} = require('chai');
// const {Converter} = require('base-class-jh');

const BU = require('base-util-jh').baseUtil;
BU.CLI('what?');
const Decoder = require('../src/Decoder');
return;
BU.CLI('what?');
const _ = require('underscore');

const converter = new Converter();
const protocol = require('../src/protocol');
const protocolTable  = protocol.encodingProtocolTable([0x30, 0x31]);

BU.CLI('what?');

// describe('Decoder Test', () => {
//   const decoder = new Decoder();
//   const cmdList = [
//     'operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather'
//   ];
//   let dummyBuffer;
//   let result;

//   beforeEach(() => {
//     let cmd = cmdList.shift();
//     let hasBinary = cmd === 'operation' ? true : false;
//     BU.CLI(cmd, hasBinary);
//     dummyBuffer = makeReceiveData(cmd, hasBinary);
//     BU.CLI('dummyBuffer',dummyBuffer);
//   });

//   it(`Decoder Test ${cmdList[0]}`, done => {
//     result = decoder._receiveData(dummyBuffer);
//     expect(result).to.be.ok;
//     done();
//   });

//   it(`Decoder Test ${cmdList[1]}`, done => {
//     result = decoder._receiveData(dummyBuffer);
//     expect(result).to.be.ok;
//     done();
//   });

//   it(`Decoder Test ${cmdList[2]}`, done => {
//     result = decoder._receiveData(dummyBuffer);
//     expect(result).to.be.ok;
//     done();
//   });

//   it(`Decoder Test ${cmdList[3]}`, done => {
//     result = decoder._receiveData(dummyBuffer);
//     expect(result).to.be.ok;
//     done();
//   });

//   it(`Decoder Test ${cmdList[4]}`, done => {
//     result = decoder._receiveData(dummyBuffer);
//     expect(result).to.be.ok;
//     done();
//   });

//   afterEach(() => {
//     // BU.CLI(result)
//   });
// });


// function makeReceiveData(cmd, hasBinary, bufferWidth) {
//   init();
//   let returnValue = {};
//   let buffer = null;
//   let body = [];
//   let convertBufferBody = [];
//   switch (cmd) {
//   case 'system':
//     body = [
//       0x1030, // 1: isSingle, 030: Kw(10:1 Scale)
//       0x0510, // 제조년: 20yymm
//       0x0001 // Serial Number: 
//     ];
//     break;
//   case 'power':
//     body = [
//       2724, // currPvKw
//       57, // ivtHighAddr // currIvtKva
//       230, // ivtLowAddr 
//       2518, // currIvtKw
//       298, // ivtMaxKw
//       998, // ivtPf
//       1134, // ivtDailyKwh
//       0 // x
//     ];
//     break;
//   case 'grid':
//     body = [
//       217, // R 상 I
//       0, // S 상 I
//       0, // T 상 I
//       65, // RS 상 V
//       0, // ST 상 V
//       0, // TR 상 V
//       601 // HZ
//     ];
//     break;
//   case 'pv':
//     body = [
//       266,  // vol
//       57  // amp
//     ];
//     break;
//   case 'operation':
//     body = makeFaultMsg();
//     break;
//   default:
//     break;
//   }
//   // BU.CLI(body)

//   if (hasBinary) {
//     convertBufferBody = body;
//   } else {
//     body.forEach(element => {
//       convertBufferBody.push(converter.convertNum2Hx2Buffer(element, bufferWidth));
//     });
//   }

//   BU.CLI(convertBufferBody);
//   buffer = makeBufferMsg(cmd, convertBufferBody);
//   BU.CLI(buffer);
//   return buffer;
// }

// function makeBufferMsg(cmd, arr) {
//   BU.CLI(cmd, arr);
//   let ACK = converter.ACK;
//   let EOT = converter.EOT;

//   // BU.CLIS(protocolTable, cmd, arr)
//   let dialing = protocolTable[cmd].dialing;
//   let code = protocolTable[cmd].code;
//   let address = protocolTable[cmd].address;

//   BU.CLIS(dialing, code, address);

//   let body = converter.makeMsg2Buffer([dialing, code, address], arr);

//   // let realBuffer = Buffer.concat(arr);
//   BU.CLI(body);
//   let checkSum = converter.getBufferCheckSum(body, 4);
//   return Buffer.concat([ACK, body, checkSum, EOT]);
// }

// function makeFaultMsg() {
//   let returnValue = [];
//   for (let count = 0; count < 16; count++) {
//     let randomHex = _.random(0, 15).toString(16);
//     let buffer = Buffer.from(randomHex, 'ascii');
//     returnValue.push(buffer);
//   }

//   // BU.CLI(returnValue)
//   return Buffer.concat(returnValue);
// }
