const _ = require('underscore');
const Promise = require('bluebird');
// const eventToPromise = require('event-to-promise');

const BU = require('base-util-jh').baseUtil;

global._ = _;
global.BU = BU;

process.setMaxListeners(100);

// console.log(uuidv4());
const Builder = require('../src/builder/Builder');

require('../src/format/define');

let config = [];
  
for(let i = 0; i < 1; i += 1){
  /** @type {deviceClientFormat} */
  let addObj = {};
  addObj.target_id = `device_${i}`;
  addObj.connect_type = 'socket';
  // addObj.connect_type = 'serial';
  addObj.host = '';
  addObj.port = Number(`900${i}`);
  // addObj.port = `COM1${3 + i}`;
  addObj.baud_rate = 9600;
  addObj.parser = {
    // type: 'delimiterParser',
    // option: Buffer.from('RAIN') 
    type: 'byteLengthParser',
    option: 55
    // type: 'readLineParser',
    // option: '\r\n'
  };
  config.push(addObj);
}

let builder = new Builder();
let info;
// Test addDeviceClient 
if(false){
  config.forEach(currentItem => {
    BU.CLI(currentItem);
    let commander = builder.addDeviceClient(currentItem);
    let storageInfo;

    Promise.delay(500)
      .then(() => {
        BU.CLI('@@@@@@@@@@@@@@@@@@@@');
        // commander.executeCommand(Buffer.from(''), this);
        info = commander.executeCommand('hi^^', this);
        BU.CLI('resultRequestCmd', info);
        info = commander.executeCommand('Retry Test^^', this);
        BU.CLI('resultRequestCmd', info);
      
        commander.getCommandStatus();
        storageInfo = commander.mediator.getAllCommandStorage();
        BU.CLIN(storageInfo, 5);
      // connet(commander)
      //   .then(() => {
      
      //     // commander.mediator.getDeviceManager(commander).write();
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });
      });
    
  });
}

// Test addDeviceClientGroup
if(true){

  let idList = [];
  for (let index = 0; index < 10; index += 1) {
    idList.push(`id_${index}`);
    
  }

  let commanderList = builder.addDeviceClientGroup(config[0], idList);
  let storageInfo;

  BU.CLIN(commanderList, 2);
  // let resAll = commanderList[0].mediator.getAllCommandStorage();
  // BU.CLIN(resAll, 3);

  Promise.delay(500)
    .then(() => {

      commanderList.forEach(commander => {
        // BU.CLI('@@@@@@@@@@@@@@@@@@@@');
        // commander.executeCommand(Buffer.from(''), this);
        // BU.CLI(commander.id);
        info = commander.executeCommand('hi^^', this);
        // BU.CLI('resultRequestCmd', info);
        // info = commander.executeCommand('Retry Test^^', this);
        // BU.CLI('resultRequestCmd', info);
        
        // commander.getCommandStatus();
      });
      storageInfo = commanderList[0].mediator.getAllCommandStorage();
      BU.CLIN(storageInfo, 5);
      // connet(commander)
      //   .then(() => {
      
      //     // commander.mediator.getDeviceManager(commander).write();
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   });
    });

}


async function connet(commander) {
  await commander.mediator.getDeviceManager(commander).connect();
  BU.CLI('Connected');
  return true;
}





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