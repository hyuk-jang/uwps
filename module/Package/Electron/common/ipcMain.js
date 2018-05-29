const {ipcMain} = require('electron');

const BU = require('base-util-jh').baseUtil;

const Main = require('../controller/Main');

const Promise = require('bluebird');

ipcMain.on('navigationMenu', (event, menu) => {
  console.log(menu); // prints "ping"
  const main = new Main();
  switch (menu) {
  case 'main':
    main.getMain(event);
    break;
  
  default:
    break;
  }

});
// event.sender.send('asynchronous-reply', 'pong');