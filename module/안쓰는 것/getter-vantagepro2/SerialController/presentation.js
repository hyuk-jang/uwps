const _ = require('underscore');

const SerialConnector = require('./SerialConnector.js');


exports.InfraredRainSensor = class extends SerialConnector {
  constructor(parents, deivceInfo = {
    port,
    baudRate,
    transportCode,
    identificationCode,
  }, connIntervalSec) {
    super(deivceInfo, connIntervalSec);

    // control 객체
    this.parents = parents;
    // 비의 영역
    this.fineRainBoundary = 300;
    this.heavyRainBoundary = 500;
    this.arrRainStorage = [];
    // 데이터 추출하기 위한 변수
    this.bufferMaxSize = 70;
    this.rainDataSize = 8;
    this.totalBuffer = new Buffer(this.bufferMaxSize);
    this.rainSeparator = 'RAIN %=';
  }

  // 초기에 데이터를 입력해야할 경우에
  init() {
    // console.log('핸들러 init')
  }

  // 데이터 처리 핸들러
  processData(resData) {
    // console.log('### Receive: ', resData.toString())

    let strData = resData.toString();

    // 무조건 Buffer Add
    this.totalBuffer += Buffer.from(resData)

    // 입력된 Buffer를 String 변환
    let strBuffer = this.totalBuffer.toString();

    // Trans Key는 VIS로 자체 판단(프로토콜 정의 문서가 없음)
    if (strBuffer.indexOf('VIS') != -1) {
      // strBuffer에 rainSeparator가 포함되어 있다면 판독 시작
      let rainSeparatorIndex = strBuffer.indexOf(this.rainSeparator);
      if (rainSeparatorIndex != -1) {
        // 의미있는 RainData 길이는 총 8btye
        let substrRainData = strBuffer.substr(rainSeparatorIndex + this.rainSeparator.length, this.rainDataSize);

        // 의미있는 값인지 체크. Buffer 생성시 Garbage 데이터가 들어가므로
        let pattern = /[^{0-9}{A-F}]/;
        let hasAvailData = pattern.test(substrRainData);
        // 데이터가 맞다면 16진수를 10진수로 변환하고 Buffer를 비움
        if (!hasAvailData) {
          let rainData = this.converter().hex2dec(substrRainData);
          // console.log('rainData',rainData)
          //console.log('rainData', rainData)
          this.logicRain(rainData);
          this.totalBuffer = new Buffer(this.bufferMaxSize);
        }
      }
    }
  }

  logicRain(rainData) {
    //console.log('RainData', rainData)
    const boundaryCount = 3;
    let totalData = 0;
    let averRain = 0;
    this.arrRainStorage = this._getArrBoundary(this.arrRainStorage, rainData, boundaryCount);

    // console.log('this.arrRainStorage',this.arrRainStorage)
    if (this.arrRainStorage.length < boundaryCount) {
      // console.log('평균값 아직 안됨.')
      return;
    }



    this.arrRainStorage.forEach((rData, index) => {
      totalData += Number(rData);
    })
    averRain = parseInt(totalData / this.arrRainStorage.length);

    console.log('averRain', averRain)
    this.parents.emit('resData', averRain)
  }

  _getArrBoundary(prevArr, newData, arrLength) {
    let returnvalue = [];

    if (isNaN(newData)) {
      // console.log('new RainData is NaN: ', newData);
      return returnvalue;
    }

    // console.log('newData',newData)
    newData = Array.isArray(newData) ? newData : [newData];
    arrLength = arrLength == null || arrLength == '' ? 1 : arrLength;

    returnvalue = prevArr.concat(newData);

    if (returnvalue.length > arrLength) {
      let spliceIndex = returnvalue.length - arrLength;
      returnvalue.splice(0, spliceIndex);
    }
    return returnvalue;
  }
}


