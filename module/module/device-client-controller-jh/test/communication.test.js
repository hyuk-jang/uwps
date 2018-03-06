const _ = require('underscore');
// const Promise = require('bluebird');
// const eventToPromise = require('event-to-promise');

const BU = require('base-util-jh').baseUtil;

global._ = _;
global.BU = BU;


// console.log(uuidv4());
const ClientBuilder = require('../src/builder/ClientBuilder');

require('../src/format/define');

let config = [];
  
for(let i = 0; i < 1; i += 1){
  /** @type {deviceClientFormat} */
  let addObj = {};
  addObj.target_id = `device_${i}`;
  // addObj.connect_type = 'socket';
  addObj.connect_type = 'serial';
  addObj.host = '';
  addObj.port = Number(`900${_.random(0,2)}`);
  addObj.port = `COM1${3 + i}`;
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

let builder = new ClientBuilder();

config.forEach(currentItem => {
  BU.CLI(currentItem);
  let commander = builder.addDeviceClient(currentItem);
  
  connet(commander)
    .then(() => {
      BU.CLI('@@@@@@@@@@@@@@@@@@@@');
      commander.executeCommand(Buffer.from(''), this);
      // commander.executeCommand('hi^^', this);
      // commander.executeCommand('Retry Test^^', this);
  
      // commander.mediator.getDeviceManager(commander).write();
    })
    .catch((err) => {
      console.error(err);
    });
});

async function connet(commander) {
  await commander.mediator.getDeviceManager(commander).connect();
  BU.CLI('Connected');
  return true;
}