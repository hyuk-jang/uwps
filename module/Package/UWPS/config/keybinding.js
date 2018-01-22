const inverterBaseFormat = require('../InverterController/Converter').baseFormat;
const connectorBaseFormat = require('../ConnectorController/Converter').baseFormat;
module.exports = {
  binding: [{
    deviceType: 'inverter',
    dataTableName: 'inverter_data',
    troubleTableName: 'iverter_trouble_data',
    addParamList: [{
      baseKey: 'inverter_seq',
      updateKey: 'inverter_seq',
    }],
    matchingList: [{
      baseKey: 'amp',
      updateKey: 'in_a',
      calculate: 10,
      toFixed: 0
    }, {
      baseKey: 'vol',
      updateKey: 'in_v',
      calculate: 10,
      toFixed: 0
    }, {
      baseKey: '',
      updateKey: 'in_w',
      calculate: 'amp * vol * 100',
      toFixed: 0
    },{
      baseKey: 'rAmp',
      updateKey: 'out_a',
      calculate: 10,
      toFixed: 0
    },{
      baseKey: 'rsVol',
      updateKey: 'out_w',
      calculate: 10,
      toFixed: 0
    },{
      baseKey: '',
      updateKey: 'out_w',
      calculate: 'rAmp * rsVol * 100',
      toFixed: 0
    },{
      baseKey: 'pf',
      updateKey: 'in_w',
      calculate: '(rAmp * rsVol) / (amp * vol) * 100',
      toFixed: 0
    },{
      baseKey: 'dailyKwh',
      updateKey: 'd_wh',
      calculate: 1000,
      toFixed: 0
    },{
      baseKey: 'cpKwh',
      updateKey: 'c_wh',
      calculate: 1000,
      toFixed: 0
    }]
  }]
};




var test = {
  a: 10,
  b: 20,
  amp: 100,
  vol: 20
};


// var cal = 'a' * 'b';
// var cal = ['a', '*', 'b', '/', 10];
// var cal = ['(', 'a', '+', 'b', ')', '/', 10];
var cal = '(amp*vol)/30+b';

console.time('eval');

let finalMsg = '';
let tempBuffer = '';
var reg = /[a-zA-Z]/;
for(let i = 0; i < cal.length; i += 1){
  let thisChar = cal.charAt(i);
  if(reg.test(thisChar)){
    tempBuffer += thisChar;
  } else {
    if(tempBuffer !== ''){
      finalMsg += `test['${tempBuffer}']`;  
      tempBuffer = '';
    }
    finalMsg += thisChar;
  }
  if(cal.length === i + 1 && tempBuffer !== ''){
    finalMsg += `test['${tempBuffer}']`;  
  }
}

console.log('finalMsg', finalMsg);
let bb = eval(finalMsg);
console.log('what the ', bb);
console.timeEnd('eval');