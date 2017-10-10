const Converter = require('../Converter.js');
const singleHexProtocolTable = require('./singleHexProtocolTable.js');

class Decoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = singleHexProtocolTable.encodingProtocolTable(dialing);
  }

  convertNum2Hx2Buffer(dec, width){
    let hex = dec.toString(16);
    hex = this.pad(hex, width || 4);
    return Buffer.from(hex, 'ascii');
  }

  convertBuffer2Hex2Dec(buffer){
    let str = buffer.toString();
    return Number(this.converter().hex2dec(str));
  }

  convertHex2Binary(hex) {
    let returnValue = '';
    for (let index = 0; index < hex.length; index++) {
      let bin = this.converter().hex2bin(hex.charAt(index));
      let fillBin = this.pad(bin, 4);

      returnValue = returnValue.concat(fillBin);
    }
    // BU.CLI(returnValue);
    return returnValue;
  }

  spliceArrBuffer(buf){
    buf = typeof buf !== 'object' ? Buffer.from(buf, 'ascii'): buf;
    let returnValue = [];
    let point = 0;
    for(let cnt = 0; cnt <= buf.length; cnt++){
      if(cnt % 4 === 0 && cnt > 0){
        returnValue.push(buf.slice(point, cnt));
        point = cnt;
      }
    }
    return returnValue;
  }


  fault(msg) {
    let returnValue = [];

    singleHexProtocolTable.faultInfo(0);

    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);

    arrSpliceBuffer.forEach((buffer, index) => {
      let binaryValue = this.convertHex2Binary(buffer.toString());
      let faultTable = singleHexProtocolTable.faultInfo(index);
      
      _.each(faultTable, faultObj => {
        let binaryCode = binaryValue.charAt(faultObj.number);
        if(binaryCode === faultObj.errorValue.toString()){
          returnValue.push(faultObj);
        }
      })
    })
    return returnValue;
  }

  pv(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    let returnValue = {
      vol: this.convertBuffer2Hex2Dec( arrSpliceBuffer[0]),
      amp:this.convertBuffer2Hex2Dec(arrSpliceBuffer[1]) / 10
    };

    return returnValue;
  }

  grid(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);

    let returnValue = {
      rsVol: this.convertBuffer2Hex2Dec( arrSpliceBuffer[0]), // rs 선간 전압
      stVol: this.convertBuffer2Hex2Dec( arrSpliceBuffer[1]), // st 선간 전압
      trVol: this.convertBuffer2Hex2Dec( arrSpliceBuffer[2]), // tr 선간 전압
      rAmp: this.convertBuffer2Hex2Dec( arrSpliceBuffer[3]) / 10, // r상 전류
      sAmp: this.convertBuffer2Hex2Dec( arrSpliceBuffer[4]) / 10, // s상 전류
      tAmp: this.convertBuffer2Hex2Dec( arrSpliceBuffer[5]) / 10, // t상 전류
      lf: this.convertBuffer2Hex2Dec( arrSpliceBuffer[6]) / 10 // 라인 주파수 Line Frequency, 단위: Hz
    };
    return returnValue;
  }

  power(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    let high = this.convertBuffer2Hex2Dec(arrSpliceBuffer[1]);
    let low = this.convertBuffer2Hex2Dec(arrSpliceBuffer[2]);
    let returnValue = {
      gridKw: this.convertBuffer2Hex2Dec(arrSpliceBuffer[3])  / 1000,   // 출력 전력
      dailyKwh: this.convertBuffer2Hex2Dec(arrSpliceBuffer[6]) / 10,    // 하루 발전량 kWh
      cpKwh: (high * 10000 + low) / 1000 , // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: this.convertBuffer2Hex2Dec(arrSpliceBuffer[5]) / 10  // 역률 Power Factor %
    }
    return returnValue;
  }

  sysInfo(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    
    let returnValue = {
      hasSingle: arrSpliceBuffer[0][0].toString() === 1 ? 1 : 0, // 단상 or 삼상
      capa: Number(arrSpliceBuffer[0].slice(1, 4).toString()) / 10  ,  // 인버터 용량 kW
      productYear: '20' + arrSpliceBuffer[1].slice(0, 2).toString() + arrSpliceBuffer[1].slice(2, 4).toString() , // 제작년도 월 일 yyyymmdd,
      sn: Number(arrSpliceBuffer[2].toString())  // Serial Number
    }
    return returnValue;
  }

  weather(msg) {

  }

  // FIXME Buffer 처리 필요
  _receiveData(buffer) {
    try {
      // BU.CLIS(buffer.toString(), buffer.length)
      let headerBuffer = buffer.slice(0, 8);
      let bodyBuffer = buffer.slice(8, buffer.length - 5);
      let footerBuffer = buffer.slice(buffer.length - 5);
  
      let sliceHeader = this.spliceArrBuffer(headerBuffer);
  
      // BU.CLI(sliceHeader[1].toString())
  
      let addr = sliceHeader[1].toString();
  
  
      let cmd = '';
      _.find(this.protocolTable, (obj, key) => {
        if(obj.address === addr){
          cmd = key
          return true;
        }
      }); 

      if(cmd === ''){
        return false;
      }

      // BU.CLI(cmd)
      let returnValue = {
        cmd,
        contents: this[cmd](bodyBuffer)
      }
      return returnValue;
    } catch (error) {
      // BU.CLI(error)
      throw Error(error);
    }
    
  }


}

module.exports = Decoder;