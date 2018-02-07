'use strict';

const Encoder = require('./src/Encoder');
const Decoder = require('./src/Decoder');
module.exports = {
  Encoder, Decoder,
  parser: {
    type: 'delimiterParser',
    option: Buffer.from([0x04])
  }
};


// if __main process
if (require !== undefined && require.main === module) {
  
}