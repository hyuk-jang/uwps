const net = require('net');

const server = net.createServer((socket) => {
  socket.end('goodbye\n');
}).on('error', (err) => {
  // handle errors here
  throw err;
});

// grab an arbitrary unused port.
for(let i = 0; i < 3; i += 1){
  const server = net.createServer((socket) => {
    socket.end('goodbye\n');
  }).on('error', (err) => {
    // handle errors here
    console.error('@@@@', err);
    throw err;
  });
  
  // grab an arbitrary unused port.
  server.listen(Number(`900${i}`), () => {
    console.log('opened server on', server.address());
  });
    
}