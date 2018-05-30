

const {app, BrowserWindow} = require('electron');

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 300,
    icon: __dirname + '/icons/icon.ico'
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
