const BU = require('base-util-jh').baseUtil;
const {
  Converter
} = require('base-class-jh');
/** 명령 리스트 및 에러 규약이 들어있는 객체 */
const protocol = require('./protocol');

/** Class 헥스파워 단상 Encoder Converter */
class Encoder extends Converter {
  /**
   * 국번을 부여하여 Decoder 객체 생성
   * @param {Buffer} dialing 장치 ID
   * Buffer를 권장하나 [...0x], 유사 Buffer, string(ascii chr)도 변경 가능
   * - [0x30, 0x31, 0x32] -> <Buffer 30 31 32>
   * - 유사 Buffer : {type: Buffer, data: [0, 0, 1]} -> <Buffer 30 31 32>
   * - string 012 -> <Buffer 30 31 32>
   */
  constructor(dialing) {
    super();
    this.protocolTable = protocol.encodingProtocolTable(dialing);
  }

  /**
   * 헥스 파워 단상 인버터 CheckSum 구하는 공식
   * @param {Buffer} buf 
   * @return {Buffer} CheckSum Buffer
   */
  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));
  }

  /**
   * 요청 명령에 따라 명령 생성 ['operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather']
   * @param {string} cmd 
   * @return {Buffer} 전송 프로토콜 형식과 CheckSum을 합산하여 반환
   * Buffer -> ENQ + Body + CheckSum + EOT
   */
  makeSingleMsg(cmd) {
    // BU.CLI(cmd);
    try {
      let msg = this.protocolTable[cmd];
      // BU.CLI(msg)
      if (msg === undefined || BU.isEmpty(msg)) {
        return {};
      }
      let body = this.makeMsg2Buffer(Object.values(msg));
      let returnValue = [
        this.ENQ,
        body,
        this.getCheckSum(body),
        this.EOT
      ];

      return Buffer.concat(returnValue);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 모든 명령 생성 ['operation', 'pv', 'grid', 'power', 'system', // getWeather: 'weather']
   * @return {Buffer[]} 전송 프로토콜 형식과 CheckSum을 합산하여 만든 Buffer List 반환
   * Buffer -> ENQ + Body + CheckSum + EOT
   */
  makeMsg() {
    try {
      let returnValue = [];
      // BU.CLI(this.protocolTable)
      for (let key in this.protocolTable) {
        let body = this.makeMsg2Buffer(Object.values(this.protocolTable[key]));
        let msg = [
          this.ENQ,
          body,
          this.getCheckSum(body),
          this.EOT
        ];
        returnValue.push(Buffer.concat(msg));
      }
      // BU.CLI(returnValue)
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Encoder;