'use strict';


const dev = require('./dev');
const s_hex = require('./s_hex');
const baseFormat = require('./baseFormat');
module.exports = {
  dev,
  s_hex,
  baseFormat
};

// if __main process
if (require !== undefined && require.main === module) {
  console.log('this is main process');
}
