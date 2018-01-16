const crc = require('crc');

const {Converter} = require('base-class-jh');
const protocol = require('./protocol');

/** Class Ecoding 디엠테크 접속반 (6kw 급 테스트베드 설치 접속반 (6CH)) */
class Encoder extends Converter {
  /**
   * 국번을 설정
   * @param {buffer} dialing 장치 id(국번)
   */
  constructor(dialing) {
    super();
    this.protocolTable = protocol.encodingProtocolTable(dialing);
  }

  /**
   * 정해진 프로토콜에 따라 명령 생성
   * @param {{code:number[],dialing:buffer}} obj 명령 요청 구성 정보
   * @return {buffer}
   */
  generateMsg(obj) {
    let body = this.makeMsg2Buffer(Object.values(obj));

    let bufferStorage = Buffer.concat([
      this.STX,
      body,
      this.ETX
    ]);

    let crcValue = crc.crc16xmodem(bufferStorage.toString());

    let returnValue = [
      bufferStorage,
      this.convertNum2Hx2Buffer(crcValue, 2),
      this.EOT
    ];

    return Buffer.concat(returnValue);
  }

  /**
   * protocol table을 기초로 모든 명령 생성
   * @return {buffer[]|error} 정상이라
   */
  makeMsg() {
    try {
      let returnValue = [];
      for (let key in this.protocolTable) {
        returnValue.push(this.generateMsg(Object.values(this.protocolTable[key])));
      }
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;