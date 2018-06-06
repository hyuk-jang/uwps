const {ipcMain} = require('electron');

const BU = require('base-util-jh').baseUtil;

const Main = require('../controller/Main');

ipcMain.on('navigationMenu', (event, menu, msg) => {
  const main = new Main();
  switch (menu) {
  case 'navi-main':
    BU.CLI('navi-main');
    main.getMain(event, msg);
    break;
  case 'excel-download':
    BU.CLI('excel-download');
    main.makeExcel(event, msg);
    break;
  case 'navi-trend':
    main.getTrend(event, msg);
    break;
  default:
    break;
  }
});

ipcMain.on('powerChart', async (event, msg) => {
  const main = new Main();
  let returnValue = await main.getPowerChart(msg);
  event.sender.send('main-chart', returnValue);
});