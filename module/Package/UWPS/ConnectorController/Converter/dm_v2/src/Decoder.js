const BU = require('base-util-jh').baseUtil;
const _ = require('underscore');

const {Converter} = require('base-class-jh');
const protocol = require('./protocol');

class Decoder extends Converter {
  constructor() {
    super();

    this.returnValue = [];
    this.splitModuleDataCount = 4;
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


  operation(msg) {
    // BU.CLI('fault', msg)
    this.returnValue.errorList = [];
    let returnValue = [];
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    // BU.CLI(arrSpliceBuffer)
    arrSpliceBuffer.forEach((buffer, index) => {
      let binaryValue = this.convertChar2Binary(buffer.toString(), 4);
      let operationTable = protocol.operationInfo(index);
      _.each(operationTable, operationObj => {
        let binaryCode = binaryValue.charAt(operationObj.number);

        // 인버터 동작 유무
        if (operationObj.code === 'inverter run') {
          this.returnValue.isRun = Number(binaryCode);
        } else if (binaryCode === operationObj.errorValue.toString()) {
          this.returnValue.errorList.push(operationObj);
        }
      })
    })

    // 배열에 에러 데이터가 있다면 현재 에러 검출여부 반영
    if (this.returnValue.errorList.length) {
      this.returnValue.isError = 1;
    } else {
      this.returnValue.isError = 0;
    }

  }

  pv(msg) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    this.returnValue.vol = this.convertBuffer2Char2Dec(arrSpliceBuffer[0]);
    this.returnValue.amp = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]) / 10;
  }

  grid(msg) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);

    let hi = this.getBaseInverterValue();
    this.returnValue.rsVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[0]); // rs 선간 전압
    this.returnValue.stVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]); // st 선간 전압
    this.returnValue.trVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[2]); // tr 선간 전압
    this.returnValue.rAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 10; // r상 전류
    this.returnValue.sAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[4]) / 10; // s상 전류
    this.returnValue.tAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10; // t상 전류
    this.returnValue.lf = this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10 // 라인 주파수 Line Frequency; 단위 = Hz
  }

  power(msg) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    let high = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]);
    let low = this.convertBuffer2Char2Dec(arrSpliceBuffer[2]);

    this.returnValue.gridKw = this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 1000; // 출력 전력
    this.returnValue.dailyKwh = this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10; // 하루 발전량 kWh
    this.returnValue.cpKwh = (high * 10000 + low) / 1000; // 인버터 누적 발전량 mWh  Cumulative Power Generation
    this.returnValue.pf = this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10; // 역률 Power Factor %
  }

  system(msg) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);

    this.returnValue.isSingle = arrSpliceBuffer[0].slice(0, 1).toString() === '1' ? 1 : 0; // 단상 or 삼상
    this.returnValue.capa = Number(arrSpliceBuffer[0].slice(1, 4).toString()) / 10; // 인버터 용량 kW
    this.returnValue.productYear = '20' + arrSpliceBuffer[1].slice(0, 2).toString() + arrSpliceBuffer[1].slice(2, 4).toString(); // 제작년도 월 일 yyyymmdd,
    this.returnValue.sn = Number(arrSpliceBuffer[2].toString()); // Serial Number
  }

  weather(msg) {

  }

  checkCrc(buf) {
    const crc = require('crc')
    let indexETX = buf.indexOf(0x03)
    let indexEOT = buf.indexOf(0x04)
    let crcValue = buf.slice(indexETX + 1, indexEOT)
    let bufBody = buf.slice(0, indexETX + 1)

    BU.CLI(bufBody.toString())

    let baseCrcValue = crc.crc16xmodem(bufBody.toString())

    if (crcValue.toString() === baseCrcValue.toString(16)) {
      return buf.slice(0, indexETX)
    } else {
      throw 'Crc Error'
    }
  }

  /**
   * 
   * @param {Buffer} buffer 접속반으로 받은 Buffer
   */
  _receiveData(buffer) {
    try {
      let bufBody = this.checkCrc(buffer)

      // 모듈 단위로 나눔
      const realBody = bufBody.toString().split(',').slice(2)

      let returnValue = []

      // 0: 명령 코드, 1: 접속반 ID, 2~ 모듈 데이터
      for (let indexHeader = 0; indexHeader < realBody.length; indexHeader++) {
        let moduleData = realBody[indexHeader];
        // 채널 별로 그루핑
        let channelGroup = _.groupBy(moduleData, (char, index) => {
          return parseInt(index / this.splitModuleDataCount, 0)
        })
        // 전류, 전압 단위로 그루핑
        let powerGroup = _.groupBy(channelGroup, (storage, index) => {
          return Number(index) % this.splitModuleDataCount
        })

        _.each(powerGroup, (powerObj, index) => {
          let amp = Number(powerObj[0].reduce((prev, next) => prev + next)) / 10;
          let vol = Number(powerObj[1].reduce((prev, next) => prev + next)) / 10;
          returnValue.push({
            ch: (Number(index) + 1) + this.splitModuleDataCount * indexHeader,
            amp,
            vol
          })
        })
      }
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Decoder;