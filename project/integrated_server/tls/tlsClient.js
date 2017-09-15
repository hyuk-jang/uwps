// Modules required here
var tls = require('tls'),
    fs = require('fs'),
    util = require('util'),
    events = require('events');

const options = {
    host: "121.178.26.33",
    // host: "localhost",
    port: 8000,
    // Necessary only if using the client certificate authentication
    key: fs.readFileSync('client-key.pem'),
    cert: fs.readFileSync('client-cert.pem'),

    // Necessary only if the server uses the self-signed certificate
    ca: [fs.readFileSync('server-cert.pem')]
    ,rejectUnauthorized:false
    // ,checkServerIdentity: function (host, cert) {
    //     console.log(cert)
    //     return null;
    // }
};

var socket = tls.connect(options, function() {
  console.log('client connected',
              socket.authorized ? 'authorized' : 'unauthorized');
  process.stdin.pipe(socket);
  process.stdin.resume();
});
socket.setEncoding('utf8');
socket.on('data', function(data) {
  console.log(data);
});
socket.on('end', function() {
  server.close();
});

setTimeout(function() {
  socket.write("hey")
}, 1000);