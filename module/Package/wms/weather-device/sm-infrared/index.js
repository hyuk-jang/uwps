
const SmInfraredControl = require('./src/SmInfraredControl');


module.exports = SmInfraredControl;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
}