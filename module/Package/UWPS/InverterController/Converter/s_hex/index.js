'use strict';

const Encoder = require('./src/Encoder');
const Decoder = require('./src/Decoder');
const dummyDataGenerator = require('./src/dummyDataGenerator');
module.exports = {
  Encoder, Decoder, dummyDataGenerator
};


// if __main process
if (require !== undefined && require.main === module) {
  const decoder = new Decoder();
  console.dir(decoder);
}