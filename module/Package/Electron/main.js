const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

require('./common/ipcMain');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1770, height: 1000, 
    // alwaysOnTop: true,
    // fullscreen: true,
    x: 2120,
    y: 0,
    // webPreferences: {
    //   nodeIntegration: false,
    //   // preload: './preload.js'
    // }
  });

  mainWindow.webContents.openDevTools();

  // and load the index.html of the app.
  mainWindow.loadFile('view/index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// ESLint는 어느 eval() 사용에 경고문을 띄웁니다. 심지어 이것도요.
// eslint-disable-next-line
global.eval = function () {
  throw new Error('이 앱은 window.eval()을 지원하지 않습니다.');
};







// //  원격 콘텐츠에서 세션 권한 요청 처리
// const { session } = require('electron');
  
// session
//   .fromPartition('some-partition')
//   .setPermissionRequestHandler((webContents, permission, callback) => {
//     const url = webContents.getURL();
  
//     if (permission === 'notifications') {
//       // Approves the permissions request
//       callback(true);
//     }
  
//     if (!url.startsWith('https://my-website.com')) {
//       // Denies the permissions request
//       return callback(false);
//     }
//   });




process.on('uncaughtException', function (err) {
  // BU.debugConsole();
  console.error(err.stack);
  console.log(err.message);
  console.log('Node NOT Exiting...');
});


process.on('unhandledRejection', function (err) {
  // BU.debugConsole();
  console.error(err.stack);
  console.log(err.message);
  console.log('Node NOT Exiting...');
});