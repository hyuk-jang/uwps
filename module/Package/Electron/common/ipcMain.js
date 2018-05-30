const {ipcMain} = require('electron');

const Main = require('../controller/Main');

ipcMain.on('navigationMenu', (event, menu, msg) => {
  const main = new Main();
  switch (menu) {
  case 'navi-main':
    main.getMain(event);
    break;
  case 'navi-trend':
    main.getTrend(event, msg);
    break;
  default:
    break;
  }
});