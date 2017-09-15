const serialport = require('serialport');
const _ = require('underscore')

/// 
/**
 * description Serial 연결을 하고자 하는 장비의 Port를 자동으로 찾아줌. 식별코드에 의한 request response 여하에 따라서.
 * ex : [{
    "deviceName": "vantagePro2", // Device Name
    "port": "", // Port를 직접 지정하고자 할때 사용
    "baudRate": 19200, // 장치 BaudRate
    "transportCode": "\n", // Serial이 연결되고 특정 Code를 전송해야 할 경우
    "identificationCode": "0a0d", // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부
  },
  {
    "deviceName": "infraredRainSensor",
    "port": "",
    "baudRate": 9600,
    "transportCode": "",
    "identificationCode": "41494e20253d",
  }
]
 */
class SerialChecker {
  constructor(checkDeviceList = [{
    port,
    baudRate,
    transportCode,
    identificationCode,
    
  }]) {
    //  열려있는 포트
    this.opendSerialPortList = [];
    // 연결 Check 성공 장치
    this.connectedDeviceList = [];
    // 유효성 검증 대기 장치
    this.waitedDeviceList = [];
    // 유효성 검증 진행 장치
    this.tryConnectedDeviceList = [];

    this.finalCallback = null;

    // 연결 시도할 장치들의 정보를 분배
    checkDeviceList.forEach((deviceInfo) => {
      if (deviceInfo.port == '')
        this.waitedDeviceList.push(deviceInfo);
      else {
        deviceInfo.hasError = false;
        this.connectedDeviceList.push(deviceInfo);
      }
    });
  }

  doChecker(callback) {
    this.finalCallback = callback || function (result) {console.log(result)} ;
    this._getOpendSerialList(() => {
      this._retroAvailabilityDevice();
    })
  }

  _getOpendSerialList(callback) {
    serialport.list((err, ports) => {
      ports.forEach((port) => {
        if (port.comName != 'COM1')
          this.opendSerialPortList.push(port.comName);
      });
      return callback();
    })
  }

  _retroAvailabilityDevice(callback) {
    if (this.waitedDeviceList.length === 0) {
      // console.log('Complete Scanning ', this.connectedDeviceList)
      return this.finalCallback(this.connectedDeviceList);
    } else {
      this._settingDevicePort(this.waitedDeviceList[0]);
    }
  }

  // 수정된 장치 정보 저장, 기존 Serial 연결 해제, 장치 유효성 체크함수 호출
  _clearTryConnectedDeviceList(isSuccess, deviceInfo) {
    this.connectedDeviceList.push(deviceInfo);
    this.waitedDeviceList.shift();

    this.tryConnectedDeviceList.forEach((tryConnectedDevice) => tryConnectedDevice.close())
    this.tryConnectedDeviceList = [];

    // 열려있는 Serial Port 닫을 시간 줌(2초), Close 이벤트 콜백처리 알고리즘 도입시 Timer 불 필요.
    setTimeout(() => {
      this._retroAvailabilityDevice()
    }, 1000 * 2);
  }

  // 장치와 Serial이 연결되는지 체크. 확인되면 Setting Info 반영 후 해당 장비, Serial Port 제거
  _settingDevicePort(deviceInfo) {
    // console.log('@@@@@@@@@@ _settingDevicePort', deviceInfo)
    this.checkTimer = setTimeout(() => {
      console.log('checkTimer 유효성 검증 실패')

      deviceInfo.port = '';
      deviceInfo.hasError = true;

      this._clearTryConnectedDeviceList(false, deviceInfo);
    }, 1000 * 10);

    this.opendSerialPortList.forEach((portSerial) => {
      const isDeviceAvail = false;
      const serialPort = new serialport(portSerial, {
        baudrate: deviceInfo.baudRate
      });

      // 진행중인 시리얼 리스트에 입력
      this.tryConnectedDeviceList.push(serialPort);

      // 시리얼 접속 결과가 참이라면
      var self = this;

      function findSuccessSerial() {
        clearTimeout(self.checkTimer);
        deviceInfo.port = portSerial;
        deviceInfo.hasError = false;

        self.opendSerialPortList = _.reject(self.opendSerialPortList, sPort => sPort === portSerial)

        // 최초 Serial 연결이 바로 성공할 경우
        setTimeout(() => {
          self._clearTryConnectedDeviceList(true, deviceInfo);
        }, 1000 * 2);
      }

      serialPort.on('open', (error) => {
        if (error) {
          console.log('failed to open: ' + error);
        } else {
          console.log('Port Open', portSerial);
          serialPort.on('data', (data) => {

            var encodingData = Buffer.from(data).toString('hex');

            if (deviceInfo.identificationCode != '') {
              if (typeof encodingData !== 'string') {
                //console.log('encodingData String 아님')
                return;
              }

              if (encodingData.indexOf(deviceInfo.identificationCode) != -1) {
                //console.log('데이터가 존재하네');
                //console.log('deviceInfo.port', portSerial, deviceInfo.deviceName)

                findSuccessSerial();
              }


            }
          });

          // TransCode가 존재하면 전송
          if (deviceInfo.transportCode != '') {
            var transCode = deviceInfo.transportCode;
            //transCode = '\n';
            console.log('전송 코드', transCode)
            serialPort.write(transCode, (err, results) => {
              if (err)
                console.log('err ' + err);
            });
          }
        }
      });

      serialPort.on('close', function (err) {
        console.log('시리얼 Close');
        console.log('deviceInfo.port', portSerial, deviceInfo.deviceName)
      });

      serialPort.on('error', function (err) {
        console.log('/Error', 'Connect Error Occur.' + err);
        console.log('deviceInfo.port', portSerial, deviceInfo.deviceName)
      });
    })


  }
}

module.exports = SerialChecker;