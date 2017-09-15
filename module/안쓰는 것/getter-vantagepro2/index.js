// const SerialChecker = require('./SerialChecker.js');
// const SerialDataHandler = require('./SerialDataHandler.js');
// const serialChecker = new SerialChecker([{
//     deviceName: 'vantagePro2', // Device Name
//     port: 'COM3', // Port를 직접 지정하고자 할때 사용
//     baudRate: 19200, // 장치 BaudRate
//     transportCode: '\n', // Serial이 연결되고 특정 Code를 전송해야 할 경우
//     identificationCode: '0a0d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부
//   },
//   {
//     deviceName: 'infraredRainSensor',
//     // port: '',
//     port: 'COM9',
//     baudRate: 9600,
//     transportCode: '',
//     identificationCode: '41494e20253d',
//   }
// // ]);
// const controller = require('./control.js')(this);
const EventEmitter = require('events');

class Main extends EventEmitter {
  constructor(){
    super();
  }
}

const main = new Main();


const serialList = [{
    deviceName: 'vantagePro2', // Device Name
    port: 'COM3', // Port를 직접 지정하고자 할때 사용
    baudRate: 19200, // 장치 BaudRate
    transportCode: '\n', // Serial이 연결되고 특정 Code를 전송해야 할 경우
    identificationCode: '0a0d', // Transport 과정이 끝나고 난뒤 Receive Packet의 특정 Code 포함여부
  },
  {
    deviceName: 'infraredRainSensor',
    // port: '',
    port: 'COM9',
    baudRate: 9600,
    transportCode: '',
    identificationCode: '41494e20253d',
  }
];
const serialController = require('./SerialController')(main);
// console.log(SerialConnector)
// serialController.searchMatchingDevice(serialList, (result) => {
//   console.log('hi', result)
// });

serialList.forEach((serialInfoElement) => {
  serialController.connSerial(serialInfoElement);
})

serialController.on('resRainData', averRain => {
    console.log('최종 결과물 resRainData', averRain)
  });



// SerialConnector.searchMatchingDevice();
// SerialConnector.connSerial();



// let serial = new SerialConnector.control(serialList);

// let serialCheck = new SerialConnector.SerialChecker(serialList);
// serialCheck.doChecker();






// controller.emit('searchMatchingDevice', serialList)
// serialList.forEach(serialInfoElement => controller.emit('connSerial', serialInfoElement))