exports.VantagePro2 = class extends SerialConnector {
  constructor(parents, deivceInfo = {
    port,
    baudRate,
    transportCode,
    identificationCode,
  }, connIntervalSec) {
    super(deivceInfo, connIntervalSec);

    // control 객체
    this.parents = parents;

    this.vantagePro2Protocol = require('./vantagePro2Protocol.js');
  }


  // 초기에 데이터를 입력해야할 경우에
  init() {
    // console.log('핸들러 init')
    this.serialManager.write('LOOP\n', (err, results) => {
      if (err)
        console.log('err ' + err);
      //console.log('results ' + results);
    });
    this._GetTheData();
  }

  processData(resData) {
    var bufferData = new Buffer(resData);
    //BU.CLI(bufferData)

    var AddValue = 0;
    if (bufferData.length == 100)
      AddValue = 1;
    else if (bufferData.length == 99)
      AddValue = 0;
    else return;

    _.each(this.vantagePro2Protocol, (Protocol) => {
      //BU.CLI(Protocol)
      let StartPoint = Protocol.Range[0];
      let EndPoint = Protocol.Range[1];
      let RealStartPoint = StartPoint + EndPoint - 1 + AddValue;
      let HexCode = '';
      for (let i = RealStartPoint; i >= StartPoint + AddValue; i--) {
        let TargetValue = bufferData[i].toString(16);
        if (TargetValue == 'ff') {
          TargetValue = '00';
        }

        if (TargetValue.length === 1) {
          HexCode += '0';
        }
        HexCode += TargetValue;
      }
      Protocol.Value = this._ChangeData(Protocol.Name, this.converter().hex2dec(HexCode));
      // console.log(Protocol)
    });

    //console.log(this.vantagePro2Protocol)

    //var test = new Buffer(this.vantagePro2Protocol['LOOP']);
    //console.log(Buffer.byteLength(this.vantagePro2Protocol['LOOP'].toString(), 'utf8') + ' bytes');

    //BU.CLI(this.vantagePro2Protocol)
    //var Barometer = _.findWhere(this.vantagePro2Protocol, { Name : 'Barometer' }).Value;
    var InsideTemperature = _.findWhere(this.vantagePro2Protocol, { Name : 'InsideTemperature' }).Value;
    var InsideHumidity = _.findWhere(this.vantagePro2Protocol, { Name : 'InsideHumidity' }).Value;
    var OutsideTemperature = _.findWhere(this.vantagePro2Protocol, {
      Name: 'OutsideTemperature'
    }).Value;
    var WindSpeed = _.findWhere(this.vantagePro2Protocol, {
      Name: 'WindSpeed'
    }).Value;
    var Min10AvgWindSpeed = _.findWhere(this.vantagePro2Protocol, {
      Name: 'Min10AvgWindSpeed'
    }).Value;
    var WindDirection = _.findWhere(this.vantagePro2Protocol, {
      Name: 'WindDirection'
    }).Value;
    //var ExtraTemperatures = _.findWhere(this.vantagePro2Protocol, { Name : 'ExtraTemperatures' }).Value;
    var RainRate = _.findWhere(this.vantagePro2Protocol, {
      Name: 'RainRate'
    }).Value;
    //var SoilTemperatures = _.findWhere(this.vantagePro2Protocol, { Name : 'SoilTemperatures' }).Value;
    var OutsideHumidity = _.findWhere(this.vantagePro2Protocol, {
      Name: 'OutsideHumidity'
    }).Value;
    var SolarRadiation = _.findWhere(this.vantagePro2Protocol, {
      Name: 'SolarRadiation'
    }).Value;

    var vatangePro2Data = {};
    vatangePro2Data.rainfall = RainRate;
    vatangePro2Data.temperature =  OutsideTemperature > -20 && OutsideTemperature < 50 ? OutsideTemperature : InsideTemperature;
    vatangePro2Data.humidity = OutsideHumidity > 0 && OutsideHumidity <= 100 ? OutsideHumidity : InsideHumidity;
    vatangePro2Data.windDirection = WindDirection;
    vatangePro2Data.windSpeed = WindSpeed;
    vatangePro2Data.min10AvgWindSpeed = Min10AvgWindSpeed;
    vatangePro2Data.solarRadiation = SolarRadiation;

    //console.log(vatangePro2Data);
    //self.main.WeatherDeviceServer.emit('UpdateData', WeatherDeviceData);
    //console.log('vatangePro2Data', vatangePro2Data.temperature)
    this.parents.emit('resData', vatangePro2Data);
    //console.log(Buffer.byteLength(JSON.stringify(self.main.WeatherDeviceData), 'utf8') + ' bytes');
  }


  _ChangeData(DataName, DataValue) {
        // console.log('ChangeData : ' + DataName, DataValue)
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


  _GetTheData() {
    setTimeout(() => {
      this.serialManager.write('LOOP\n', (err, results) => {
        if (err)
          console.log('err ' + err);
      });
      this._GetTheData(this.serialManager);
    }, 1000 * 60);
  }
}