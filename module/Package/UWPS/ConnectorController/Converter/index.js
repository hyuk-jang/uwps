'use strict'


const dev = require('./dev')
const dm_v2 = require('./dm_v2')

module.exports = {
  dev, dm_v2
}


// if __main process
if (require !== undefined && require.main === module) {
}