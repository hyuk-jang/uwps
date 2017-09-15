const EventEmitter = require('events');

class Converter extends EventEmitter {
  constructor() {
    super();
  }
  get ENQ() {
    return Buffer.from('05', 'hex');
  }

  get ACK() {
    return Buffer.from('06', 'hex');
  }

  get EOT() {
    return Buffer.from('04', 'hex');
  }

  pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  /**
   * Buffer Hex 합산 값을 Byte 크기만큼 Hex로 재 변환
   * @param {Buffer} buffer Buffer 
   * @param {Number} byteCount Buffer Size를 Byte로 환산할 값, Default: 4
   */
  getBufferCheckSum(buffer, byteCount) {
    byteCount = byteCount ? byteCount : 4;
    let hx = 0;
    buffer.forEach(element => {
      hx += element;
    });
    return Buffer.from(this.pad(hx.toString(16), byteCount));
  }

  /**
   * Ascii Char To Ascii Hex
   * @param {String} dialing 국번: 2 Byte 
   * @param {String} cmd 명령: 1 Byte
   * @param {String} addr  시작 번지: 4 Byte
   * @param {String} count 갯수: 2 Byte
   */
  makeAscii2Buffer(dialing, cmd, addr, count) {
    let msg = ''
    for (let index in arguments) {
      msg = msg.concat(arguments[index]);
    }
    const bufMsg = Buffer.from(msg, 'ascii');
    // BU.CLIS(this.ENQ, bufMsg,this.getBufferCheckSum(bufMsg), this.EOT)
    let body = Buffer.concat([this.ENQ, bufMsg, this.getBufferCheckSum(bufMsg), this.EOT])

    return body;
  }

  /**
   * 단일 값 Sacle 적용. 소수점 절삭
   * @param {Number} value Scale을 적용할 Value
   * @param {Number} scale 배율. 계산한 후 소수점 절삭 1자리
   */
  applyValueCalculateScale(value, scale, toFixed) {
    return typeof value === 'number' ? Number((parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1)) : value;
  }

  /**
   * Object에 Sacle 적용. 소수점 절삭
   * @param {Object} obj Scale을 적용할 Object Data
   * @param {Number} scale 배율. 계산한 후 소수점 절삭 1자리
   */
  applyObjCalculateScale(obj, scale, toFixed) {
    _.each(obj, (value, key) => {
      obj[key] = this.applyValueCalculateScale(value, scale, toFixed);
    });
    return obj;
  }

  fault() {

  }

  pv() {

  }

  grid() {

  }

  power() {

  }

  sysInfo() {

  }

  weather() {

  }

  converter() {
    function ConvertBase(num) {
      return {
        from: baseFrom => {
          return {
            to: baseTo => parseInt(num, baseFrom).toString(baseTo)
          };
        }
      };
    }

    // binary to decimal
    ConvertBase.bin2dec = num => {
      return ConvertBase(num).from(2).to(10);
    };

    // binary to hexadecimal
    ConvertBase.bin2hex = num => {
      return ConvertBase(num).from(2).to(16);
    };

    // decimal to binary
    ConvertBase.dec2bin = num => {
      return ConvertBase(num).from(10).to(2);
    };

    // decimal to hexadecimal
    ConvertBase.dec2hex = num => {
      return ConvertBase(num).from(10).to(16);
    };

    // hexadecimal to binary
    ConvertBase.hex2bin = num => {
      return ConvertBase(num).from(16).to(2);
    };

    // hexadecimal to decimal
    ConvertBase.hex2dec = num => {
      return ConvertBase(num).from(16).to(10);
    };
    return ConvertBase;
  }



}
module.exports = Converter;