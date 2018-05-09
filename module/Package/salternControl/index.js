
const Control = require('./src/Control');


module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  const { BU } = require('base-util-jh');

  global.BU = BU;

  const config = require('./src/config');


  const map = require('./config/map');

  const _ = require('lodash');

  // const net = require('net');
  // const server = net.createServer((socket) => {
  //   // socket.end('goodbye\n');
  //   let port = Number(`900${i}`);
  //   console.log(`client is Connected ${port}`);

  //   // socket.write('18?');

  //   socket.on('data', data => {
  //     BU.CLI(data);
      
  //     return socket.write('this.is.my.socket\r\ngogogogo' + port);
  //   });

  // }).on('error', (err) => {
  //   // handle errors here
  //   console.error('@@@@', err, server.address());
  //   // throw err;
  // });

  // // grab an arbitrary unused port.
  // server.listen(9005, () => {
  //   console.log('opened server on', server.address());
  // });

  // server.on('close', () => {
  //   console.log('clonse');
  // });

  // server.on('error', (err) => {
  //   console.error(err);
  // });



  const control = new Control(config);

  control.init();

  // BU.CLIN(control);

  // BU.CLIN(control.routerList, 2);

  // control.findModel('WD_007');
  // let cmdInfo = _.find(map.controlList, {cmdName: '증발지 1A → 해주 1'});
  // let cmdInfo = _.find(map.controlList, {cmdName: '증발지 3 → 증발지 4'});  
  // let cmdInfo = _.find(map.controlList, {cmdName: '저수조 → 증발지 1'});  
  let cmdInfo = _.find(map.controlList, {cmdName: '저수조 → 증발지 1A'});

  // BU.CLI(cmdInfo);

  setTimeout(() => {

    // control.scenarioMode_1();


    control.excuteSingleControl({modelId: 'WD_015', hasTrue: false});


    // control.excuteAutomaticControl(cmdInfo);
    // control.cancelAutomaticControl(cmdInfo);
    
  }, 1000);





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