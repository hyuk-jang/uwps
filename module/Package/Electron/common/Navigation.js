
const electron = require('electron');
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');

class Navigation {
  constructor(params) {
    /** @type {BrowserWindow} */
    this.mainWindow;
  }

  /**
   * 
   * @param {BrowserWindow} mainWindow 
   */
  setMainWindow(mainWindow) {
    this.mainWindow = mainWindow;
    
  }

  /**
   * 
   * @param {string} addr 
   */
  navigation(addr) {
    let data;
    switch (addr) {
    case 'navi-main':
      data = require('../controller/main');
      break;
    
    default:
      break;
    }
    this.createWindow(addr);

    // this.mainWindow.webContents.send('test', data);
  }

  createWindow(urlName) {
    urlName = urlName ? urlName : 'index';

    if(this.mainWindow){
      this.mainWindow;
    }
    
    this.mainWindow = new BrowserWindow({
      width: 1770, height: 1000, 
      // alwaysOnTop: true,
      x: 1920,
      y: 0,
      // fullscreen: true
  
      // webPreferences: {
      //   nodeIntegration: false,
      //   // preload: './preload.js'
      // }
    });
    // and load the index.html of the app.
    // this.mainWindow.loadFile(path.join(__dirname, `/view/${urlName}.html`));
    this.mainWindow.loadFile(`view/${urlName}.html`);
    this.mainWindow.webContents.openDevTools();
    
    // Emitted when the window is closed.
    this.mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
      this.mainWindow = null;
    });
  }

}

module.exports = Navigation;