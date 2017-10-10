const EventEmitter = require('events');

const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

class Converter extends EventEmitter {
  constructor() {
    super();

    this.resultMakeMsg2Buffer = [];
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
   * 
   * @param {Number} dec 10진수 number, Buffer로 바꿀 값
   * @param {Number} byteLength Hex to Ascii Buffer 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0 채움
   */
  convertNum2Hx2Buffer(dec, byteLength) {
    let hex = dec.toString(16);
    hex = this.pad(hex, byteLength || 4);
    return Buffer.from(hex, 'ascii');
  }

  /**
   * Buffer Hex 합산 값을 Byte 크기만큼 Hex로 재 변환
   * @param {Buffer} buffer Buffer 
   * @param {Number} byteLength Buffer Size를 Byte로 환산할 값, Default: 4
   */
  getBufferCheckSum(buffer, byteLength) {
    byteLength = byteLength ? byteLength : 4;
    let hx = 0;
    buffer.forEach(element => {
      hx += element;
    });
    return Buffer.from(this.pad(hx.toString(16), byteLength || 4));
  }

  getSumBuffer(buf) {
    let decCheckSum = 0;
    buf.forEach(element => decCheckSum += element);
    let hexCheckSum = this.converter().dec2hex(decCheckSum);
    return hexCheckSum;
  }

  /**
   * Ascii Char To Ascii Hex
   */
  makeMsg2Buffer() {
    // BU.CLI(arguments)
    this.resultMakeMsg2Buffer = [];
    for (let index in arguments) {
      if (Array.isArray(arguments[index])) {
        this._convertArray2Buffer(arguments[index])
      } else if (typeof arguments[index] === 'string') {
        this.resultMakeMsg2Buffer.push(Buffer.from(arguments[index]));
      } else if (typeof arguments[index] === 'number') {
        return this.resultMakeMsg2Buffer.push(Buffer.from(this.converter().dec2hex(arguments[index]), 'hex'));
      } else {
        this.resultMakeMsg2Buffer.push(arguments[index]);
      }
    }
    return Buffer.concat(this.resultMakeMsg2Buffer);
  }

  /**
   * 배열을 Buffer로 변환하여 msgBuffer에 저장
   * @param {Array} arr Array<Buffer, String, Number, Array> 가능
   */
  _convertArray2Buffer(arr) {
    // BU.CLI(arr)
    if (Array.isArray(arr)) {
      arr.forEach(element => {
        if (Array.isArray(element)) {
          return this._convertArray2Buffer(element);
        } else if (typeof element === 'object') { // Buffer
          if (Buffer.isBuffer(element)) {
            return this.resultMakeMsg2Buffer.push(element);
          } else {
            value = Buffer.from(element);
          }
          // return this.resultMakeMsg2Buffer.push(element);
        } else if (typeof element === 'number') { // Dec
          return this.resultMakeMsg2Buffer.push(Buffer.from(this.converter().dec2hex(element), 'hex'));
        } else if (typeof element === 'string') { // Ascii Chr
          return this.resultMakeMsg2Buffer.push(Buffer.from(element));
        }
      });
    }
  }

  // makeMsg2Buffer() {
  //   let msg = ''
  //   BU.CLI(arguments)
  //   for (let index in arguments) {
  //     if (Array.isArray(arguments[index])) {
  //       arguments[index].forEach(ele => {
  //         if (typeof ele === 'number') {

  //         }
  //         msg = msg.concat(ele)
  //       });
  //     } else if (typeof arguments[index] === 'string') {
  //       msg = msg.concat(arguments[index]);
  //     } else {

  //     }
  //     const bufMsg = Buffer.from(msg, 'ascii');

  //     return bufMsg;
  //   }
  // }

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