const Control = require('./Control.js');
const config = require("./config.js");
const BU = require("./baseUtil.js");
global.BU = BU;

const SerialChecker = require('./SerialChecker.js');

let control = new Control(config);

// BU.CLI(control)
control.init();

// [ M -> C ] Davis VantagePro2 결과
control.on('updateVantagePro2', updateData => {
  // Update 처리된 Model을 Get 하여 부모에게 반환
  BU.CLI('updateVantagePro2', updateData)
  // getCurrData();
});


// TEST: 현재 값 잘 얻어 오는지
function getCurrData() {
  let currOriginalData = control.model.currConvertDataObj;
  BU.CLI(currOriginalData)
  let currData = control.model.originalData;
  BU.CLI(currData)
  let getCalcAverageObj = control.getCalcAverageObj();
  BU.CLI(getCalcAverageObj);
}

// TEST: 풍속 랜덤 값 넣어서 데이터 변화 감지하는지 테스트
function testCalc() {
  setTimeout(function () {
    control.model.currOriginalData.WindSpeed = Math.random() * 10;
    control._onVantagePro2Data_P(control.model.currOriginalData);
  }, 1000 * 10);
}

// TEST: 시리얼 장치와 연결된 port를 보고자 할 경우
function searchMatchingDevice() {
  const serialChecker = new SerialChecker(config.deviceInfo);
  serialChecker.doChecker((possibleSerialDevice) => {
    console.log(possibleSerialDevice);
  });
}