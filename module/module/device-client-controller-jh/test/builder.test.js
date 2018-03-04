const {
  expect
} = require('chai');
const _ = require('underscore');
// const Promise = require('bluebird');
// const eventToPromise = require('event-to-promise');

const BU = require('base-util-jh').baseUtil;

global._ = _;
global.BU = BU;


// console.log(uuidv4());
const ClientBuilder = require('../src/builder/ClientBuilder');

require('../src/format/define');

describe('Builder Test', () => {
  it('create Test ', done => {
    let config = [];

    for(let i = 0; i < 5; i += 1){
      /** @type {deviceClientFormat} */
      let addObj = {};
      addObj.target_id = `device_${i}`;
      addObj.connect_type = 'socket';
      addObj.host = '';
      addObj.port = Number(`900${_.random(0,2)}`);
      config.push(addObj);
    }

    let builder = new ClientBuilder();

    config.forEach(currentItem => {
      let result = builder.addDeviceClient(currentItem);

      let findTest = result.mediator.getDeviceManager(result);
      console.dir(findTest);

      
      
      // BU.CLI(result);
      // result.connect()
      //   .then(result => {
      //     console.log('connenct');
      //   })
      //   .catch(err => {
      //     console.error(err);
      //   });
    });
    



    done();
  });


});