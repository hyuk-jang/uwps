const Control = require('./Control.js');
const config = require("./config.js");
const BU = require('base-util-jh').baseUtil;
global.BU = BU;

let control = new Control(config);


// let cnt = 0;

// function interval() {
//   if (cnt < 500) {
//     setTimeout(() => {
//       interval();
//       let res = control.model.onSmRainData(cnt += 10);
//       BU.CLI(res)
//     }, 10)
//   }

// }
// interval();

// return;
// BU.CLI(control)
control.init()
  .then(r => {
    BU.CLI('init 성공')
  })
  .catch(err => {
    BU.CLI(err);
  });
  

control.p_SerialClient.on('receiveData', (err, rainData) => {
  BU.CLI('rainData', rainData)
});


// TEST
// searchMatchingDevice();

// [ M -> C ] 장치로부터 데이터가 들어올 경우 
control.on('updateSmRainSensor', (err, updateData) => {
  BU.CLI('updateSmRainSensor', updateData)

  // control._onSmRainSensorData_P(1000);

  // TEST: 단계별 GCM 발송 유무 체크
  // if(config.current.rainAlarmBoundaryList.length >= updateData.currRainLevel){
  //   for(let count = 0 ; count < config.current.calculateOption.averageCount; count += 1) {
  //     control._onSmRainSensorData_P(config.current.rainAlarmBoundaryList[updateData.currRainLevel].boundary); 
  //   }
  // }
})

// // rain 기초값 관련 테스트
// setTimeout(function() {
//   let rain = control.getRainData();
//   BU.CLI(rain)
//   let rainLevel = control.getCurrentRainLevel();
//   BU.CLI(rainLevel)
// }, 1000);

// setTimeout(function () {
//   control._onSmRainSensorData_P(2000);
// }, 1000 * 30);