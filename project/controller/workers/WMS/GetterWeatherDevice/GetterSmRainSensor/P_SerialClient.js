const SerialClient = require('base-class-jh').SerialClient;
const BU = require('base-util-jh').baseUtil;

class P_SerialClient extends SerialClient {
  constructor(controller) {
    super(controller.config.deviceInfo);

    // control 객체
    this.controller = controller;
    // 데이터 추출하기 위한 변수

    this.rainDataSize = 8;
    this.totalBuffer = null;
    this.rainSeparator = 'RAIN %=';
  }

  async connect() {
    this.serialClient = await super.connect();
    this.serialClient.on('close', error => {
      this.serialClient = {};
      this.emit('disconnectedDevice')
    });
    this.serialClient.on('error', error => {
      this.serialClient = {};
      this.emit('disconnectedDevice')
    });

    return this.serialClient;
  }

  // 데이터 처리 핸들러
  processData(resData) {
    // console.log('### Receive: ', resData.toString())
    this.totalBuffer = this.totalBuffer === null ? resData : Buffer.concat([this.totalBuffer, resData]);

    // 입력된 Buffer를 String 변환
    let strBuffer = this.totalBuffer.toString();

    // Trans Key는 VIS로 자체 판단(프로토콜 정의 문서가 없음)
    if (strBuffer.indexOf('VIS') != -1) {
      // strBuffer에 rainSeparator가 포함되어 있다면 판독 시작
      let rainSeparatorIndex = strBuffer.indexOf(this.rainSeparator);
      if (rainSeparatorIndex != -1) {
        // 의미있는 RainData 길이는 총 8btye
        let substrRainData = strBuffer.substr(rainSeparatorIndex + this.rainSeparator.length, this.rainDataSize);
        // console.log('substrRainData', substrRainData)

        // 8자리 버퍼가 들어온다면
        if (substrRainData.length === 8) {
          // console.log('진짜 데이터', substrRainData)
          // 의미있는 값인지 체크. Buffer 생성시 Garbage 데이터가 들어가므로
          let pattern = /[^{0-9}{A-F}]/;
          let hasAvailData = pattern.test(substrRainData);

          // 데이터가 맞다면 16진수를 10진수로 변환하고 Buffer를 비움
          if (!hasAvailData) {
            let rainData = BU.Converter.hex2dec(substrRainData);
            // console.log('rainData', rainData)
            this.totalBuffer = null;

            return this.emit('receiveData', null, rainData);
          }
        }
      }
    }
  }
}

module.exports = P_SerialClient;