'use strict';
/** Class Controller */
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
  
  const Promise = require('bluebird');
  const _ = require('underscore');
  const BU = require('base-util-jh').baseUtil;
  const bmjh = require('base-model-jh');
  global.BU = BU;

  const control = new Control({
    dailyKwh: 10,
    cpKwh: 30
  });

  control.init()
    .then(r => {
      console.trace(r);
    })
    .catch(e => {
      console.trace(e);
    });

}