// const EventEmitter = require('events');

// class Main extends EventEmitter {
//   constructor() {
//     super();
//   }
// }

// const main = new Main();
const locationInfo = {
  x: 50,
  y: 75
};
// // const getterWeatherCastController = require('./GetterWeatherCastController')(main);

const GetterWeatherCastController = require('./GetterWeatherCastController');

const getterWeatherCastController = new GetterWeatherCastController(locationInfo);

function firstStep() {
  return new Promise((resolve, reject) => {
    getterWeatherCastController.TestRequestWeatherCastForFile((err, result) => {
      if (err) {
        return reject();
      } else {
        
        console.log('1개, 날씨 추출 완료',result)
        return resolve(result);
      }
    });
  })
}

function secondStep() {
  return new Promise((resolve, reject) => {
    getterWeatherCastController.prevWeatherCastData((err, result) => {
      if (err) {
        return reject();
      } else {
        console.log('데이터 비교')
        return resolve(result);
      }
    });
  })
}



firstStep()
  .then(secondStep, err => {
    console.log('first step error occured', err)
  })
  .then((result) => {
    
  });




// console.log(SerialConnector)
// serialController.searchMatchingDevice(serialList, (result) => {
//   console.log('hi', result)
// });