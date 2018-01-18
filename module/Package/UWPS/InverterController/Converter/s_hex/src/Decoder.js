const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const {
  Converter
} = require('base-class-jh');

/** 명령 리스트 및 에러 규약이 들어있는 객체 */
const protocol = require('./protocol');

/** Class 헥스파워 단상 Decoder Converter */
class Decoder extends Converter {
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

    this.returnValue = [];

    this.baseFormat = require('../../').baseFormat;
  }

  /**
   * 인버터 가이드라인 데이터 형태
   * @return {baseFormat} Converter -> baseFormat Json
   */
  getBaseValue() {
    return Object.assign({}, this.baseFormat);
  }

  /**
   * Buffer를 spiceByteLength 길이만큼 잘라 Array 넣어 반환
   * @param {Buffer} buffer Buffer
   * @param {number} spliceByteLength Buffer 자를 단위 길이
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


  /**
   * 운영 정보 도출
   * @param {string|Buffer} msg 
   * @param {baseFormat} returnValue 
   */
  operation(msg, returnValue) {
    returnValue.errorList = [];
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    arrSpliceBuffer.forEach((buffer, index) => {
      let binaryValue = this.convertChar2Binary(buffer.toString(), 4);
      let operationTable = protocol.operationInfo(index);
      _.each(operationTable, operationObj => {
        let binaryCode = binaryValue.charAt(operationObj.number);

        // 인버터 동작 유무
        if (operationObj.code === 'inverter run') {
          returnValue.isRun = Number(binaryCode);
        } else if (binaryCode === operationObj.errorValue.toString()) {
          returnValue.errorList.push(operationObj);
        }
      });
    });

    // 배열에 에러 데이터가 있다면 현재 에러 검출여부 반영
    returnValue.isError = returnValue.errorList.length ? 1 : 0;

    return returnValue;
  }


  /**
   * 태양 전지 정보 도출
   * @param {string|Buffer} msg 
   * @param {baseFormat} returnValue 
   */
  pv(msg, returnValue) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    returnValue.vol = this.convertBuffer2Char2Dec(arrSpliceBuffer[0]);
    returnValue.amp = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]) / 10;

    return returnValue;
  }

  /**
   * 계통 계측 정보 도출
   * @param {string|Buffer} msg 
   * @param {baseFormat} returnValue 
   */
  grid(msg, returnValue) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);

    returnValue.rsVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[0]); // rs 선간 전압
    returnValue.stVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]); // st 선간 전압
    returnValue.trVol = this.convertBuffer2Char2Dec(arrSpliceBuffer[2]); // tr 선간 전압
    returnValue.rAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 10; // r상 전류
    returnValue.sAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[4]) / 10; // s상 전류
    returnValue.tAmp = this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10; // t상 전류
    returnValue.lf = this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10; // 라인 주파수 Line Frequency; 단위 = Hz

    return returnValue;
  }

  /**
   * 전력량 계측 정보 도출
   * @param {string|Buffer} msg 
   * @param {baseFormat} returnValue 
   */
  power(msg, returnValue) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    let high = this.convertBuffer2Char2Dec(arrSpliceBuffer[1]);
    let low = this.convertBuffer2Char2Dec(arrSpliceBuffer[2]);

    returnValue.gridKw = this.convertBuffer2Char2Dec(arrSpliceBuffer[3]) / 1000; // 출력 전력
    returnValue.dailyKwh = this.convertBuffer2Char2Dec(arrSpliceBuffer[6]) / 10; // 하루 발전량 kWh
    returnValue.cpKwh = (high * 10000 + low) / 1000; // 인버터 누적 발전량 mWh  Cumulative Power Generation
    returnValue.pf = this.convertBuffer2Char2Dec(arrSpliceBuffer[5]) / 10; // 역률 Power Factor %

    return returnValue;
  }

  /**
   * 시스템 정보 도출
   * @param {string|Buffer} msg 
   * @param {baseFormat} returnValue 
   */
  system(msg, returnValue) {
    let arrSpliceBuffer = this.spliceBuffer2ArrayBuffer(msg, 4);
    returnValue.isSingle = arrSpliceBuffer[0].slice(0, 1).toString() === '1' ? 1 : 0; // 단상 or 삼상
    returnValue.capa = Number(arrSpliceBuffer[0].slice(1, 4).toString()) / 10; // 인버터 용량 kW
    returnValue.productYear = '20' + arrSpliceBuffer[1].slice(0, 2).toString() + arrSpliceBuffer[1].slice(2, 4).toString(); // 제작년도 월 일 yyyymmdd,
    returnValue.sn = Number(arrSpliceBuffer[2].toString()); // Serial Number

    return returnValue;
  }

  /**
   * @deprecated 단상에는 사용되지 않음
   */
  weather() {

  }

  getCheckSum(buf) {
    let returnValue = this.getSumBuffer(buf);
    return Buffer.from(this.pad(returnValue.toString(16), 4));
  }

  /**
   * 장치로부터 수신받은 데이터를 처리하는 메소드
   * @param {buffer} buffer 접속반으로 받은 Buffer
   * @return {baseFormat} object -> this.baseFormat 채워서 Return. 데이터가 비는 곳은 null로 반환. throw Error
   */
  _receiveData(buffer) {
    // BU.CLI('_receiveData', buffer)
    // 표준 반환 가이드라인 불러옴
    let returnValue = this.getBaseValue();

    try {
      // startPoint, Start, dialing, Cmd, Addr (Byte Number)
      let bufArray = [
        0, 1, 2, 1, 4
      ];
      // Start, dialing, Cmd, Addr, Data, Ck_Sum, End
      let resBufArray = [];

      // bufArray 에서 정의한 길이만큼의 Buffer를 잘라 Array로 만듬
      let lastIndex = bufArray.reduce((accmulator, currentValue) => {
        resBufArray.push(buffer.slice(accmulator, accmulator + currentValue));
        return accmulator + currentValue;
      });
      // Body 이후에 오는 데이터 DATA
      resBufArray.push(buffer.slice(lastIndex, buffer.length - 5));
      // Body 이후에 오는 데이터 CK_SUM
      resBufArray.push(buffer.slice(buffer.length - 5, buffer.length - 1));
      // Body 이후에 오는 데이터 EOT
      resBufArray.push(buffer.slice(buffer.length - 1));

      // 데이터 무결성 확인
      if (Buffer.compare(resBufArray[0], this.ACK)) {
        throw Error('ACK Error');
      } else if (Buffer.compare(resBufArray[resBufArray.length - 1], this.EOT)) {
        throw Error('EOT Error');
      } else if (Buffer.compare(this.getBufferCheckSum(Buffer.concat(resBufArray.slice(1, 5))), resBufArray[5])) {
        throw Error('CkSum Error');
      }

      // 수신 데이터 번지(string)
      let addr = resBufArray[3].toString();

      // 수신 데이터 번지와 일치하는 protocol 객체를 찾아 해당 Key를 Cmd으로 정의
      let cmd = '';
      let value = '';
      _.find(this.protocolTable, (obj, key) => {
        let bufAddress = this.makeMsg2Buffer(obj.address);
        if (bufAddress.toString() === addr) {
          cmd = key;
          return true;
        }
      });

      // 내릴 명령을 찾지 못했다면 실패 처리
      if (cmd === '') {
        BU.CLI(value);
        return false;
      }
      // 정의된 메소드 실행 resBufArray[4] --> DATA
      returnValue = this[cmd](resBufArray[4], returnValue);
      return returnValue;
    } catch (error) {
      // BU.CLI(error)
      throw Error(error);
    }

  }


}

module.exports = Decoder;