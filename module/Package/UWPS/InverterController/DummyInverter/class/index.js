

const SmSocketServer = require('./SmSocketServer');

let smSocketServer = new SmSocketServer(8888);

smSocketServer.createServer()
.then(r => {
  console.log('then',r)

  smSocketServer._onUsefulData(null, 'hi')
})
.catch(err => {
  console.error(err)
})

smSocketServer.on('dataBySocketServer', (err, data) => {
  console.log('dataBySocketServer', data);
})