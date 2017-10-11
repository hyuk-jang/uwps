const Converter = require('../Converter.js');
const s_hexProtocol = require('./s_hexProtocol');

class Decoder extends Converter {
  constructor(dialing) {
    super();
    this.protocolTable = s_hexProtocol.encodingProtocolTable(dialing);
  }

  /**
   * Buffer를 spiceByteLength 길이만큼 잘라 Array 넣어 반환
   * @param {Buffer} buffer Buffer
   * @param {Number} spliceByteLength Buffer 자를 단위 길이
   */
  spliceBuffer2ArrayBuffer(buffer, spliceByteLength) {
    let returnValue = [];
    let buf = this.makeMsg2Buffer(buffer);
    let point = 0;
    for (let cnt = 0; cnt <= buf.length; cnt++) {
      if (cnt % spliceByteLength === 0 && cnt > 0) {
        returnValue.push(buf.slice(point, cnt));
        point = cnt;
      }
    }
    return returnValue;
  }


  fault(msg) {
    // BU.CLI('fault', msg)
    let returnValue = [];
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    // BU.CLI(arrSpliceBuffer)
    arrSpliceBuffer.forEach((buffer, index) => {
      let binaryValue = this.convertChar2Binary(buffer.toString(), 4);
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
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    let returnValue = {
      vol: this.convertBuffer2Char2Dec(arrSpliceBuffer[0]),
      amp: this.convertBuffer2Char2Dec(arrSpliceBuffer[1]) / 10
    };

    return returnValue;
  }

  grid(msg) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);

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
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
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
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);

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

  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));

    // return Buffer.from(this.getSumBuffer(buf), 'hex');
  }

  _receiveData(buffer) {
    try {
      // Start, dialing, Cmd, Addr
      let bufArray = [
        0, 1, 2, 1, 4
      ]
      // Start, dialing, Cmd, Addr, Data, Ck_Sum, End
      let resBufArray = [];

      let lastIndex = bufArray.reduce((accmulator, currentValue, index) => {
        resBufArray.push(buffer.slice(accmulator, accmulator + currentValue));
        return accmulator + currentValue;
      })
      resBufArray.push(buffer.slice(lastIndex, buffer.length - 5))
      resBufArray.push(buffer.slice(buffer.length - 5, buffer.length - 1))
      resBufArray.push(buffer.slice(buffer.length - 1))

      if (Buffer.compare(resBufArray[0], this.ACK)) {
        throw Error('ACK Error');
      } else if (Buffer.compare(resBufArray[resBufArray.length - 1], this.EOT)) {
        throw Error('EOT Error');
      } else if (Buffer.compare(this.getBufferCheckSum(Buffer.concat(resBufArray.slice(1, 5))), resBufArray[5])) {
        throw Error('CkSum Error');
      }

      let addr = resBufArray[3].toString();

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
        } else if (typeof obj.address === 'string') {
          value = obj.address;
        }

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
        contents: this[cmd](resBufArray[4])
      }
      // BU.CLI('returnValue', returnValue)
      return returnValue;
    } catch (error) {
      // BU.CLI(error)
      throw Error(error);
    }

  }


}

module.exports = Decoder;