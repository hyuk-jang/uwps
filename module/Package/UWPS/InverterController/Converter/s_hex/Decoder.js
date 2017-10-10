const Converter = require('../Converter.js');
const s_hexProtocol = require('./s_hexProtocol');

class Decoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = s_hexProtocol.encodingProtocolTable(dialing);
  }

  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 31 52>
   * @returns {Number} Dec
   */
  convertBuffer2Char2Dec(buffer) {
    let str = buffer.toString();
    // BU.CLI(Number(this.converter().hex2dec(str)))
    return Number(this.converter().hex2dec(str));
  }

  convertBuffer2Binary(buffer){
    let returnValue = '';
    for (let index = 0; index < asciiChar.length; index++) {
      let bin = this.converter().hex2bin(asciiChar.charAt(index));

      returnValue = returnValue.concat(this.pad(bin, 4));
    }
    return returnValue;
  }


  /**
   * Ascii Char String 을 4 * n Length Binary String 으로 치환하여 반환
   * @param {String} asciiChar ascii char를 2진 바이너리로 변환하여 반환
   */
  convertChar2Binary(asciiChar) {
    let returnValue = '';
    for (let index = 0; index < asciiChar.length; index++) {
      let bin = this.converter().hex2bin(asciiChar.charAt(index));

      returnValue = returnValue.concat(this.pad(bin, 4));
    }
    return returnValue;
  }

  spliceArrBuffer(buf, spliceByte) {
    buf = typeof buf !== 'object' ? Buffer.from(buf, 'ascii') : buf;
    let returnValue = [];
    let point = 0;
    for (let cnt = 0; cnt <= buf.length; cnt++) {
      if (cnt % spliceByte === 0 && cnt > 0) {
        returnValue.push(buf.slice(point, cnt));
        point = cnt;
      }
    }
    return returnValue;
  }


  fault(msg) {
    BU.CLI('fault', msg)
    let returnValue = [];
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    BU.CLI(arrSpliceBuffer)
    arrSpliceBuffer.forEach((buffer, index) => {
      let binaryValue = this.convertChar2Binary(buffer.toString());
      let faultTable = s_hexProtocol.faultInfo(index);

      _.each(faultTable, faultObj => {
        let binaryCode = binaryValue.charAt(faultObj.number);
        if (binaryCode === faultObj.errorValue.toString()) {
          returnValue.push(faultObj);
        }
      })
    })
    return returnValue;
  }

  pv(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    let returnValue = {
      vol: this.convertBuffer2Char2Dec(arrSpliceBuffer[0]),
      amp: this.convertBuffer2Char2Dec(arrSpliceBuffer[1]) / 10
    };

    return returnValue;
  }

  grid(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);

    let returnValue = {
      rsVol: this.convertBuffer2Char2Dec(arrSpliceBuffer[0]), // rs 선간 전압
      stVol: this.convertBuffer2Char2Dec(arrSpliceBuffer[1]), // st 선간 전압
      trVol: this.convertBuffer2Char2Dec(arrSpliceBuffer[2]), // tr 선간 전압
      rAmp: this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 10, // r상 전류
      sAmp: this.convertBuffer2Char2Dec(arrSpliceBuffer[4]) / 10, // s상 전류
      tAmp: this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10, // t상 전류
      lf: this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10 // 라인 주파수 Line Frequency, 단위: Hz
    };
    return returnValue;
  }

  power(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);
    let high = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]);
    let low = this.convertBuffer2Char2Dec(arrSpliceBuffer[2]);
    let returnValue = {
      gridKw: this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 1000, // 출력 전력
      dailyKwh: this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10, // 하루 발전량 kWh
      cpKwh: (high * 10000 + low) / 1000, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10 // 역률 Power Factor %
    }
    return returnValue;
  }

  sysInfo(msg) {
    let arrSpliceBuffer = this.spliceArrBuffer(msg, 4);

    let returnValue = {
      hasSingle: arrSpliceBuffer[0][0].toString() === 1 ? 1 : 0, // 단상 or 삼상
      capa: Number(arrSpliceBuffer[0].slice(1, 4).toString()) / 10, // 인버터 용량 kW
      productYear: '20' + arrSpliceBuffer[1].slice(0, 2).toString() + arrSpliceBuffer[1].slice(2, 4).toString(), // 제작년도 월 일 yyyymmdd,
      sn: Number(arrSpliceBuffer[2].toString()) // Serial Number
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

      let sliceHeader = this.spliceArrBuffer(headerBuffer, 4);



      let addr = sliceHeader[1].toString();
      BU.CLI(addr)

      let cmd = '';
      let value = '';
      _.find(this.protocolTable, (obj, key) => {
        
        if (typeof obj.address === 'number') {
          value = Buffer.from(this.converter().dec2hex(obj.address), 'hex').toString();
        } else if (typeof obj.address === 'object') {
          if (Buffer.isBuffer(obj.address)) {
            value = obj.address.toString();
          } else {
            value = Buffer.from(obj.address).toString();
          }
        } else if (typeof obj.address === 'string'){
          value = obj.address;
        }
        // value = typeof obj.address === 'number' ? obj.address.toString(16) : obj.address;
        if (value === addr) {
          cmd = key
          return true;
        }
      });

      if (cmd === '') {
        BU.CLI(value)
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