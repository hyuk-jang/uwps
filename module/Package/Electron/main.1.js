const electron = require('electron');
// Module to control application life.
const app = electron.app;

const Navigation = require('./src/Navigation');
const naviation = new Navigation();



const {ipcMain} = require('electron');
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.sender.send('asynchronous-reply', 'pong');
});

ipcMain.on('synchronous-message', (event, arg) => {
  console.log(arg); // prints "ping"
  event.returnValue = 'pong';
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// /** @type {BrowserWindow} */
// let mainWindow;

// ipcMain.on('connect-device', (event, port) => {
//   // TEST
//   const config = require('./src/config');
//   const Control = require('./src/Control');

//   // config.current.deviceInfo.connect_info.port = port;

//   // const control = new Control(config, naviation.mainWindow);
//   // control.init();
// });

ipcMain.on('navigationMenu', (event, msg) => {
  naviation.createWindow(msg);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.on('ready', () => {
  naviation.createWindow();
});

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
  if (naviation.mainWindow === null) {
    naviation.createWindow();
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


// let win = null;
  
// app.on('ready', () => {
// win = new BrowserWindow({width: 800, height: 600});
// win.loadURL(`file://${__dirname}/index.html`);
// win. webContents.on('did-finish-load', () => {
//   win.webContents.send('ping', 'whoooooooh!');
// });

// });

