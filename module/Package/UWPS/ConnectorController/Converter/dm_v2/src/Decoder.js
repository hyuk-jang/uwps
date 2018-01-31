const _ = require('underscore');
const crc = require('crc');
const { Converter } = require('base-class-jh');
/** Class Msg Buffer Parsing */
class Decoder extends Converter {
  constructor() {
    super();

    this.returnValue = [];
    this.splitModuleDataCount = 4;

    /** baseFormat Guide Line */
    this.baseFormat = require('../../').baseFormat;
    // BU.CLI(this.baseFormat)
  }

  /**
   * 접속반 가이드라인 데이터 형태
   */
  getBaseValue() {
    return Object.assign({}, this.baseFormat);
  }

  /**
   * crc 반환
   * @param {Buffer} bufferStorage crc16xmodem CRC를 구할 Body
   * @return {Buffer} UpperCase 적용 후 Buffer
   */
  transCrc(bufferStorage){
    let crcValue = crc.crc16xmodem(bufferStorage.toString());
    let lower = this.convertNum2Hx2Buffer(crcValue, 4);
    let strLower =  lower.toString();
    let strUpper = strLower.toLocaleUpperCase();

    return Buffer.from(strUpper);
  }

  /**
   * STX ~ ETX 까지의 CRC 유효성을 체크
   * @param {buffer} buf 데이터 CRC 체크
   * @return {buffer|error} crc 값이 참이라면 STX~ETX 까지의 Buffer, 아니라면 throw error
   */
  checkCrc(buf) {
    let indexETX = buf.indexOf(0x03);
    let indexEOT = buf.indexOf(0x04);
    let crcValue = buf.slice(indexETX + 1, indexEOT);
    let bufBody = buf.slice(0, indexETX + 1);

    let crcBuffer = this.transCrc(bufBody);
    console.log('@@@@@@@@@@', crcBuffer.toString());
    // BU.CLI(bufBody.toString())

    let baseCrcValue = crc.crc16xmodem(bufBody.toString());
    if (crcValue.toString() === baseCrcValue.toString(16)) {
      return buf.slice(0, indexETX);
    } else {
      throw 'Crc Error';
    }
  }

  /**
   * 장치로부터 수신받은 데이터를 처리하는 메소드
   * @param {buffer} buffer 접속반으로 받은 Buffer
   * @return {object[]|error} object -> {ch:number, amp:number, vol:number}, 아니라면 throw Error
   */
  _receiveData(buffer) {
    try {
      
      let bufBody = this.checkCrc(buffer);

      // 모듈 단위로 나눔
      const realBody = bufBody.toString().split(',').slice(2);

      let returnValue = [];

      // 0: 명령 코드, 1: 접속반 ID, 2~ 모듈 데이터
      for (let indexHeader = 0; indexHeader < realBody.length; indexHeader++) {
        let moduleData = realBody[indexHeader];
        // 채널 별로 그루핑
        let channelGroup = _.groupBy(moduleData, (char, index) => {
          return parseInt(index / this.splitModuleDataCount, 0);
        });
        // 전류, 전압 단위로 그루핑
        let powerGroup = _.groupBy(channelGroup, (storage, index) => {
          return Number(index) % this.splitModuleDataCount;
        });

        _.each(powerGroup, (powerObj, index) => {
          let amp = Number(powerObj[0].reduce((prev, next) => prev + next)) / 10;
          let vol = Number(powerObj[1].reduce((prev, next) => prev + next)) / 10;

          let baseValue = this.getBaseValue();

          baseValue.amp = amp;
          baseValue.vol = vol;
          baseValue.ch = (Number(index) + 1) + this.splitModuleDataCount * indexHeader;

          returnValue.push(baseValue);
        });
      }
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Decoder;