

const {app, BrowserWindow} = require('electron');

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 300
  });
  
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
  
  }));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  app.quit();
});



// TEST
const config = require('./src/config');
const Control = require('./src/Control');

const control = new Control(config);

control.init();



// const { BU } = require('../../module/base-util-jh');
// const Inverter = require('../InverterMonitoring/Inverter');
// // const config = require('../InverterMonitoring/Inverter/src/config');
// const config = require('./config');
// const control = new Inverter(config);




// const deviceList = [{
//   deviceId: '001',
//   mainCategory: 'inverter',
//   subCategory: 'das_1.3',
//   option: true
// }, {
//   deviceId: '002',
//   mainCategory: 'inverter',
//   subCategory: 'das_1.3',
//   option: false
// }, {
//   deviceId: '002',
//   mainCategory: 'inverter',
//   subCategory: 'das_1.3',
//   option: true
// }];
// control.attachDevice(deviceList);

// const _ = require('lodash');

// control.init();


// const net = require('net');

// let client = net.createConnection(config.current.deviceInfo.connect_info.port);

// client.on('data', data => {
//   BU.CLIO(data.toString());
// });


// // Sytem
// setTimeout(() => {
//   client.write('^P001MOD');
// }, 100);

// let cmdInfo = _.find(map.controlList, {cmdName: '저수조 → 증발지 1A'});
// BU.CLI(cmdInfo);
// setTimeout(() => {
//   control.scenarioMode_1();


//   // control.excuteSingleControl({modelId: 'WD_015', hasTrue: false});


//   // control.excuteAutomaticControl(cmdInfo);
//   // control.cancelAutomaticControl(cmdInfo);
    
// }, 1000);