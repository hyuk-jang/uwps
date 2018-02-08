'use strict';

const Encoder = require('./src/Encoder');
const Decoder = require('./src/Decoder');
const dummyDataGenerator = require('./src/dummyDataGenerator');
module.exports = {
  Encoder, Decoder, dummyDataGenerator,
  parser: {
    type: 'delimiterParser',
    option: Buffer.from([0x04])
  }
};


// if __main process
if (require !== undefined && require.main === module) {
  const decoder = new Decoder();
  console.dir(decoder);
}