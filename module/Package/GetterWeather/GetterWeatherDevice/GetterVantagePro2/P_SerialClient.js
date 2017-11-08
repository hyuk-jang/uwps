const SerialClient = require('base-class-jh').SerialClient;
const BU = require('base-util-jh').baseUtil;

class P_SerialClient extends SerialClient {
  constructor(controller) {
    super(controller.config.deviceInfo);

    // control 객체
    this.controller = controller;
    // 데이터 추출하기 위한 변수

    this.transCode = controller.config.deviceInfo.transportCode;
    this.vantagePro2Protocol = require('./vantagePro2Protocol.js');

    this.serialClient = {};
  }

  init() {
    this._requestData();

    setTimeout(() => {
      this._requestData()
    }, 1000 * 60);
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
    let bufferData = Buffer.from(resData);
    BU.CLI(bufferData)

    let addValue = 0;
    if (bufferData.length == 100) {
      addValue = 1;
    } else if (bufferData.length == 99) {
      addValue = 0;
    } else {
      return;
    }

    this.vantagePro2Protocol.forEach(protocol => {
      let startPoint = protocol.substr[0];
      let endPoint = protocol.substr[1];
      let realStartPoint = startPoint + endPoint - 1 + addValue;
      let hexCode = '';
      for (let i = realStartPoint; i >= startPoint + addValue; i--) {
        let TargetValue = bufferData[i].toString(16);
        if (TargetValue == 'ff') {
          TargetValue = '00';
        }

        if (TargetValue.length === 1) {
          hexCode += '0';
        }
        hexCode += TargetValue;
      }
      protocol.value = this._ChangeData(protocol.key, BU.Converter.hex2dec(hexCode));
    });

    let vantagePro2Data = {};
    this.vantagePro2Protocol.forEach((protocol) => {
      let result = this.getProtocolValue(protocol.key);
      vantagePro2Data[result.key] = result.value;
    })

    return this.emit('receiveData', null, vantagePro2Data);
  }


  getProtocolValue(findKey) {
    let findObj = this.vantagePro2Protocol.find((obj) => {
      return obj.key === findKey;
    });

    if (findObj === undefined || findObj == null) {
      findObj.value = '';
    } else {
      findObj.value;
    }
    return findObj;
  }

  _ChangeData(DataName, DataValue) {
    //console.log('ChangeData : ' + DataName, DataValue)
    let returnvalue = DataValue;

    switch (DataName) {
      case 'Barometer':
        return (returnvalue / 1000 * 33.863882).toFixed(1);
      case 'InsideTemperature':
        return ((returnvalue / 10 - 32) / 1.8).toFixed(1);
      case 'InsideHumidity':
        return returnvalue;
      case 'OutsideTemperature':
        return ((returnvalue / 10 - 32) / 1.8).toFixed(1);
      case 'WindSpeed':
        //console.log('base WindSpeed',returnvalue)
        return Math.floor((returnvalue * 0.45) * 10) / 10;
      case 'Min10AvgWindSpeed':
        return Math.floor((returnvalue * 0.45) * 10) / 10;
      case 'WindDirection':
        //console.log('WindDirection', DataValue)
        let res = (DataValue / 45).toFixed(0);
        if (res >= 8 || res < 0)
          res = 0;
        return res;
      case 'ExtraTemperatures':
        return returnvalue;
      case 'SoilTemperatures':
        return returnvalue;
      case 'LeafTemperatures':
        return returnvalue;
      case 'OutsideHumidity':
        return returnvalue;
      case 'ExtraHumidties':
        return returnvalue;
      case 'RainRate':
        return (returnvalue * 0.2).toFixed(1);
      case 'UV':
        return returnvalue;
      case 'SolarRadiation':
        return returnvalue;
      case 'StormRain':
        return returnvalue;
      default:
        return returnvalue;
    }


  }

  _requestData() {
    this.serialClient.write(this.transCode, (err, results) => {
      if (err)
        console.log('err ' + err);
    });
  }
}

module.exports = P_SerialClient;