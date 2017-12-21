'use strict';

const Control = require('./src/Control.js');
module.exports = Control;


// if __main process
if (require !== undefined && require.main === module) {
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
    console.trace(r)
  })
  .catch(e => {
    console.trace(e)
  })

}