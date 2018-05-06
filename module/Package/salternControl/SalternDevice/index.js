
const Control = require('./src/Control');


module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  const _ = require('lodash');
  const {BU} = require('base-util-jh');

  global.BU = BU;

  const config = require('./src/config');


  const control = new Control(config);

  control.init();


  // orderOperation Test
  setTimeout(() => {
    control.orderOperation({
      hasTrue: true,
      commandId: 'test',
      modelId: 'WD_001'
    });
    
  }, 1000);


  // Direct Test
  const cloneConfig = _.cloneDeep(config);
  cloneConfig.current.deviceInfo.protocol_info.deviceId = '0013A20040F7B4A4';
  cloneConfig.current.deviceInfo.target_id = 'Direct';
  const control_2 = new Control(cloneConfig);
  control_2.init();
  const {operationController} = require('../../../module/device-protocol-converter-jh');
  const cmdStorage = operationController.saltern.xbee;
  let cmdList = control_2.converter.generationCommand(cmdStorage.valve.CLOSE);
  if(cloneConfig.current.deviceInfo.connect_info.type === 'socket'){
    cmdList.forEach(currentItem => {
      currentItem.data = JSON.stringify(currentItem.data);
    });
  }
  setTimeout(() => {
    let cmd_1 = control_2.generationManualCommand({cmdList});
    // BU.CLI(cmd_1.cmdList);
    control_2.executeCommand(cmd_1);
  }, 3000);

  // const {operationController} = require('device-protocol-converter-jh');
  // const {operationController} = require('../../../module/device-protocol-converter-jh');
  // const cmdStorage = operationController.saltern.xbee;


  // const map = require('../config/map');



  // const deviceRouterList = map.setInfo.connectInfoList[0].deviceRouterList;

  // const deviceId = _.nth(deviceRouterList, 0).deviceId;

  // config.current.deviceInfo.protocolConstructorConfig.deviceId = '0013A20040F7B446';
  // config.current.deviceInfo.protocolConstructorConfig.deviceId = '0013A20040F7B4A4';
  // let cmdList = control.converter.generationCommand(cmdStorage.waterDoor.CLOSE);
  
  
  
  // BU.CLI(cmdList);

  // try {
  //   control.executeCommand(control.generationManualCommand({cmdList}));
  // } catch (error) {
    
  // }
  
  // setTimeout(() => {
  //   let cmd_1 = control.generationManualCommand({cmdList});
  //   BU.CLI(cmd_1.cmdList);

    
  //   control.executeCommand(cmd_1);
  // }, 3000);

  
  // BU.CLI(cmdList);

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
}