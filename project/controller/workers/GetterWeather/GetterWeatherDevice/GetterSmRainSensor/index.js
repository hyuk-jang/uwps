const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;

const SerialChecker = require('./SerialChecker.js');


let control = new Control(config);

BU.CLI(control)
control.init();


// [ M -> C ] 장치로부터 데이터가 들어올 경우 
control.on('updateSmRainSensor', (updateData) => {
  BU.CLI('updateSmRainSensor', updateData)

  // control._onSmRainSensorData_P(1000);

  // TEST: 단계별 GCM 발송 유무 체크
  // if(config.current.rainAlarmBoundaryList.length >= updateData.currRainLevel){
  //   for(let count = 0 ; count < config.current.calculateOption.averageCount; count += 1) {
  //     control._onSmRainSensorData_P(config.current.rainAlarmBoundaryList[updateData.currRainLevel].boundary); 
  //   }
  // }
})

// rain 기초값 관련 테스트
setTimeout(function() {
  let rain = control.getRainData();
  BU.CLI(rain)
  let rainLevel = control.getCurrentRainLevel();
  BU.CLI(rainLevel)
}, 1000);

// setTimeout(function () {
//   control._onSmRainSensorData_P(2000);
// }, 1000 * 30);



// TEST: 시리얼 장치와 연결된 port를 보고자 할 경우
function searchMatchingDevice() {
  const serialChecker = new SerialChecker(config.deviceInfo);
  serialChecker.doChecker((possibleSerialDevice) => {
    console.log(possibleSerialDevice);
  });
}