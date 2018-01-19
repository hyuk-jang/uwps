'use strict';


const dev = require('./dev');
const dm_v2 = require('./dm_v2');
const baseFormat = require('./baseFormat');
module.exports = {
  dev, dm_v2, baseFormat
};


// if __main process
if (require !== undefined && require.main === module) {
  console.log('this is main process.');
}