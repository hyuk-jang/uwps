const EventEmitter = require('events');


class SerialController extends EventEmitter {
  constructor(parents) {
    super();
    this.parents = parents;
  }

  // 시리얼 장치와 연결된 port를 보고자 할 경우
  searchMatchingDevice(deviceInfoList, callback) {
    const SerialChecker = require('./SerialChecker.js');
    const serialChecker = new SerialChecker(deviceInfoList);
    serialChecker.doChecker((possibleSerialDevice) => {
      return callback(possibleSerialDevice);
    });
  }

  // 시리얼 연결
  connSerial(serialInfo) {
    const presentaion = require('./presentation.js');
    if (serialInfo.deviceName == 'vantagePro2') {
      // console.log('VantagePro2')
      let vantagePro2 = new presentaion.VantagePro2(this, serialInfo);
      vantagePro2.connect();
      
    } else if (serialInfo.deviceName == 'infraredRainSensor') {
      // console.log('@@@@@@@ infraredRainSensor')
      let infraredRainSensor = new presentaion.InfraredRainSensor(this, serialInfo);
      infraredRainSensor.connect();
    }
  }
}

module.exports = (parents) => {
  const serialController = new SerialController(parents);

  // 우천 감지 결과
  serialController.on('resData', averRain => {
    // console.log('resRainData', averRain)
    parents.emit('resData', averRain);
  });

  // // Davis VantagePro2 결과
  // serialController.on('resVantagePro2Data', resVantagePro2MeasureData => {
  //   // console.log('resVantagePro2Data', resVantagePro2MeasureData)
  //   parents.emit('resVantagePro2Data', resVantagePro2MeasureData);
  // });
  return serialController;
}