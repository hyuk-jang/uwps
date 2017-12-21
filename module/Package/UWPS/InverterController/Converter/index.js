'use strict';


const dev = require('./dev')
const s_hex = require('./s_hex')

module.exports = {
  dev,
  s_hex
}


// if __main process
if (require !== undefined && require.main === module) {
}