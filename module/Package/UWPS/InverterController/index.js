'use strict';

const Control = require('./src/Control');

module.exports = Control;

// if __main process
if (require !== undefined && require.main === module) {
  process.env.NODE_ENV = 'production'


  const _ = require('underscore');
  const config = require('./src/config.js');
  const BU = require('base-util-jh').baseUtil;

  global._ = _;
  global.BU = BU;


  process.on('unhandledRejection', function (reason, p) {
    console.log("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
    // application specific logging here
  });


  let control = new Control(config);
  control.init()
    .then(result => {
      BU.CLI('result')
      return control.measureDevice();
    })
    .then(result => {
      BU.CLI(result)
      BU.CLI(control.model.refineInverterData)
      BU.CLI(control.operationInfo)
    })
    .catch(error => {
      BU.CLI(error)
    })

  setTimeout(() => {
    BU.CLI(control.model.inverterData)
  }, 1000);
}