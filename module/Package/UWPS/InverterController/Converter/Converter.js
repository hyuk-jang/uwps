const EventEmitter = require('events');

const BUJ = require('base-util-jh');
const BU = BUJ.baseUtil;

class Converter extends EventEmitter {
  constructor() {
    super();

    this.resultMakeMsg2Buffer = [];
  }

  get baseInverterValue() {
    return {
      amp: 0, // Ampere
      vol: 0, // voltage
      gridKw: 0, // 출력 전력
      dailyKwh: 0, // 하루 발전량 kWh
      cpKwh: 0, // 인버터 누적 발전량 mWh  Cumulative Power Generation
      pf: 0, // 역률 Power Factor %
      rsVol: 0, // rs 선간 전압
      stVol: 0, // st 선간 전압
      trVol: 0, // tr 선간 전압
      rAmp: 0, // r상 전류
      sAmp: 0, // s상 전류
      tAmp: 0, // t상 전류
      lf: 0, // 라인 주파수 Line Frequency, 단위: Hz
      hasSingle: 0, // 단상 or 삼상
      capa: 0, // 인버터 용량 kW
      productYear: '00000000', // 제작년도 월 일 yyyymmdd,
      sn: '' // Serial Number
    }
  }

  get ENQ() {
    return Buffer.from([0x05]);
  }

  get ACK() {
    return Buffer.from([0x06]);
  }

  get EOT() {
    return Buffer.from([0x04]);
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
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 65
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34> 
   * @returns {Number} Dec
   */
  convertBuffer2Char2Dec(buffer) {
    // BU.CLI(buffer)
    let str = buffer.toString();
    // BU.CLI(Number(this.converter().hex2dec(str)))
    return Number(this.converter().hex2dec(str));
  }

  /**
   * Buffer Hx를 binaryLength * Count(Buffer Length) = Binary String 으로 치환하여 반환
   * @param {Buffer} buffer Buffer
   */
  convertBuffer2Binary(buffer, binaryLength) {
    let returnValue = '';
    buffer.forEach(element => {
      let bin = this.converter().hex2bin(element);
      returnValue = returnValue.concat(this.pad(bin, binaryLength || 4));
    })

    return returnValue;
  }


  /**
   * Ascii Char String 을 binaryLength * Count(String) = Binary String 으로 치환하여 반환
   * @param {String} asciiChar ascii char를 2진 바이너리로 변환하여 반환
   */
  convertChar2Binary(asciiChar, binaryLength) {
    let returnValue = '';

    for (let index = 0; index < asciiChar.length; index++) {
      let bin = this.converter().hex2bin(asciiChar.charAt(index));
      returnValue = returnValue.concat(this.pad(bin, binaryLength || 4));
    }
    return returnValue;
  }


  /**
   * Buffer Hex 합산 값을 Byte 크기만큼 Hex로 재 변환
   * @param {Buffer} buffer Buffer 
   * @param {Number} byteLength Buffer Size를 Byte로 환산할 값, Default: 4
   */
  getBufferCheckSum(buffer, byteLength) {
    let hx = 0;
    buffer.forEach(element => {
      hx += element;
    });
    return Buffer.from(this.pad(hx.toString(16), byteLength || 4));
  }

  /**
   * Buffer Element Hex 값 Sum
   * @param {Buffer} buffer 계산하고자 하는 Buffer
   * @param {Boolean} isReturnDec CheckSum을 Dec 로 받을지 여부. 기본값은 Hex
   */
  getSumBuffer(buffer, isReturnDec) {
    let decCheckSum = 0;
    buffer.forEach(element => decCheckSum += element);
    BU.CLI(decCheckSum)
    if (isReturnDec) {
      return decCheckSum;
    } else {
      let hexCheckSum = this.converter().dec2hex(decCheckSum);
      return hexCheckSum;
    }
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