const {
  expect
} = require('chai')
const Promise = require('bluebird');
const _ = require('underscore');
const BU = require('base-util-jh').baseUtil;
const bmjh = require('base-model-jh');
const bcjh = require('base-class-jh');


const Control = require('../src/Control.js');

global.BU = BU;

describe('dummy Connector Test', () => {
  let control
  let port = 0;
  before(() => {
    control = new Control();
  })

  it('server listen', done => {
    control.init()
      .then(serverPort => {
        BU.CLI('hasRun', serverPort)
        port = serverPort;
        done();
      })
      .catch(err => {
        BU.CLI(err)
      });
  })


  it('client connect', done => {
    const SmSocketClient = bcjh.SmSocketClient;    
    const smSocketClient = new SmSocketClient(port)
    smSocketClient.connect(port)
    .then(socket => {
      BU.CLI('New Connector Client Connected');
      let msg = BU.makeMessage('test');
      BU.CLI(msg)
      socket.write(msg);
    })
    .catch(err => {
      done(err)
    })

    smSocketClient.on('dataBySocketClient', (err, data) => {
      BU.CLI(err, data)
      done();
    })
  })



  

})