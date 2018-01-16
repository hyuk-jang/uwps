'use strict';

const Control = require('./src/Control.js');
module.exports = Control;


// if __main process
if (require !== undefined && require.main === module) {
  process.on('uncaughtException', (err) => {
    console.log(`Caught exception: ${err}\n`);
    setTimeout(() => {
      process.exit();
    }, 1000 * 60);
  });
  
  const BU = require('base-util-jh').baseUtil;
  global.BU = BU;

  const control = new Control();

  control.init()
    .then(r => {
      console.trace(r);
    })
    .catch(e => {
      console.trace(e);
    });

}