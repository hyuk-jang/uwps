const {ipcMain} = require('electron');

const BU = require('base-util-jh').baseUtil;

const Main = require('../controller/Main');

const Promise = require('bluebird');

ipcMain.on('navigationMenu', (event, menu, msg) => {
  console.log('???????????', menu); // prints "ping"
  const main = new Main();
  switch (menu) {
  case 'navi-main':
    console.log('?????');
    main.getMain(event);
    break;
  case 'navi-trend':
    console.log('###');
    BU.CLI(msg);
    main.getTrend(event, msg);
    break;
  
  default:
    break;
  }

});
// event.sender.send('asynchronous-reply', 'pong');