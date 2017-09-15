var serialport = require('serialport');

class SerialConnector {
  constructor(deivceInfo = {
    port,
    baudRate,
    transportCode,
    identificationCode
  }, connIntervalSec) {

    this.serialInfo = deivceInfo;
    this.reconnectIntervalTime = (connIntervalSec || 10) * 1000;
  }

  init() {

  }

  processData() {

  }

  connect() {
    this.serialManager = new serialport(this.serialInfo.port, {
      baudrate: this.serialInfo.baudRate
    });
    this.serialManager.on('open', (error) => {
      if (error) {
        console.log('failed to open: ' + error);
      } else {
        // console.log('open');
        this.init();
      }
    });

    this.serialManager.on('data', (data) => {
      this.processData(data);
    })

    this.serialManager.on('close', err => {
      console.log('시리얼 Close');
      self.SerialClient = null;
      serialPort.close(err => {
        console.log('port closed', err);
      });
      setTimeout(() => {
        console.log('장치 :' + this.serialInfo.deviceName + ' 연결을 재시도 합니다.' + this.serialInfo.port);
        self.emit('open');
        //ConnectToSerialDevice(this.serialInfo.port, BaudRate);
      }, 1000 * this.reconnectIntervalTime);
    });

    this.serialManager.on('error', err => {
      console.log('/Error Occur : ' + this.serialInfo.deviceName + ' \nErr: ' + err);
      setTimeout(() => {
        console.log('장치 :' + this.serialInfo.deviceName + ' 연결을 재시도 합니다.' + this.serialInfo.port);
        self.emit('open');
        //ConnectToSerialDevice(this.serialInfo.port, BaudRate);
      }, 1000 * this.reconnectIntervalTime);

    });
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
module.exports = SerialConnector;