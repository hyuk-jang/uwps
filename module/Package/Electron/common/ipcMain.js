const {ipcMain} = require('electron');

const BU = require('base-util-jh').baseUtil;

const Main = require('../controller/Main');
const main = new Main();

ipcMain.on('navigationMenu', (event, menu, msg) => {
  switch (menu) {
  case 'navi-main':
    BU.CLI('navi-main');
    // main.makeExcel(event, msg);
    main.getMain(event, msg);
    break;
  case 'navi-trend':
    main.getTrend(event, msg);
    break;
  default:
    break;
  }
});

ipcMain.on('powerChart', async (event, msg) => {
  let returnValue = await main.getPowerChart(msg);
  event.sender.send('main-chart', returnValue);
});

ipcMain.on('makeExcel', async (event, msg) => {
  main.makeExcel(event, msg);
  // let returnValue = await main.getPowerChart(msg);
  // event.sender.send('main-chart', returnValue);
});