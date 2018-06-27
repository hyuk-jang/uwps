
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


  // // orderOperation Test
  // setTimeout(() => {
  //   control.orderOperation({
  //     hasTrue: true,
  //     commandId: 'test',
  //     modelId: 'WD_001'
  //   });
    
  // }, 1000);


  // Direct Test
  const cloneConfig = _.cloneDeep(config);
  cloneConfig.current.deviceInfo.protocol_info.deviceId = '0013A20040F7B4AD';
  cloneConfig.current.deviceInfo.target_id = 'Direct';
  const control_2 = new Control(cloneConfig);
  control_2.init();
  const {BaseModel} = require('../../../module/device-protocol-converter-jh');

  const baseModel = new BaseModel.Saltern(config.current.deviceInfo.protocol_info);

  BU.CLI(baseModel.device.VALVE.COMMAND.CLOSE);
  let cmdList = control_2.converter.generationCommand(baseModel.device.VALVE.COMMAND.STATUS);
  BU.CLI(cmdList);
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